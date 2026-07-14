/**
 * Submit (and check the status of) the WhatsApp UTILITY template used for the
 * abandoned-enrollment follow-up message.
 *
 * A business-initiated message to a cold contact needs an approved template
 * (no open 24h window). This creates that template via the WhatsApp Business
 * Management API; approval is Meta's decision. Meta may recategorize a
 * re-engagement message to MARKETING — the send works regardless of category.
 *
 * Run:
 *   node --env-file=.env.local --env-file=.env scripts/submit-whatsapp-followup-template.ts
 *   node --env-file=.env.local --env-file=.env scripts/submit-whatsapp-followup-template.ts --status
 *
 * Needs WHATSAPP_ACCESS_TOKEN (whatsapp_business_management) and
 * WHATSAPP_BUSINESS_ACCOUNT_ID. Keep TEMPLATE_NAME / TEMPLATE_LANG / BODY_TEXT in
 * sync with lib/whatsapp.ts `sendEnrollFollowup`.
 */
export {}; // isolate module scope (this is a standalone script, not global)

const GRAPH_VERSION = 'v21.0';
const TEMPLATE_NAME = 'enroll_followup';
const TEMPLATE_LANG = 'en';
const BODY_TEXT =
  'Assalamualaikum. Amader AI powered software development course er jonno apni ' +
  'enroll korte cheyechilen, kintu enroll shofol hoy ni. Kono shomossa hoyechilo ki?';

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

if (!ACCESS_TOKEN || !WABA_ID) {
  console.error(
    '❌ Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_BUSINESS_ACCOUNT_ID.\n' +
      '   Run with: node --env-file=.env.local --env-file=.env scripts/submit-whatsapp-followup-template.ts'
  );
  process.exit(1);
}

const BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

async function getStatus(): Promise<void> {
  const url = `${BASE}/${WABA_ID}/message_templates?name=${TEMPLATE_NAME}&fields=name,language,status,category,rejected_reason`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('❌ Status lookup failed:', data?.error?.message ?? `HTTP ${res.status}`);
    process.exit(1);
  }
  const rows: Array<Record<string, unknown>> = data?.data ?? [];
  if (rows.length === 0) {
    console.log(`ℹ️  No template named "${TEMPLATE_NAME}" exists yet. Run without --status to create it.`);
    return;
  }
  for (const t of rows) {
    console.log(
      `• ${t.name} [${t.language}] — status: ${t.status}, category: ${t.category}` +
        (t.rejected_reason && t.rejected_reason !== 'NONE' ? ` (reason: ${t.rejected_reason})` : '')
    );
  }
}

async function create(): Promise<void> {
  const body = {
    name: TEMPLATE_NAME,
    language: TEMPLATE_LANG,
    category: 'UTILITY',
    components: [{ type: 'BODY', text: BODY_TEXT }],
  };

  const res = await fetch(`${BASE}/${WABA_ID}/message_templates`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg: string = data?.error?.message ?? `HTTP ${res.status}`;
    if (/already exists/i.test(msg) || data?.error?.error_subcode === 2388023) {
      console.log(`ℹ️  Template "${TEMPLATE_NAME}" already exists. Current status:`);
      await getStatus();
      return;
    }
    console.error('❌ Template creation failed:', msg);
    console.error(JSON.stringify(data?.error ?? data, null, 2));
    process.exit(1);
  }

  console.log(`✅ Submitted template "${TEMPLATE_NAME}" [${TEMPLATE_LANG}].`);
  console.log(`   id: ${data?.id ?? '?'}  status: ${data?.status ?? 'PENDING'}  category: ${data?.category ?? 'UTILITY'}`);
  console.log('   Approval is Meta’s decision; re-run with --status to check. Once');
  console.log('   APPROVED, set WHATSAPP_ABANDONED_ENABLED=true and rebuild/restart.');
}

async function main() {
  if (process.argv.includes('--status')) {
    await getStatus();
  } else {
    await create();
  }
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
