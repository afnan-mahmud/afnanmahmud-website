import { Schema, model, models, Document, Types } from 'mongoose';

/**
 * Browser context captured at order-creation time (the enroll POST), replayed by
 * the fulfillment path when no live request signals exist — i.e. the
 * reconciliation cron, whose buyers closed the tab before the EPS redirect.
 * Without this their Purchase reaches Meta with no UA/IP/fbp/fbc and matches at
 * ~zero quality.
 */
export interface IOrderCapturedSignals {
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  /** The owned landing-page URL the enrollment started from. */
  eventSourceUrl?: string;
}

export interface IOrder extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  amount: number;
  currency: string;
  paymentGateway: string;
  /** Unique min-10-digit id we generate and send to EPS; used for verification. */
  merchantTransactionId?: string;
  /** EPS-side transaction id returned on success. */
  transactionId?: string;
  epsOrderId?: string;
  /**
   * Meta Purchase event_id, minted once when the order first transitions to
   * success and never changed. Every replay of the success/status endpoints
   * returns this same id so the browser Purchase always deduplicates against
   * the single CAPI Purchase.
   */
  metaPurchaseEventId?: string;
  /** Meta browser signals captured at enroll; absent on orders created before this field existed. */
  capturedSignals?: IOrderCapturedSignals;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  failReason?: string;
  /** When the abandoned-enrollment WhatsApp follow-up was sent (dedupe flag). */
  enrollFollowupSentAt?: Date;
  createdAt: Date;
}

const CapturedSignalsSchema = new Schema<IOrderCapturedSignals>(
  {
    fbp: { type: String },
    fbc: { type: String },
    clientIpAddress: { type: String },
    clientUserAgent: { type: String },
    eventSourceUrl: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    paymentGateway: { type: String, default: 'eps' },
    merchantTransactionId: { type: String, index: true },
    transactionId: { type: String },
    epsOrderId: { type: String },
    metaPurchaseEventId: { type: String, default: null },
    // No default: old orders simply have no sub-document, and the fulfillment
    // path treats a missing one as "no stored signals".
    capturedSignals: { type: CapturedSignalsSchema, default: undefined },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    failReason: { type: String },
    enrollFollowupSentAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Order = models.Order ?? model<IOrder>('Order', OrderSchema);
