import crypto from 'crypto';

/**
 * EPS (Easy Payment System) merchant API client.
 * Implements the V5 integration guide: token auth → initialize payment → verify.
 *
 * Hash mechanism (x-hash header):
 *   base64( HMAC-SHA512( key = utf8(HASH_KEY), message = utf8(data) ) )
 * where `data` is the userName (GetToken) or merchantTransactionId
 * (InitializeEPS + CheckMerchantTransactionStatus).
 *
 * Endpoints (relative to EPS_BASE_URL):
 *   POST /v1/Auth/GetToken
 *   POST /v1/EPSEngine/InitializeEPS
 *   GET  /v1/EPSEngine/CheckMerchantTransactionStatus
 */

function baseUrl(): string {
  const url = process.env.EPS_BASE_URL;
  if (!url) throw new Error('EPS_BASE_URL is not configured');
  return url.replace(/\/+$/, '');
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** True when all credentials needed for a live EPS call are present. */
export function epsConfigured(): boolean {
  return Boolean(
    process.env.EPS_BASE_URL &&
      process.env.EPS_USERNAME &&
      process.env.EPS_PASSWORD &&
      process.env.EPS_HASH_KEY &&
      process.env.EPS_MERCHANT_ID &&
      process.env.EPS_STORE_ID
  );
}

/** base64( HMAC-SHA512( utf8(HASH_KEY), utf8(data) ) ) */
function makeHash(data: string): string {
  const hashKey = process.env.EPS_HASH_KEY;
  if (!hashKey) throw new Error('EPS_HASH_KEY is not configured');
  return crypto
    .createHmac('sha512', Buffer.from(hashKey, 'utf8'))
    .update(data, 'utf8')
    .digest('base64');
}

/**
 * Short-lived token cache.
 *
 * History: we used to fetch a fresh token on EVERY EPS call and never cache it,
 * because reusing a token for *minutes* got it rejected at the gateway with a
 * bare 404 ("InitializeEPS failed: 404"). But fetching per-call means a single
 * enroll plus its later verify-poll burst fires many GetToken requests, and EPS
 * now rate-limits that endpoint — surfacing as "GetToken failed: 429" and a
 * broken enroll.
 *
 * The fix caches the token for a short TTL (well under the "minutes" that caused
 * the old 404) so a burst of calls reuses one token, while it still refreshes
 * often enough to never go stale. `invalidateToken()` drops the cache the moment
 * a downstream call smells a stale token, restoring the old per-call freshness
 * exactly when it matters.
 */
const TOKEN_TTL_MS = 90_000;
let cachedToken: { token: string; expiresAt: number } | null = null;
let inFlightToken: Promise<string> | null = null;

/** Drop any cached token so the next getToken() fetches a fresh one. */
function invalidateToken(): void {
  cachedToken = null;
}

/** API No. 01 — GetToken. One raw fetch of a fresh bearer token, with retries. */
async function fetchFreshToken(): Promise<string> {
  const userName = process.env.EPS_USERNAME;
  const password = process.env.EPS_PASSWORD;
  if (!userName || !password) {
    throw new Error('EPS_USERNAME / EPS_PASSWORD not configured');
  }

  // EPS intermittently answers GetToken with a bare 404 (no body) or a transient
  // 5xx. A couple of quick retries turns those one-off glitches into a working
  // token instead of a failed payment verification.
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${baseUrl()}/v1/Auth/GetToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hash': makeHash(userName),
        },
        body: JSON.stringify({ userName, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        const err = new Error(`EPS GetToken failed: ${res.status} — ${text}`) as Error & {
          status?: number;
        };
        err.status = res.status;
        throw err;
      }

      const data = (await res.json()) as {
        token?: string;
        expireDate?: string;
        errorMessage?: string | null;
        errorCode?: string | null;
      };

      if (!data.token) {
        throw new Error(`EPS GetToken returned no token: ${data.errorMessage ?? 'unknown error'}`);
      }

      return data.token;
    } catch (err) {
      lastErr = err;
      // 429 = rate limited. Retrying only adds load and keeps the limit tripped,
      // so give up immediately and let the EPS window clear. Other transient
      // errors (bare 404 / 5xx glitches) still get the quick retry.
      if ((err as { status?: number })?.status === 429) break;
      if (attempt < 2) await sleep(800);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error('EPS GetToken failed');
}

/**
 * Returns a bearer token, served from a short-lived cache when possible. A single
 * in-flight fetch is shared across concurrent callers so a burst of simultaneous
 * enrolls triggers at most one GetToken request instead of one each.
 */
async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  // Dedupe concurrent misses onto one fetch.
  if (inFlightToken) return inFlightToken;

  inFlightToken = fetchFreshToken()
    .then((token) => {
      cachedToken = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
      return token;
    })
    .finally(() => {
      inFlightToken = null;
    });

  return inFlightToken;
}

export interface EpsInitParams {
  /** Unique, minimum 10-digit id we generate and persist for verification. */
  merchantTransactionId: string;
  /** Unique-per-order id (we use the Mongo order id). */
  customerOrderId: string;
  totalAmount: number;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productName: string;
  ipAddress?: string;
}

export interface EpsInitResult {
  /** URL to redirect the buyer to (EPS hosted payment page). */
  paymentUrl: string;
  /** EPS-side transaction id returned by InitializeEPS. */
  epsTransactionId?: string;
}

/** API No. 02 — InitializeEPS. Returns the hosted-page redirect URL. */
export async function initiatePayment(params: EpsInitParams): Promise<EpsInitResult> {
  const merchantId = process.env.EPS_MERCHANT_ID;
  const storeId = process.env.EPS_STORE_ID;
  if (!merchantId || !storeId) {
    throw new Error('EPS_MERCHANT_ID / EPS_STORE_ID not configured');
  }

  // 1 = Web, 2 = Android, 3 = iOS. Configurable in case EPS provisions a different id.
  const transactionTypeId = Number(process.env.EPS_TRANSACTION_TYPE_ID ?? '1');

  const body = {
    merchantId,
    storeId,
    CustomerOrderId: params.customerOrderId,
    merchantTransactionId: params.merchantTransactionId,
    transactionTypeId,
    financialEntityId: 0,
    transitionStatusId: 0,
    totalAmount: params.totalAmount,
    ipAddress: params.ipAddress ?? '0.0.0.0',
    version: '1',
    successUrl: params.successUrl,
    failUrl: params.failUrl,
    cancelUrl: params.cancelUrl,
    customerName: params.customerName,
    customerEmail: params.customerEmail || `${params.customerPhone}@noemail.devcourses.bd`,
    // EPS marks these address fields mandatory; digital courses have no shipping,
    // so we send sensible placeholders.
    CustomerAddress: 'Dhaka, Bangladesh',
    CustomerAddress2: '',
    CustomerCity: 'Dhaka',
    CustomerState: 'Dhaka',
    CustomerPostcode: '1200',
    CustomerCountry: 'BD',
    CustomerPhone: params.customerPhone,
    ShippingMethod: 'NO',
    NoOfItem: '1',
    ProductName: params.productName,
    ProductProfile: 'non-physical-goods',
    ProductCategory: 'Online Course',
  };

  // A cached token that has gone stale is rejected here with a 404. Recover once
  // by dropping the cache and retrying with a guaranteed-fresh token.
  let res: Response | undefined;
  let text = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await getToken();
    res = await fetch(`${baseUrl()}/v1/EPSEngine/InitializeEPS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hash': makeHash(params.merchantTransactionId),
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) break;

    text = await res.text();
    if (res.status === 404 && attempt === 0) {
      invalidateToken();
      continue;
    }
    throw new Error(`EPS InitializeEPS failed: ${res.status} — ${text}`);
  }

  if (!res || !res.ok) {
    throw new Error(`EPS InitializeEPS failed: ${res?.status ?? 'no response'} — ${text}`);
  }

  const data = (await res.json()) as {
    TransactionId?: string;
    RedirectURL?: string;
    ErrorMessage?: string;
    ErrorCode?: string | null;
  };

  if (!data.RedirectURL) {
    throw new Error(`EPS InitializeEPS returned no RedirectURL: ${data.ErrorMessage ?? 'unknown error'}`);
  }

  return { paymentUrl: data.RedirectURL, epsTransactionId: data.TransactionId };
}

/**
 * Tri-state outcome of a verification:
 *   - 'success' — EPS confirms the charge completed.
 *   - 'failed'  — EPS reports a terminal failure (declined/cancelled/expired/…).
 *   - 'pending' — not yet final OR a transient error (HTTP/token glitch, status
 *                 not yet settled). NEVER treat this as a hard failure: the buyer
 *                 may well have been charged. Retry now / reconcile later.
 */
export type EpsVerifyOutcome = 'success' | 'failed' | 'pending';

export interface EpsVerifyResult {
  outcome: EpsVerifyOutcome;
  status?: string;
  epsTransactionId?: string;
  totalAmount?: number;
}

/**
 * EPS status strings that mean the transaction is conclusively dead. Anything
 * that is neither "success" nor one of these (including unknown/empty values or
 * a transient HTTP error) is treated as still-pending so a charged-but-not-yet-
 * settled payment is never written off.
 */
const TERMINAL_FAILURE_STATUSES = new Set([
  'failed',
  'failure',
  'fail',
  'cancel',
  'cancelled',
  'canceled',
  'declined',
  'decline',
  'rejected',
  'reject',
  'expired',
  'void',
  'voided',
  'unsuccessful',
  'error',
]);

/** Single CheckMerchantTransactionStatus call. Transient errors → 'pending'. */
async function checkStatusOnce(merchantTransactionId: string): Promise<EpsVerifyResult> {
  const token = await getToken();

  const url = new URL(`${baseUrl()}/v1/EPSEngine/CheckMerchantTransactionStatus`);
  url.searchParams.set('merchantTransactionId', merchantTransactionId);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-hash': makeHash(merchantTransactionId),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    // Transient gateway error — not a decision. It may be a stale cached token
    // (surfaces as 404), so drop the cache and let the caller's next poll fetch
    // a fresh one. Either way this is not a verdict; retry/reconcile.
    invalidateToken();
    return { outcome: 'pending' };
  }

  const data = (await res.json()) as {
    Status?: string;
    EpsTransactionId?: string;
    TotalAmount?: string;
  };

  const status = data.Status;
  const norm = typeof status === 'string' ? status.trim().toLowerCase() : '';

  let outcome: EpsVerifyOutcome;
  if (norm === 'success') outcome = 'success';
  else if (TERMINAL_FAILURE_STATUSES.has(norm)) outcome = 'failed';
  else outcome = 'pending';

  return {
    outcome,
    status,
    epsTransactionId: data.EpsTransactionId,
    totalAmount: data.TotalAmount != null ? Number(data.TotalAmount) : undefined,
  };
}

/**
 * API No. 03 — CheckMerchantTransactionStatus.
 * Verifies a transaction by the merchantTransactionId we generated.
 *
 * Because EPS settles the status a beat after it redirects the buyer back (and
 * because there is no IPN/webhook in the V5 API), we poll a few times: a result
 * is only returned early once it is conclusive ('success' or 'failed'). A still-
 * 'pending' result after all attempts is handed back as-is for the reconciler.
 */
export async function verifyPayment(
  merchantTransactionId: string,
  opts?: { retries?: number; retryDelayMs?: number }
): Promise<EpsVerifyResult> {
  const retries = opts?.retries ?? 3;
  const retryDelayMs = opts?.retryDelayMs ?? 1500;

  let last: EpsVerifyResult = { outcome: 'pending' };
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      last = await checkStatusOnce(merchantTransactionId);
    } catch {
      // Token fetch / network failure — transient, keep polling.
      last = { outcome: 'pending' };
    }
    if (last.outcome !== 'pending') return last;
    if (attempt < retries) await sleep(retryDelayMs);
  }
  return last;
}

/** Generate a unique, minimum 10-digit merchant transaction id. */
export function newMerchantTransactionId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`;
}
