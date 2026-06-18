import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Expense } from '@/models/Expense';
import { requirePerm } from '@/lib/permissions.server';

export async function GET() {
  if (!(await requirePerm('accounts.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const expenses = await Expense.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(
    expenses.map((e) => ({
      _id: String(e._id),
      category: e.category,
      subcategory: e.subcategory ?? null,
      amount: e.amount,
      note: e.note ?? null,
      createdAt: e.createdAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  if (!(await requirePerm('accounts.expense'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json();
    await connectDB();

    const category = String(body.category ?? '').trim();
    const subcategory = body.subcategory ? String(body.subcategory).trim() : undefined;
    const amount = Number(body.amount);
    const note = body.note ? String(body.note).trim() : undefined;

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'A valid amount greater than 0 is required' }, { status: 400 });
    }

    const expense = await Expense.create({ category, subcategory, amount, note });
    return NextResponse.json({ _id: String(expense._id) }, { status: 201 });
  } catch (err) {
    console.error('[admin/expenses POST]', err);
    return NextResponse.json({ error: 'Failed to add expense' }, { status: 500 });
  }
}
