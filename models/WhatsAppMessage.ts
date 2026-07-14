import { Schema, model, models, Document, Types } from 'mongoose';

export type WhatsAppMessageType = 'text' | 'image' | 'video' | 'audio' | 'document';
export type WhatsAppMessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

/**
 * One document per WhatsApp message, inbound or outbound. `waMessageId` is the
 * WhatsApp-assigned id — unique so redelivered webhooks are idempotent and so
 * delivery-status callbacks can be correlated to the outbound message.
 */
export interface IWhatsAppMessage extends Document {
  contact: Types.ObjectId;
  /** Denormalized customer phone for simple per-thread queries. */
  waId: string;
  waMessageId?: string;
  direction: 'in' | 'out';
  type: WhatsAppMessageType;
  text?: string;
  /** Local URL for downloaded media, e.g. `/uploads/whatsapp/<file>`. */
  mediaPath?: string;
  mediaMime?: string;
  /** Outbound only. */
  status?: WhatsAppMessageStatus;
  error?: string;
  /** Message time (from WhatsApp for inbound, send time for outbound). */
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppMessageSchema = new Schema<IWhatsAppMessage>(
  {
    contact: { type: Schema.Types.ObjectId, ref: 'WhatsAppContact', required: true, index: true },
    waId: { type: String, required: true, index: true },
    waMessageId: { type: String, unique: true, sparse: true },
    direction: { type: String, enum: ['in', 'out'], required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document'],
      default: 'text',
    },
    text: { type: String },
    mediaPath: { type: String },
    mediaMime: { type: String },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'] },
    error: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const WhatsAppMessage =
  models.WhatsAppMessage ?? model<IWhatsAppMessage>('WhatsAppMessage', WhatsAppMessageSchema);
