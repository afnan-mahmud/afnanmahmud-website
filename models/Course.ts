import { Schema, model, models, Document } from 'mongoose';

export interface ILesson {
  _id: string;
  title: string;
  videoId: string;
  duration: string;
  isPreview: boolean;
  note?: string;
}

export interface ISection {
  sectionTitle: string;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  thumbnail?: string;
  previewVideoId?: string;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  category?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  curriculum: ISection[];
  enrolledCount: number;
  createdAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    videoId: { type: String, required: true },
    duration: { type: String },
    isPreview: { type: Boolean, default: false },
    note: { type: String },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    sectionTitle: { type: String, required: true },
    lessons: { type: [LessonSchema], default: [] },
  },
  { _id: false }
);

const CourseSchema = new Schema<ICourse>(
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
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    curriculum: { type: [SectionSchema], default: [] },
    enrolledCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Course = models.Course ?? model<ICourse>('Course', CourseSchema);
