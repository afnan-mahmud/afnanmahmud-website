// Data-driven EPS diagnostic — replicates the EXACT body the enroll route sends,
// using the real course from the production DB, to isolate which field 404s.
//   node --env-file=.env.local scripts/eps-diag2.mjs
import crypto from 'crypto';
import mongoose from 'mongoose';

const SLUG = 'ai-for-developers';
const base = (process.env.EPS_BASE_URL || '').replace(/\/+$/, '');
const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

function makeHash(d) {
  return crypto.createHmac('sha512', Buffer.from(process.env.EPS_HASH_KEY, 'utf8')).update(d, 'utf8').digest('base64');
}

// --- pull the real course from the production DB ---
await mongoose.connect(process.env.MONGODB_URI);
const course = await mongoose.connection.db.collection('courses').findOne({ slug: SLUG });
if (!course) { console.log('Course not found for slug', SLUG); process.exit(1); }
console.log('=== course from PROD DB ===');
console.log('title       =', JSON.stringify(course.title), ' (type', typeof course.title + ')');
console.log('price       =', JSON.stringify(course.price), ' (type', typeof course.price + ')');
console.log('isPublished =', course.isPublished);
console.log('NEXTAUTH_URL=', baseUrl);
console.log('EPS base    =', base);

// --- get token ---
const userName = process.env.EPS_USERNAME, password = process.env.EPS_PASSWORD;
const tr = await fetch(`${base}/v1/Auth/GetToken`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-hash': makeHash(userName) }, body: JSON.stringify({ userName, password }) });
const token = (await tr.json()).token;
console.log('\nGetToken HTTP', tr.status, token ? '(token ok)' : '(NO TOKEN)');

async function tryInit(label, over = {}) {
  const mtx = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const body = {
    merchantId: process.env.EPS_MERCHANT_ID,
    storeId: process.env.EPS_STORE_ID,
    CustomerOrderId: 'diag' + Math.floor(Math.random() * 9999),
    merchantTransactionId: mtx,
    transactionTypeId: Number(process.env.EPS_TRANSACTION_TYPE_ID ?? '1'),
    financialEntityId: 0,
    transitionStatusId: 0,
    totalAmount: course.price,                                  // <-- real price (route uses course.price)
    ipAddress: '0.0.0.0',
    version: '1',
    successUrl: `${baseUrl}/api/payment/success?orderId=diag`,
    failUrl: `${baseUrl}/api/payment/fail?orderId=diag`,
    cancelUrl: `${baseUrl}/courses/${SLUG}`,
    customerName: 'Diag Test',
    customerEmail: '01700000000@noemail.devcourses.bd',
    CustomerAddress: 'Dhaka, Bangladesh', CustomerAddress2: '', CustomerCity: 'Dhaka', CustomerState: 'Dhaka',
    CustomerPostcode: '1200', CustomerCountry: 'BD', CustomerPhone: '01700000000', ShippingMethod: 'NO', NoOfItem: '1',
    ProductName: course.title,                                  // <-- real title (route uses course.title)
    ProductProfile: 'non-physical-goods', ProductCategory: 'Online Course',
    ...over,
  };
  const r = await fetch(`${base}/v1/EPSEngine/InitializeEPS`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hash': makeHash(mtx), Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  const ok = r.status === 200 && text.includes('RedirectURL');
  console.log(`\n### ${label}: HTTP ${r.status} ${ok ? 'OK ✅' : '❌'}`);
  console.log('   totalAmount=', JSON.stringify(body.totalAmount), ' ProductName=', JSON.stringify(body.ProductName));
  console.log('   body resp:', text.slice(0, 300) || '(empty)');
}

// 1) EXACT route body (real title + real price) — should reproduce the 404 if data is the cause
await tryInit('A) real course.title + real course.price (mirrors route)');
// 2) isolate price: safe title, real price
await tryInit('B) safe title, real price', { ProductName: 'AI for Developers' });
// 3) isolate title: real title, numeric price
await tryInit('C) real title, Number(price)', { totalAmount: Number(course.price) });
// 4) both safe (known-good baseline)
await tryInit('D) safe title + numeric price (baseline)', { ProductName: 'AI for Developers', totalAmount: Number(course.price) });

await mongoose.disconnect();
