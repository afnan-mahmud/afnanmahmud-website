import { requirePage } from '@/lib/permissions.server';
import { can } from '@/lib/permissions';
import WhatsAppInbox from '@/components/whatsapp/WhatsAppInbox';

export const dynamic = 'force-dynamic';

export default async function WhatsAppPage() {
  const access = await requirePage('whatsapp.view');
  const canReply = can(access, 'whatsapp.reply');
  return <WhatsAppInbox canReply={canReply} />;
}
