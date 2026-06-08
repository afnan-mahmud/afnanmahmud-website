// Standalone EPS probe — run right after the app 404s, to see if the SAME VPS/IP
// still works outside Next (→ EPS-side throttle vs Next-runtime issue).
//   node --env-file=.env.local scripts/eps-probe.mjs
import crypto from 'crypto';
const base = (process.env.EPS_BASE_URL || '').replace(/\/+$/, '');
const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
function makeHash(d) { return crypto.createHmac('sha512', Buffer.from(process.env.EPS_HASH_KEY, 'utf8')).update(d, 'utf8').digest('base64'); }
const userName = process.env.EPS_USERNAME, password = process.env.EPS_PASSWORD;

const tr = await fetch(`${base}/v1/Auth/GetToken`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-hash': makeHash(userName) }, body: JSON.stringify({ userName, password }) });
const token = (await tr.json()).token;
console.log('GetToken HTTP', tr.status, token ? '(ok)' : '(NO TOKEN)');

const mtx = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
const body = { merchantId: process.env.EPS_MERCHANT_ID, storeId: process.env.EPS_STORE_ID, CustomerOrderId: 'probe' + Math.floor(Math.random() * 9999), merchantTransactionId: mtx, transactionTypeId: Number(process.env.EPS_TRANSACTION_TYPE_ID ?? '1'), financialEntityId: 0, transitionStatusId: 0, totalAmount: 990, ipAddress: '0.0.0.0', version: '1', successUrl: `${baseUrl}/api/payment/success?orderId=probe`, failUrl: `${baseUrl}/api/payment/fail?orderId=probe`, cancelUrl: `${baseUrl}/courses/ai-for-developers`, customerName: 'Probe', customerEmail: 'p@noemail.devcourses.bd', CustomerAddress: 'Dhaka, Bangladesh', CustomerAddress2: '', CustomerCity: 'Dhaka', CustomerState: 'Dhaka', CustomerPostcode: '1200', CustomerCountry: 'BD', CustomerPhone: '01700000000', ShippingMethod: 'NO', NoOfItem: '1', ProductName: 'AI for Developers', ProductProfile: 'non-physical-goods', ProductCategory: 'Online Course' };
const r = await fetch(`${base}/v1/EPSEngine/InitializeEPS`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-hash': makeHash(mtx), Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
const text = await r.text();
console.log('InitializeEPS HTTP', r.status);
console.log('headers:', JSON.stringify(Object.fromEntries(r.headers.entries())));
console.log('body:', text.slice(0, 600) || '(empty)');
