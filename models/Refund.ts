import { Schema, model, models, Document, Types } from 'mongoose';

export type RefundStatus = 'requested' | 'confirmed' | 'rejected';

export interface IRefund extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  order?: Types.ObjectId;
  amount: number;
  studentName: string;
  phone: string;
  courseTitle: string;
  /** Join/purchase date — drives the 7-day warning. */
  purchaseDate: Date;
  status: RefundStatus;
  requestedBy: Types.ObjectId;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
}

const RefundSchema = new Schema<IRefund>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: Number, required: true, default: 0 },
    studentName: { type: String, default: '' },
    phone: { type: String, default: '' },
    courseTitle: { type: String, default: '' },
    purchaseDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'rejected'],
      default: 'requested',
      index: true,
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Refund = models.Refund ?? model<IRefund>('Refund', RefundSchema);
