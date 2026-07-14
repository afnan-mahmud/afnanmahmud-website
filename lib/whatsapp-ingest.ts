import 'server-only';
import { connectDB } from './db';
import { User } from '@/models/User';
import { WhatsAppContact } from '@/models/WhatsAppContact';
import { WhatsAppMessage, type WhatsAppMessageType } from '@/models/WhatsAppMessage';
import { downloadMedia, waIdToLocalPhone } from './whatsapp';

/**
 * Persist a WhatsApp webhook payload: inbound messages become `WhatsAppMessage`
 * docs under their `WhatsAppContact`, and delivery statuses update the matching
 * outbound message. Best-effort and idempotent — safe to call on Meta redelivery.
 *
 * Payload shape: entry[].changes[].value.{ contacts[], messages[], statuses[] }.
 */
export async function ingestWebhook(payload: unknown): Promise<void> {
  const entries = (payload as { entry?: unknown[] })?.entry ?? [];
  await connectDB();

  for (const entry of entries) {
    const changes = (entry as { changes?: unknown[] })?.changes ?? [];
    for (const change of changes) {
      const value = (change as { value?: Record<string, unknown> })?.value ?? {};

      // Map wa_id -> profile name from the contacts array (present on inbound).
      const profileByWaId = new Map<string, string>();
      for (const c of (value.contacts as ContactEntry[]) ?? []) {
        if (c?.wa_id) profileByWaId.set(c.wa_id, c.profile?.name ?? '');
      }

      for (const message of (value.messages as InboundMessage[]) ?? []) {
        await handleInbound(message, profileByWaId.get(message.from));
      }

      for (const status of (value.statuses as StatusEntry[]) ?? []) {
        await handleStatus(status);
      }
    }
  }
}

interface ContactEntry {
  wa_id?: string;
  profile?: { name?: string };
}

interface MediaPart {
  id?: string;
  mime_type?: string;
  caption?: string;
  filename?: string;
}

interface InboundMessage {
  from: string;
  id: string;
  timestamp?: string;
  type: string;
  text?: { body?: string };
  image?: MediaPart;
  video?: MediaPart;
  audio?: MediaPart;
  document?: MediaPart;
}

interface StatusEntry {
  id?: string;
  status?: string;
  errors?: { title?: string; message?: string }[];
}

const MEDIA_TYPES = new Set(['image', 'video', 'audio', 'document']);

async function handleInbound(message: InboundMessage, profileName?: string): Promise<void> {
  const waId = message.from;
  if (!waId || !message.id) return;

  // Idempotency: skip if we already stored this WhatsApp message id.
  const existing = await WhatsAppMessage.exists({ waMessageId: message.id });
  if (existing) return;

  const rawType = message.type;
  const type: WhatsAppMessageType = MEDIA_TYPES.has(rawType)
    ? (rawType as WhatsAppMessageType)
    : 'text';

  // Extract text/caption and (for media) download the file.
  let text: string | undefined;
  let mediaPath: string | undefined;
  let mediaMime: string | undefined;

  if (type === 'text') {
    text = message.text?.body;
  } else {
    const part = message[type] as MediaPart | undefined;
    text = part?.caption ?? part?.filename;
    if (part?.id) {
      const media = await downloadMedia(part.id);
      if (media) {
        mediaPath = media.mediaPath;
        mediaMime = media.mediaMime;
      }
    }
  }

  const timestamp = message.timestamp
    ? new Date(Number(message.timestamp) * 1000)
    : new Date();

  // Resolve/create the conversation, matching an enrolled student by phone.
  let student = null;
  const localPhone = waIdToLocalPhone(waId);
  if (localPhone) {
    const user = await User.findOne({ phone: localPhone }).select('_id').lean<{ _id: unknown }>();
    if (user) student = user._id;
  }

  const preview = text || `[${type}]`;

  const contact = await WhatsAppContact.findOneAndUpdate(
    { waId },
    {
      $set: {
        ...(profileName ? { profileName } : {}),
        ...(student ? { student } : {}),
        lastMessageAt: timestamp,
        lastMessageText: preview.slice(0, 200),
        lastInboundAt: timestamp,
      },
      $inc: { unreadCount: 1 },
      $setOnInsert: { waId },
    },
    { upsert: true, new: true }
  );

  await WhatsAppMessage.create({
    contact: contact._id,
    waId,
    waMessageId: message.id,
    direction: 'in',
    type,
    text,
    mediaPath,
    mediaMime,
    timestamp,
  });
}

async function handleStatus(status: StatusEntry): Promise<void> {
  if (!status.id || !status.status) return;
  const allowed = new Set(['sent', 'delivered', 'read', 'failed']);
  if (!allowed.has(status.status)) return;

  const error = status.errors?.[0]
    ? status.errors[0].message ?? status.errors[0].title
    : undefined;

  await WhatsAppMessage.updateOne(
    { waMessageId: status.id, direction: 'out' },
    { $set: { status: status.status, ...(error ? { error } : {}) } }
  );
}
