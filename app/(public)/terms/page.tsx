import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service — Afnan Mahmud',
  description: 'The terms and conditions governing your use of the Afnan Mahmud courses platform.',
};

export default function TermsPage() {
  return (
    <LegalPage
      badge="Legal"
      title="Terms of Service"
      lastUpdated="June 22, 2026"
      intro="Welcome to Afnan Mahmud (afnanmahmud.com). These Terms of Service (“Terms”) govern your access to and use of our website, online courses, and related digital content (collectively, the “Service”). By creating an account, enrolling in a course, or otherwise using the Service, you agree to be bound by these Terms. Please read them carefully."
      sections={[
        {
          heading: 'About the Service',
          blocks: [
            {
              type: 'p',
              text: 'Afnan Mahmud is an individual offering online, pre-recorded video courses on software development and related technologies. Courses are delivered as digital content that you can access online after a successful one-time purchase. Unless stated otherwise, an enrollment grants you lifetime access to that course, including future updates to it.',
            },
          ],
        },
        {
          heading: 'Eligibility & Accounts',
          blocks: [
            {
              type: 'p',
              text: 'To enroll, you create an account using your mobile phone number, verified through a one-time password (OTP) sent by SMS. You are responsible for the accuracy of the information you provide and for all activity that occurs under your account.',
            },
            {
              type: 'bullets',
              items: [
                'You must provide a valid phone number that belongs to you.',
                'You are responsible for keeping access to your phone number and account secure.',
                'One account is intended for one individual learner — accounts may not be shared.',
              ],
            },
          ],
        },
        {
          heading: 'Course Licence',
          blocks: [
            {
              type: 'p',
              text: 'When you purchase a course, you receive a personal, non-exclusive, non-transferable, revocable licence to access and view that course for your own learning. You may not share, resell, sublicense, publicly display, or otherwise distribute the course content.',
            },
          ],
        },
        {
          heading: 'Account Sharing & Device Limits',
          blocks: [
            {
              type: 'p',
              text: 'To protect our content, each student account may be signed in on at most one mobile device and one desktop device at a time. Signing in on a new device of the same type will automatically end the previous session on that device type. Course videos are protected by digital rights management (DRM) and carry a personal watermark tied to your account. Attempting to bypass these protections, record, download, or redistribute course content is strictly prohibited and may result in suspension or termination of your account without refund.',
            },
          ],
        },
        {
          heading: 'Pricing & Payments',
          blocks: [
            {
              type: 'p',
              text: 'Course prices are listed in Bangladeshi Taka (BDT) and are charged as a one-time payment unless stated otherwise. Payments are processed securely through our third-party payment gateway. We do not collect or store your full card or banking details on our servers.',
            },
            {
              type: 'p',
              text: 'We may change course prices, run promotions, or modify offers at any time. Any price change will not affect courses you have already purchased.',
            },
          ],
        },
        {
          heading: 'Refunds',
          blocks: [
            {
              type: 'p',
              text: 'We offer a 7-day money-back guarantee on course purchases. Full details, including how to request a refund, are set out in our Refund Policy, which forms part of these Terms.',
            },
          ],
        },
        {
          heading: 'Intellectual Property',
          blocks: [
            {
              type: 'p',
              text: 'All course materials — including videos, text, source code provided for learning, graphics, and the platform itself — are the property of Afnan Mahmud or its licensors and are protected by applicable intellectual property laws. Except for the limited licence granted to you, no rights are transferred to you.',
            },
          ],
        },
        {
          heading: 'Acceptable Use',
          blocks: [
            {
              type: 'p',
              text: 'You agree not to misuse the Service. In particular, you must not:',
            },
            {
              type: 'bullets',
              items: [
                'Share your account credentials or course access with others.',
                'Copy, record, download, or redistribute any course content.',
                'Attempt to circumvent DRM, watermarking, device limits, or other security measures.',
                'Use the Service for any unlawful purpose or in violation of these Terms.',
              ],
            },
          ],
        },
        {
          heading: 'Educational Disclaimer',
          blocks: [
            {
              type: 'p',
              text: 'Our courses are provided for educational purposes only. While we work hard to deliver high-quality, practical content, we do not guarantee any specific outcome, including employment, income, or career results. Your results depend on your own effort, background, and circumstances. The Service is provided “as is” and “as available” without warranties of any kind, to the fullest extent permitted by law.',
            },
          ],
        },
        {
          heading: 'Limitation of Liability',
          blocks: [
            {
              type: 'p',
              text: 'To the maximum extent permitted by law, Afnan Mahmud shall not be liable for any indirect, incidental, special, or consequential damages arising out of or relating to your use of the Service. Our total liability for any claim relating to the Service shall not exceed the amount you paid for the relevant course.',
            },
          ],
        },
        {
          heading: 'Suspension & Termination',
          blocks: [
            {
              type: 'p',
              text: 'We may suspend or terminate your access to the Service if you breach these Terms, including any attempt to share, copy, or pirate course content. In cases of serious violation, no refund will be provided.',
            },
          ],
        },
        {
          heading: 'Changes to These Terms',
          blocks: [
            {
              type: 'p',
              text: 'We may update these Terms from time to time. When we do, we will revise the “Last updated” date above. Your continued use of the Service after changes take effect constitutes your acceptance of the updated Terms.',
            },
          ],
        },
        {
          heading: 'Governing Law',
          blocks: [
            {
              type: 'p',
              text: 'These Terms are governed by and construed in accordance with the laws of Bangladesh. Any disputes arising from these Terms or your use of the Service shall be subject to the jurisdiction of the courts of Bangladesh.',
            },
          ],
        },
        {
          heading: 'Contact',
          blocks: [
            {
              type: 'p',
              text: 'If you have any questions about these Terms, contact us at support@afnanmahmud.com or +880 1791225000.',
            },
          ],
        },
      ]}
    />
  );
}
