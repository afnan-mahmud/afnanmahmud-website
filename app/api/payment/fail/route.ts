import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orderId = searchParams.get('orderId');
  const failReason = searchParams.get('reason') ?? 'payment_cancelled';

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=${failReason}`);
  }

  try {
    await connectDB();

    const order = await Order.findById(orderId).populate<{ course: { slug: string } }>('course');
    if (order) {
      await Order.findByIdAndUpdate(orderId, {
        status: 'failed',
        failReason,
      });
    }

    const slug = order?.course?.slug ?? '';
    return NextResponse.redirect(
      `${baseUrl}/payment/failed?reason=${failReason}${slug ? `&course=${slug}` : ''}`
    );
  } catch (err) {
    console.error('[payment/fail]', err);
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=server_error`);
  }
}
