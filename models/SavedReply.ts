import { Schema, model, models, Document, Types } from 'mongoose';

/**
 * A canned WhatsApp reply the support team reuses ("Payment problem", "Course
 * details" …). Shared across the whole admin team — not per-admin — so everyone
 * answers with the same wording.
 */
export interface ISavedReply extends Document {
  /** Short label shown in the picker. */
  title: string;
  /** The message body inserted into the composer. */
  text: string;
  createdBy?: Types.ObjectId | null;
  createdAt: Date;
}

const SavedReplySchema = new Schema<ISavedReply>(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SavedReply =
  models.SavedReply ?? model<ISavedReply>('SavedReply', SavedReplySchema);
