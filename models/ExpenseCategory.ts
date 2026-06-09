import { Schema, model, models, Document } from 'mongoose';

export interface IExpenseCategory extends Document {
  name: string;
  /** Optional sub-categories under this category. */
  subcategories: string[];
  createdAt: Date;
}

const ExpenseCategorySchema = new Schema<IExpenseCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    subcategories: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ExpenseCategory =
  models.ExpenseCategory ?? model<IExpenseCategory>('ExpenseCategory', ExpenseCategorySchema);
