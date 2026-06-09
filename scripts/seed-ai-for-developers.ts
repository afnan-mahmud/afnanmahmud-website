import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined. Run with: node --env-file=.env.local --env-file=.env');
  process.exit(1);
}

// Inline minimal Course schema (avoids path-alias / ESM import issues when run via node)
const LessonSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    videoId: { type: String, required: true },
    duration: { type: String },
    isPreview: { type: Boolean, default: false },
  },
  { _id: false }
);

const SectionSchema = new mongoose.Schema(
  {
    sectionTitle: { type: String, required: true },
    lessons: { type: [LessonSchema], default: [] },
  },
  { _id: false }
);

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String },
    longDescription: { type: String },
    thumbnail: { type: String },
    previewVideoId: { type: String },
    price: { type: Number, required: true },
    isFree: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    category: { type: String },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    curriculum: { type: [SectionSchema], default: [] },
    enrolledCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Course = mongoose.models.Course ?? mongoose.model('Course', CourseSchema);

const SLUG = 'ai-for-developers';

async function main() {
  await mongoose.connect(MONGODB_URI as string);
  console.log('✅ Connected to MongoDB');

  // Fields that should be set on create, but NOT overwrite an admin's later edits.
  const onInsert = {
    title: 'AI for Developers',
    slug: SLUG,
    shortDescription:
      'AntiGravity, Gemini এবং Claude Code দিয়ে জিরো থেকে প্রোডাকশন গ্রেড Website ও Mobile App বানানো শেখো।',
    longDescription:
      'সম্পূর্ণ ফ্রি AI টুলস ব্যবহার করে Tutorial Hell থেকে বেরিয়ে এসে real, production-grade application বানানোর কমপ্লিট মাস্টারক্লাস। ৭টি লেভেল পার করে জিরো থেকে লাইভ সার্ভার পর্যন্ত।',
    price: 990,
    isFree: false,
    isPublished: true,
    category: 'AI Development',
    level: 'intermediate',
    enrolledCount: 0,
  };

  const existing = await Course.findOne({ slug: SLUG });

  if (existing) {
    // Keep it published & priced as the landing page advertises, but don't wipe curriculum/edits.
    existing.title = onInsert.title;
    existing.price = onInsert.price;
    existing.isPublished = true;
    await existing.save();
    console.log(`✅ Course already existed — updated: ${SLUG} (price ৳${existing.price}, published)`);
  } else {
    const created = await Course.create(onInsert);
    console.log(`✅ Created course: ${created.title} (slug: ${created.slug}, ৳${created.price})`);
  }

  await mongoose.disconnect();
  console.log('✅ Done');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
