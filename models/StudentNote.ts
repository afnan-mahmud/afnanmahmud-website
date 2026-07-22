import { Schema, model, models, Document, Types } from 'mongoose';

/**
 * A free-text note an admin keeps about a student — mainly call feedback from
 * chasing abandoned enrollments ("bolechhe next week korbe", "number bondho").
 * Append-only: notes are never edited, so the timeline reads as a call log.
 */
export interface IStudentNote extends Document {
  student: Types.ObjectId;
  /** Admin who wrote it; null if the account was later removed. */
  author?: Types.ObjectId | null;
  /** Name snapshot at write time so the log stays readable regardless of `author`. */
  authorName: string;
  text: string;
  createdAt: Date;
}

const StudentNoteSchema = new Schema<IStudentNote>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, default: 'Admin' },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const StudentNote =
  models.StudentNote ?? model<IStudentNote>('StudentNote', StudentNoteSchema);
