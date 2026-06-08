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

// Cache the bearer token across calls until shortly before it expires.
let tokenCache: { token: string; expiresAt: number } | null = null;

/** API No. 01 — GetToken. Returns a bearer token for the other endpoints. */
async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const userName = process.env.EPS_USERNAME;
  const password = process.env.EPS_PASSWORD;
  if (!userName || !password) {
    throw new Error('EPS_USERNAME / EPS_PASSWORD not configured');
  }

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
    throw new Error(`EPS GetToken failed: ${res.status} — ${text}`);
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

  // Refresh a minute before the server-side expiry to avoid edge-of-expiry failures.
  const expiresAt = data.expireDate
    ? new Date(data.expireDate).getTime() - 60_000
    : Date.now() + 5 * 60_000;
  tokenCache = { token: data.token, expiresAt };

  return data.token;
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
  const token = await getToken();

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

  const initUrl = `${baseUrl()}/v1/EPSEngine/InitializeEPS`;
  // TEMP DEBUG — remove after diagnosing the production 404.
  console.log('[eps:init] EPS_BASE_URL=', JSON.stringify(process.env.EPS_BASE_URL),
    'initUrl=', JSON.stringify(initUrl),
    'tokenLen=', token?.length, 'amount=', params.totalAmount,
    'node=', process.version);

  const res = await fetch(initUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hash': makeHash(params.merchantTransactionId),
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    // TEMP DEBUG
    console.error('[eps:init] FAIL status=', res.status,
      'url=', initUrl,
      'content-type=', res.headers.get('content-type'),
      'location=', res.headers.get('location'),
      'www-authenticate=', res.headers.get('www-authenticate'),
      'bodyLen=', text.length, 'body=', JSON.stringify(text.slice(0, 500)));
    throw new Error(`EPS InitializeEPS failed: ${res.status} — ${text}`);
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

export interface EpsVerifyResult {
  verified: boolean;
  status?: string;
  epsTransactionId?: string;
  totalAmount?: number;
}

/**
 * API No. 03 — CheckMerchantTransactionStatus.
 * Verifies a transaction by the merchantTransactionId we generated.
 */
export async function verifyPayment(merchantTransactionId: string): Promise<EpsVerifyResult> {
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
    return { verified: false };
  }

  const data = (await res.json()) as {
    Status?: string;
    EpsTransactionId?: string;
    TotalAmount?: string;
  };

  const status = data.Status;
  return {
    verified: typeof status === 'string' && status.toLowerCase() === 'success',
    status,
    epsTransactionId: data.EpsTransactionId,
    totalAmount: data.TotalAmount != null ? Number(data.TotalAmount) : undefined,
  };
}

/** Generate a unique, minimum 10-digit merchant transaction id. */
export function newMerchantTransactionId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`;
}
