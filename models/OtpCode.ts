import { Schema, model, models, Document } from 'mongoose';

export interface IOtpCode extends Document {
  phone: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  /** Wrong-guess counter; the code is burned once this hits the cap. */
  attempts: number;
}

const OtpCodeSchema = new Schema<IOtpCode>(
  {
    phone: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-purge codes once they expire (TTL index on the expiry timestamp).
OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpCode = models.OtpCode ?? model<IOtpCode>('OtpCode', OtpCodeSchema);
