import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ExpenseCategory } from '@/models/ExpenseCategory';
import { requirePerm } from '@/lib/permissions.server';

export async function GET() {
  if (!(await requirePerm('accounts.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const categories = await ExpenseCategory.find().sort({ name: 1 }).lean();
  return NextResponse.json(
    categories.map((c) => ({
      _id: String(c._id),
      name: c.name,
      subcategories: c.subcategories ?? [],
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

    // Add a sub-category to an existing category.
    if (body.action === 'subcategory') {
      const { categoryId, name } = body;
      const sub = String(name ?? '').trim();
      if (!categoryId || !sub) {
        return NextResponse.json({ error: 'Category and sub-category name required' }, { status: 400 });
      }
      const cat = await ExpenseCategory.findByIdAndUpdate(
        categoryId,
        { $addToSet: { subcategories: sub } },
        { new: true }
      ).lean();
      if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      return NextResponse.json({ _id: String(cat._id), name: cat.name, subcategories: cat.subcategories ?? [] });
    }

    // Create a new category.
    const name = String(body.name ?? '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Category name required' }, { status: 400 });
    }
    const existing = await ExpenseCategory.findOne({ name }).lean();
    if (existing) {
      return NextResponse.json(
        { _id: String(existing._id), name: existing.name, subcategories: existing.subcategories ?? [] },
        { status: 200 }
      );
    }
    const created = await ExpenseCategory.create({ name });
    return NextResponse.json(
      { _id: String(created._id), name: created.name, subcategories: created.subcategories ?? [] },
      { status: 201 }
    );
  } catch (err) {
    console.error('[admin/expense-categories POST]', err);
    return NextResponse.json({ error: 'Failed to save category' }, { status: 500 });
  }
}
