/**
 * Designate the admin panel owner(s) explicitly. The given phone number(s)
 * become full-access owners (isOwner:true); every other admin is set to an
 * explicit scoped admin (isOwner:false) governed by their `permissions`.
 *
 *   node --env-file=.env.local --env-file=.env scripts/set-owner.ts 01XXXXXXXXX [01YYYYYYYYY ...]
 *
 * Run once after upgrading to the RBAC release. Safe to re-run.
 */
import mongoose from 'mongoose';

function normalisePhone(p: string): string {
  return p.replace(/[\s\-]/g, '').replace(/^\+?880/, '0');
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  const phones = process.argv.slice(2).map(normalisePhone).filter(Boolean);
  if (phones.length === 0) {
    console.error('Usage: set-owner.ts <phone> [phone ...]');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error('no db handle');
  const users = db.collection('users');

  // Owners.
  const ownerRes = await users.updateMany(
    { role: 'admin', phone: { $in: phones } },
    { $set: { isOwner: true } }
  );
  // Everyone else among admins → explicit scoped (not owner).
  const scopedRes = await users.updateMany(
    { role: 'admin', phone: { $nin: phones } },
    { $set: { isOwner: false } }
  );

  console.log(`Owners set (phones ${phones.join(', ')}): matched ${ownerRes.matchedCount}, modified ${ownerRes.modifiedCount}`);
  console.log(`Other admins set to scoped: matched ${scopedRes.matchedCount}, modified ${scopedRes.modifiedCount}`);

  // Show the resulting state.
  const admins = await users.find({ role: 'admin' }).project({ name: 1, phone: 1, isOwner: 1, permissions: 1 }).toArray();
  console.log('\nResulting admins:');
  for (const a of admins) {
    console.log(`  ${a.isOwner ? 'OWNER ' : 'scoped'} | ${a.phone} | ${a.name} | perms: ${JSON.stringify(a.permissions ?? [])}`);
  }

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
