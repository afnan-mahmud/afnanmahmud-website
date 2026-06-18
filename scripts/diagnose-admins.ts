/**
 * Read-only diagnostic: list every admin user with their raw isOwner flag and
 * granted permissions, to debug why a scoped admin sees more than granted.
 *   node --env-file=.env.local --env-file=.env scripts/diagnose-admins.ts
 */
import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  if (!db) throw new Error('no db handle');
  const admins = await db.collection('users')
    .find({ role: 'admin' })
    .project({ name: 1, phone: 1, isOwner: 1, permissions: 1, createdAt: 1 })
    .sort({ createdAt: 1 })
    .toArray();

  console.log(`\nFound ${admins.length} admin(s):\n`);
  for (const a of admins) {
    console.log('— name:', a.name);
    console.log('  phone:', a.phone);
    console.log('  isOwner field present?:', Object.prototype.hasOwnProperty.call(a, 'isOwner'), '| value:', JSON.stringify(a.isOwner));
    console.log('  permissions:', JSON.stringify(a.permissions));
    console.log('  createdAt:', a.createdAt);
    console.log('');
  }

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
