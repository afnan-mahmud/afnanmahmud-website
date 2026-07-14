import { Schema, model, models, Document, Types } from 'mongoose';

/**
 * One document per WhatsApp conversation (keyed by the customer's phone).
 * Holds the denormalized bits the inbox list needs without scanning messages:
 * last-message preview, unread count, and `lastInboundAt` which drives the
 * 24-hour free-form reply window enforced when the admin replies.
 */
export interface IWhatsAppContact extends Document {
  /** Customer's WhatsApp phone in wa_id form (digits, e.g. `8801…`). */
  waId: string;
  profileName?: string;
  /** Matched enrolled user, if the phone belongs to one. */
  student?: Types.ObjectId | null;
  lastMessageAt: Date;
  lastMessageText?: string;
  /** Time of the customer's most recent inbound message (24h window). */
  lastInboundAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppContactSchema = new Schema<IWhatsAppContact>(
  {
    waId: { type: String, required: true, unique: true },
    profileName: { type: String },
    student: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastMessageText: { type: String },
    lastInboundAt: { type: Date },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WhatsAppContact =
  models.WhatsAppContact ?? model<IWhatsAppContact>('WhatsAppContact', WhatsAppContactSchema);
