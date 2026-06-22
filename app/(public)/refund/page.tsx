import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Refund Policy — Afnan Mahmud',
  description: 'Our 7-day, no-questions-asked money-back guarantee on course purchases.',
};

export default function RefundPage() {
  return (
    <LegalPage
      badge="Legal"
      title="Refund Policy"
      lastUpdated="June 22, 2026"
      intro="We want you to enroll with complete confidence. That’s why every course purchase from Afnan Mahmud (afnanmahmud.com) is backed by a simple, 7-day money-back guarantee."
      sections={[
        {
          heading: '7-Day Money-Back Guarantee',
          blocks: [
            {
              type: 'p',
              text: 'If within 7 days of your purchase you feel the course is not right for you, simply ask and we will refund your payment in full — no questions asked. There is no need to explain your reasons and no conditions attached.',
            },
          ],
        },
        {
          heading: 'How to Request a Refund',
          blocks: [
            {
              type: 'p',
              text: 'To request a refund, contact us within 7 days of your purchase through any of the following:',
            },
            {
              type: 'bullets',
              items: [
                'Email: support@afnanmahmud.com',
                'WhatsApp / Phone: +880 1791225000',
              ],
            },
            {
              type: 'p',
              text: 'Please include the phone number used at enrollment and the name of the course so we can quickly locate your order.',
            },
          ],
        },
        {
          heading: 'How Refunds Are Processed',
          blocks: [
            {
              type: 'p',
              text: 'Once approved, your refund is issued to your original payment method. Depending on your bank or payment provider, it typically takes 7–10 business days for the amount to appear in your account. After your refund is processed, your access to the course will be removed.',
            },
          ],
        },
        {
          heading: 'After the 7-Day Period',
          blocks: [
            {
              type: 'p',
              text: 'Because our courses provide instant, lifetime access to digital content, refund requests made more than 7 days after purchase are generally not eligible. If you experience a technical problem that prevents you from accessing your course, please reach out — we are always happy to help resolve it.',
            },
          ],
        },
        {
          heading: 'Contact',
          blocks: [
            {
              type: 'p',
              text: 'Have a question about refunds before you enroll? Email us at support@afnanmahmud.com or message +880 1791225000 — we usually respond within 24 hours.',
            },
          ],
        },
      ]}
    />
  );
}
