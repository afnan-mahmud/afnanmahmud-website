import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export interface IProgress {
  courseId: Types.ObjectId;
  completedLessons: string[];
}

export interface IDeviceSession {
  deviceClass: 'mobile' | 'desktop';
  sessionId: string;
  userAgent?: string;
  lastLogin: Date;
}

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: 'student' | 'admin';
  /** Admin team: true = full-access owner (can manage the team). */
  isOwner?: boolean;
  /** Admin team: granted per-action permission strings (see lib/permissions). */
  permissions: string[];
  purchasedCourses: Types.ObjectId[];
  progress: IProgress[];
  deviceSessions: IDeviceSession[];
  createdAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: { type: [String], default: [] },
  },
  { _id: false }
);

const DeviceSessionSchema = new Schema<IDeviceSession>(
  {
    deviceClass: { type: String, enum: ['mobile', 'desktop'], required: true },
    sessionId: { type: String, required: true },
    userAgent: { type: String },
    lastLogin: { type: Date, default: Date.now },
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
    // No default for isOwner: legacy admins read as `undefined` so getAccess can
    // detect and promote them once. Team-created admins set it to false explicitly.
    isOwner: { type: Boolean },
    permissions: { type: [String], default: [] },
    purchasedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    progress: { type: [ProgressSchema], default: [] },
    deviceSessions: { type: [DeviceSessionSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = models.User ?? model<IUser>('User', UserSchema);
