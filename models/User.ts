import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export interface IProgress {
  courseId: Types.ObjectId;
  completedLessons: string[];
}

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: 'student' | 'admin';
  purchasedCourses: Types.ObjectId[];
  progress: IProgress[];
  createdAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: { type: [String], default: [] },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    purchasedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    progress: { type: [ProgressSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = models.User ?? model<IUser>('User', UserSchema);
