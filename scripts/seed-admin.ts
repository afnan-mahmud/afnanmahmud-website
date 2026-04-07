/**
 * Seed script: creates or promotes a user to admin role.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/seed-admin.ts
 *
 * Or with dotenv:
 *   DOTENV_CONFIG_PATH=.env.local npx ts-node -r dotenv/config -r tsconfig-paths/register scripts/seed-admin.ts
 */

import mongoose from 'mongoose';

// ── Config ─────────────────────────────────────────────────────────────────
const ADMIN_PHONE = '01820967062'; // Change this to your phone number
const ADMIN_NAME = 'Afnan Mahmud';
const MONGODB_URI = process.env.MONGODB_URI ?? '';

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set.');
  console.error('Run: MONGODB_URI="your-uri" npx ts-node scripts/seed-admin.ts');
  process.exit(1);
}

// ── User model (inline to avoid circular import issues in scripts) ──────────
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    progress: { type: Array, default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

interface IUserDoc {
  name: string;
  phone: string;
  role: string;
  [key: string]: unknown;
}

const UserModel =
  (mongoose.models.User as mongoose.Model<IUserDoc>) ??
  mongoose.model<IUserDoc>('User', UserSchema);

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const existing = await UserModel.findOne({ phone: ADMIN_PHONE });

  if (existing) {
    await UserModel.updateOne({ phone: ADMIN_PHONE }, { $set: { role: 'admin', name: ADMIN_NAME } });
    console.log(`✅ Promoted existing user to admin: ${ADMIN_PHONE}`);
  } else {
    await UserModel.create({ name: ADMIN_NAME, phone: ADMIN_PHONE, role: 'admin' });
    console.log(`✅ Created admin user: ${ADMIN_PHONE} (${ADMIN_NAME})`);
  }

  console.log('');
  console.log('Done! You can now log in with:');
  console.log(`  Phone: ${ADMIN_PHONE}`);
  console.log('  (Request OTP via the login page)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
