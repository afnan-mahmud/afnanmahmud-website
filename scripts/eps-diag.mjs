// EPS connectivity diagnostic — run ON the VPS to see exactly where InitializeEPS 404s.
//   node --env-file=.env.local scripts/eps-diag.mjs
// Prints the resolved base URL, GetToken result, and the raw InitializeEPS response.
import crypto from 'crypto';

const base = (process.env.EPS_BASE_URL || '').replace(/\/+$/, '');
console.log('EPS_BASE_URL (resolved) =', JSON.stringify(process.env.EPS_BASE_URL));
console.log('base (trimmed)          =', base);
console.log('EPS_MERCHANT_ID set?    =', Boolean(process.env.EPS_MERCHANT_ID));
console.log('EPS_STORE_ID set?       =', Boolean(process.env.EPS_STORE_ID));
console.log('EPS_TRANSACTION_TYPE_ID =', process.env.EPS_TRANSACTION_TYPE_ID ?? '(unset → 1)');
console.log('NEXTAUTH_URL            =', process.env.NEXTAUTH_URL);

function makeHash(data) {
  return crypto
    .createHmac('sha512', Buffer.from(process.env.EPS_HASH_KEY, 'utf8'))
    .update(data, 'utf8')
    .digest('base64');
}

const userName = process.env.EPS_USERNAME;
const password = process.env.EPS_PASSWORD;

// --- GetToken ---
const tokenUrl = `${base}/v1/Auth/GetToken`;
console.log('\n=== GetToken →', tokenUrl, '===');
let token;
try {
  const r = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hash': makeHash(userName) },
    body: JSON.stringify({ userName, password }),
  });
  const body = await r.text();
  console.log('HTTP', r.status);
  console.log('body:', body.slice(0, 400));
  try { token = JSON.parse(body).token; } catch {}
} catch (e) {
  console.log('THREW:', e.message);
  process.exit(1);
}
if (!token) { console.log('No token — stopping.'); process.exit(1); }

// --- InitializeEPS (mirrors lib/eps.ts exactly) ---
const initUrl = `${base}/v1/EPSEngine/InitializeEPS`;
console.log('\n=== InitializeEPS →', initUrl, '===');
const mtx = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
const body = {
  merchantId: process.env.EPS_MERCHANT_ID,
  storeId: process.env.EPS_STORE_ID,
  CustomerOrderId: 'diag' + Math.floor(Math.random() * 9999),
  merchantTransactionId: mtx,
  transactionTypeId: Number(process.env.EPS_TRANSACTION_TYPE_ID ?? '1'),
  financialEntityId: 0,
  transitionStatusId: 0,
  totalAmount: 990,
  ipAddress: '0.0.0.0',
  version: '1',
  successUrl: `${process.env.NEXTAUTH_URL}/api/payment/success?orderId=diag`,
  failUrl: `${process.env.NEXTAUTH_URL}/api/payment/fail?orderId=diag`,
  cancelUrl: `${process.env.NEXTAUTH_URL}/courses/ai-for-developers`,
  customerName: 'Diag Test',
  customerEmail: '01700000000@noemail.devcourses.bd',
  CustomerAddress: 'Dhaka, Bangladesh',
  CustomerAddress2: '',
  CustomerCity: 'Dhaka',
  CustomerState: 'Dhaka',
  CustomerPostcode: '1200',
  CustomerCountry: 'BD',
  CustomerPhone: '01700000000',
  ShippingMethod: 'NO',
  NoOfItem: '1',
  ProductName: 'AI for Developers',
  ProductProfile: 'non-physical-goods',
  ProductCategory: 'Online Course',
};
try {
  const r = await fetch(initUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hash': makeHash(mtx),
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  console.log('HTTP', r.status);
  console.log('content-type:', r.headers.get('content-type'));
  console.log('body:', (await r.text()).slice(0, 800) || '(empty)');
} catch (e) {
  console.log('THREW:', e.message);
}
