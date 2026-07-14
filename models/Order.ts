import { Schema, model, models, Document, Types } from 'mongoose';

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
  status: 'pending' | 'success' | 'failed' | 'refunded';
  failReason?: string;
  /** When the abandoned-enrollment WhatsApp follow-up was sent (dedupe flag). */
  enrollFollowupSentAt?: Date;
  createdAt: Date;
}

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
