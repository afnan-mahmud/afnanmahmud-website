import { Schema, model, models, Document } from 'mongoose';

export interface IOtpCode extends Document {
  phone: string;
  code: string;
  expiresAt: Date;
  used: boolean;
}

const OtpCodeSchema = new Schema<IOtpCode>({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

export const OtpCode = models.OtpCode ?? model<IOtpCode>('OtpCode', OtpCodeSchema);
