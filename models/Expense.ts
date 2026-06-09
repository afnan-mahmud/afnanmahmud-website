import { Schema, model, models, Document } from 'mongoose';

export interface IExpense extends Document {
  /** Category name snapshot (kept on the record so the ledger survives category edits). */
  category: string;
  /** Optional sub-category name snapshot. */
  subcategory?: string;
  amount: number;
  note?: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Expense = models.Expense ?? model<IExpense>('Expense', ExpenseSchema);
