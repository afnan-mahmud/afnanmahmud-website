import { Schema, model, models, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  amount: number;
  currency: string;
  paymentGateway: string;
  transactionId?: string;
  epsOrderId?: string;
  status: 'pending' | 'success' | 'failed';
  failReason?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    paymentGateway: { type: String, default: 'eps' },
    transactionId: { type: String },
    epsOrderId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    failReason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Order = models.Order ?? model<IOrder>('Order', OrderSchema);
