import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — Afnan Mahmud',
  description: 'How Afnan Mahmud collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      badge="Legal"
      title="Privacy Policy"
      lastUpdated="June 22, 2026"
      intro="This Privacy Policy explains how Afnan Mahmud (afnanmahmud.com) collects, uses, shares, and protects your personal information when you use our website and online courses (the “Service”). By using the Service, you agree to the practices described here."
      sections={[
        {
          heading: 'Information We Collect',
          blocks: [
            {
              type: 'p',
              text: 'We collect only the information needed to provide and improve the Service:',
            },
            {
              type: 'bullets',
              items: [
                'Account information: your name and mobile phone number, used to create your account and sign you in.',
                'Purchase information: the courses you buy and related order details. Payments are handled by our payment gateway; we do not store your full card or banking details.',
                'Learning data: your course progress, lessons completed, and similar activity within the Service.',
                'Device & technical data: basic information such as your device type and browser (user-agent), used to manage secure sessions and device limits.',
              ],
            },
          ],
        },
        {
          heading: 'How We Use Your Information',
          blocks: [
            {
              type: 'bullets',
              items: [
                'To create and manage your account and authenticate you via OTP.',
                'To give you access to the courses you have purchased and track your progress.',
                'To process payments and provide order confirmations and support.',
                'To enforce account security, device limits, and protect against content piracy.',
                'To communicate important updates about your account, purchases, or the Service.',
                'To measure and improve our marketing and the performance of our website.',
              ],
            },
          ],
        },
        {
          heading: 'SMS & One-Time Passwords',
          blocks: [
            {
              type: 'p',
              text: 'We use a third-party SMS provider to send one-time passwords (OTPs) to your phone number for sign-in. Your phone number is shared with this provider solely to deliver these messages.',
            },
          ],
        },
        {
          heading: 'Payment Information',
          blocks: [
            {
              type: 'p',
              text: 'Payments are processed by our third-party payment gateway, which handles your payment details directly under its own security standards and privacy practices. We receive only confirmation of the transaction and related order information — not your full card or banking credentials.',
            },
          ],
        },
        {
          heading: 'Cookies & Analytics',
          blocks: [
            {
              type: 'p',
              text: 'We use cookies and similar technologies, including the Meta Pixel and Conversions API, to understand how visitors use our website and to measure the effectiveness of our marketing. These tools may collect information such as pages visited and actions taken. You can control cookies through your browser settings, though some features may not work properly if cookies are disabled.',
            },
          ],
        },
        {
          heading: 'Video Delivery',
          blocks: [
            {
              type: 'p',
              text: 'Course videos are delivered through a third-party, DRM-protected video hosting provider. To protect our content, each video stream carries a personal watermark derived from your account. This processing is solely for content security and playback.',
            },
          ],
        },
        {
          heading: 'How We Share Information',
          blocks: [
            {
              type: 'p',
              text: 'We do not sell your personal information. We share it only with trusted service providers who help us operate the Service, and only as needed for that purpose, including:',
            },
            {
              type: 'bullets',
              items: [
                'Our SMS provider (to send OTP messages).',
                'Our payment gateway (to process purchases).',
                'Our video hosting provider (to deliver protected course videos).',
                'Analytics and advertising platforms (to measure and improve marketing).',
              ],
            },
            {
              type: 'p',
              text: 'We may also disclose information if required by law or to protect our rights, users, or the security of the Service.',
            },
          ],
        },
        {
          heading: 'Data Security',
          blocks: [
            {
              type: 'p',
              text: 'We take reasonable technical and organizational measures to protect your information against unauthorized access, loss, or misuse. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
            },
          ],
        },
        {
          heading: 'Data Retention',
          blocks: [
            {
              type: 'p',
              text: 'We retain your account and purchase information for as long as your account is active or as needed to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements.',
            },
          ],
        },
        {
          heading: 'Your Rights',
          blocks: [
            {
              type: 'p',
              text: 'You may request to access, correct, or delete your personal information, subject to any legal or operational requirements. To make a request, contact us using the details below.',
            },
          ],
        },
        {
          heading: 'Children’s Privacy',
          blocks: [
            {
              type: 'p',
              text: 'The Service is intended for users who are able to enter into a binding agreement. We do not knowingly collect personal information from children in a manner inconsistent with applicable law. If you believe a child has provided us information without appropriate consent, please contact us.',
            },
          ],
        },
        {
          heading: 'Changes to This Policy',
          blocks: [
            {
              type: 'p',
              text: 'We may update this Privacy Policy from time to time. When we do, we will revise the “Last updated” date above. Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.',
            },
          ],
        },
        {
          heading: 'Contact',
          blocks: [
            {
              type: 'p',
              text: 'If you have any questions about this Privacy Policy or your information, contact us at support@afnanmahmud.com or +880 1791225000.',
            },
          ],
        },
      ]}
    />
  );
}
