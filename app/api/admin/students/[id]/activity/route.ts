import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Order } from '@/models/Order';
import { StudentNote } from '@/models/StudentNote';
import { WhatsAppContact } from '@/models/WhatsAppContact';
import { WhatsAppMessage } from '@/models/WhatsAppMessage';
import { requirePerm } from '@/lib/permissions.server';
import { localPhoneToWaId, isWithinWindow, isConfigured } from '@/lib/whatsapp';

/**
 * Everything the abandoned-student details view needs, in one round-trip:
 * every payment attempt the student made (a `pending`/`failed` Order means they
 * hit checkout and never finished), the call-note log, and the WhatsApp thread
 * with its 24h-window state so the composer knows whether free-form is allowed.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('students.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();
  void Course; // ensure the Course model is registered for populate()

  const user = await User.findById(id)
    .select('name phone createdAt purchasedCourses')
    .lean<{ name: string; phone: string; createdAt: Date; purchasedCourses: unknown[] }>();
  if (!user) return NextResponse.json({ error: 'Student paoa jayni' }, { status: 404 });

  const [orders, notes] = await Promise.all([
    Order.find({ student: id })
      .sort({ createdAt: -1 })
      .populate<{ course: { title?: string } | null }>('course', 'title')
      .lean<
        {
          _id: unknown;
          course: { title?: string } | null;
          amount: number;
          status: string;
          paymentGateway?: string;
          merchantTransactionId?: string;
          transactionId?: string;
          failReason?: string;
          enrollFollowupSentAt?: Date;
          createdAt: Date;
        }[]
      >(),
    StudentNote.find({ student: id })
      .sort({ createdAt: -1 })
      .lean<{ _id: unknown; text: string; authorName: string; createdAt: Date }[]>(),
  ]);

  const counts = { total: orders.length, pending: 0, failed: 0, success: 0, refunded: 0 };
  for (const o of orders) {
    if (o.status in counts) counts[o.status as keyof typeof counts] += 1;
  }

  // WhatsApp thread — keyed by the wa_id form of the student's stored phone.
  const waId = localPhoneToWaId(user.phone);
  const contact = await WhatsAppContact.findOne({ waId })
    .select('lastInboundAt')
    .lean<{ lastInboundAt?: Date } | null>();
  const messages = contact
    ? await WhatsAppMessage.find({ waId })
        .sort({ timestamp: 1 })
        .limit(200)
        .lean<
          {
            _id: unknown;
            direction: 'in' | 'out';
            type: string;
            text?: string;
            mediaPath?: string;
            mediaMime?: string;
            status?: string;
            error?: string;
            timestamp: Date;
          }[]
        >()
    : [];

  return NextResponse.json({
    student: {
      name: user.name,
      phone: user.phone,
      createdAt: new Date(user.createdAt).toISOString(),
      enrolled: (user.purchasedCourses ?? []).length > 0,
    },
    counts,
    attempts: orders.map((o) => ({
      id: String(o._id),
      courseTitle: o.course?.title ?? 'Unknown course',
      amount: o.amount,
      status: o.status,
      paymentGateway: o.paymentGateway ?? null,
      merchantTransactionId: o.merchantTransactionId ?? null,
      transactionId: o.transactionId ?? null,
      failReason: o.failReason ?? null,
      followupSentAt: o.enrollFollowupSentAt ? new Date(o.enrollFollowupSentAt).toISOString() : null,
      createdAt: new Date(o.createdAt).toISOString(),
    })),
    notes: notes.map((n) => ({
      id: String(n._id),
      text: n.text,
      authorName: n.authorName,
      createdAt: new Date(n.createdAt).toISOString(),
    })),
    whatsapp: {
      waId,
      configured: isConfigured(),
      // Free-form replies are only allowed inside WhatsApp's 24h customer-service
      // window; outside it the UI falls back to the follow-up template.
      canReply: isWithinWindow(contact?.lastInboundAt),
      messages: messages.map((m) => ({
        id: String(m._id),
        direction: m.direction,
        type: m.type,
        text: m.text ?? '',
        mediaPath: m.mediaPath ? `/api/admin/whatsapp/media/${m.mediaPath.split('/').pop()}` : null,
        mediaMime: m.mediaMime ?? null,
        status: m.status ?? null,
        error: m.error ?? null,
        timestamp: new Date(m.timestamp).toISOString(),
      })),
    },
  });
}
