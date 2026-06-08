// Hit the running app's enroll route locally (no shell-quoting headaches).
//   node scripts/hit-enroll.mjs
const r = await fetch('http://localhost:3000/api/enroll/landing', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ name: 'DiagTest', phone: '01799000555', slug: 'ai-for-developers' }),
});
console.log('HTTP', r.status);
console.log(await r.text());
