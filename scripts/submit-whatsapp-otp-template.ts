/**
 * Submit (and check the status of) the WhatsApp authentication template used for
 * login OTP delivery.
 *
 * WhatsApp does not allow free-form text as a first-contact message, so login
 * OTPs must go through an approved AUTHENTICATION template. This script creates
 * that template via the WhatsApp Business Management API; approval is Meta's
 * decision (authentication templates are usually auto-approved within minutes).
 *
 * Run:
 *   node --env-file=.env.local --env-file=.env scripts/submit-whatsapp-otp-template.ts
 *   node --env-file=.env.local --env-file=.env scripts/submit-whatsapp-otp-template.ts --status
 *
 * Needs WHATSAPP_ACCESS_TOKEN (with whatsapp_business_management permission) and
 * WHATSAPP_BUSINESS_ACCOUNT_ID. Keep TEMPLATE_NAME / TEMPLATE_LANG in sync with
 * lib/whatsapp.ts `sendOtpTemplate`.
 */

const GRAPH_VERSION = 'v21.0';
const TEMPLATE_NAME = 'login_otp';
const TEMPLATE_LANG = 'en_US';

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

if (!ACCESS_TOKEN || !WABA_ID) {
  console.error(
    '❌ Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_BUSINESS_ACCOUNT_ID.\n' +
      '   Run with: node --env-file=.env.local --env-file=.env scripts/submit-whatsapp-otp-template.ts'
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
      `• ${t.name} [${t.language}] — status: ${t.status}` +
        (t.rejected_reason && t.rejected_reason !== 'NONE' ? ` (reason: ${t.rejected_reason})` : '')
    );
  }
}

async function create(): Promise<void> {
  const body = {
    name: TEMPLATE_NAME,
    language: TEMPLATE_LANG,
    category: 'AUTHENTICATION',
    components: [
      { type: 'BODY', add_security_recommendation: true },
      { type: 'FOOTER', code_expiration_minutes: 5 },
      { type: 'BUTTONS', buttons: [{ type: 'OTP', otp_type: 'COPY_CODE' }] },
    ],
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
    // A template with this name+language already exists — treat as success and
    // just report its current status instead of failing.
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
  console.log(`   id: ${data?.id ?? '?'}  status: ${data?.status ?? 'PENDING'}  category: ${data?.category ?? 'AUTHENTICATION'}`);
  console.log('   Approval is Meta’s decision; re-run with --status to check.');
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
