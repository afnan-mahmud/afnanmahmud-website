'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Send, MessageCircle, Mail, Phone, Clock, CheckCircle } from 'lucide-react';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const CONTACT_ITEMS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+880 1791225000',
    href: 'https://wa.me/8801791225000',
    color: '#4ade80',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'support@afnanmahmud.com',
    href: 'mailto:support@afnanmahmud.com',
    color: '#6366f1',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+880 1791225000',
    href: 'tel:+8801791225000',
    color: '#22d3ee',
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Within 24 hours',
    href: null,
    color: '#f59e0b',
  },
];

const FAQS = [
  {
    q: 'Are the courses in Bangla?',
    a: 'Yes! All courses are fully explained in Bangla with English technical terms, so you understand every concept clearly.',
  },
  {
    q: 'Do I get lifetime access after purchasing?',
    a: 'Absolutely. Pay once and access the course forever — including all future updates.',
  },
  {
    q: 'Are there any prerequisites?',
    a: 'Basic computer skills are enough to start. I explain everything from the ground up.',
  },
  {
    q: 'Can I get a refund if I am not satisfied?',
    a: 'Yes, we offer a 7-day refund policy. Contact us within 7 days of purchase for a full refund.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '64px' }}>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '90px 0 64px' }}>
        <div aria-hidden style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className={sg.className} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px',
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '100px', color: '#a5b4fc',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: '20px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
              Contact
            </span>

            <h1 className={sg.className} style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              fontWeight: 800, color: '#f8fafc',
              letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 18px',
            }}>
              Let&apos;s{' '}
              <span style={{
                background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                get in touch
              </span>
            </h1>

            <p className={inter.className} style={{
              color: '#94a3b8', fontSize: '1.0625rem',
              maxWidth: '500px', margin: '0 auto', lineHeight: 1.75,
            }}>
              Have a question about a course or just want to say hi? I&apos;d love to hear from you. I usually respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: '0 0 100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '48px', alignItems: 'start' }} className="contact-grid">

            {/* Left: Contact info + FAQ */}
            <div>
              {/* Contact items */}
              <motion.div
                initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ marginBottom: '40px' }}
              >
                <h2 className={sg.className} style={{
                  color: '#f1f5f9', fontWeight: 700, fontSize: '1.25rem',
                  letterSpacing: '-0.015em', marginBottom: '24px',
                }}>
                  Reach Out Directly
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {CONTACT_ITEMS.map(({ icon: Icon, label, value, href, color }) => (
                    <div key={label}>
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" style={{
                          display: 'flex', alignItems: 'center', gap: '16px',
                          padding: '16px 20px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: '14px', textDecoration: 'none',
                          transition: 'border-color 0.2s, background 0.2s',
                          cursor: 'pointer',
                        }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}08`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        >
                          <div style={{
                            width: 40, height: 40, borderRadius: '10px',
                            background: `${color}15`, border: `1px solid ${color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Icon size={18} color={color} />
                          </div>
                          <div>
                            <div className={sg.className} style={{ color: '#71717a', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
                            <div className={inter.className} style={{ color: '#e2e8f0', fontSize: '0.9375rem' }}>{value}</div>
                          </div>
                        </a>
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '16px',
                          padding: '16px 20px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: '14px',
                        }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '10px',
                            background: `${color}15`, border: `1px solid ${color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Icon size={18} color={color} />
                          </div>
                          <div>
                            <div className={sg.className} style={{ color: '#71717a', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
                            <div className={inter.className} style={{ color: '#e2e8f0', fontSize: '0.9375rem' }}>{value}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* FAQ */}
              <motion.div
                initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className={sg.className} style={{
                  color: '#f1f5f9', fontWeight: 700, fontSize: '1.25rem',
                  letterSpacing: '-0.015em', marginBottom: '20px',
                }}>
                  Frequently Asked
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {FAQS.map(({ q, a }, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${openFaq === i ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: '12px', overflow: 'hidden',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className={sg.className}
                        style={{
                          width: '100%', textAlign: 'left',
                          padding: '16px 20px',
                          background: 'none', border: 'none',
                          color: '#e2e8f0', fontSize: '0.9375rem', fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                        }}
                      >
                        {q}
                        <span style={{
                          flexShrink: 0, width: 20, height: 20,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: openFaq === i ? '#6366f1' : '#52525b',
                          fontSize: '1.2rem', transition: 'transform 0.2s',
                          transform: openFaq === i ? 'rotate(45deg)' : 'none',
                        }}>+</span>
                      </button>
                      {openFaq === i && (
                        <p className={inter.className} style={{
                          color: '#71717a', fontSize: '0.9rem', lineHeight: 1.7,
                          margin: 0, padding: '0 20px 16px',
                        }}>
                          {a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Contact form */}
            <motion.div
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '40px',
                position: 'sticky',
                top: '88px',
              }}
            >
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                  >
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4ade80, #22d3ee)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 24px',
                      boxShadow: '0 0 40px rgba(74,222,128,0.3)',
                    }}>
                      <CheckCircle size={38} color="white" />
                    </div>
                  </motion.div>
                  <h3 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.375rem', marginBottom: '12px' }}>
                    Message Sent!
                  </h3>
                  <p className={inter.className} style={{ color: '#71717a', fontSize: '0.9375rem', lineHeight: 1.7 }}>
                    Thanks for reaching out! I&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className={sg.className}
                    style={{
                      marginTop: '24px', padding: '10px 24px',
                      background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: '8px', color: '#a5b4fc',
                      fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <h2 className={sg.className} style={{
                    color: '#f1f5f9', fontWeight: 700, fontSize: '1.375rem',
                    letterSpacing: '-0.02em', marginBottom: '8px',
                  }}>
                    Send a Message
                  </h2>
                  <p className={inter.className} style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '28px' }}>
                    Fill out the form below and I&apos;ll respond as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Name & Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="form-row">
                      <div>
                        <label className={sg.className} style={{ display: 'block', color: '#71717a', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Name *
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Your name"
                          required
                          className={inter.className}
                          style={{
                            width: '100%', padding: '12px 14px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', color: '#e2e8f0', fontSize: '0.9375rem',
                            outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                        />
                      </div>
                      <div>
                        <label className={sg.className} style={{ display: 'block', color: '#71717a', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Email *
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="your@email.com"
                          required
                          className={inter.className}
                          style={{
                            width: '100%', padding: '12px 14px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', color: '#e2e8f0', fontSize: '0.9375rem',
                            outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className={sg.className} style={{ display: 'block', color: '#71717a', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Subject
                      </label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="What is this about?"
                        className={inter.className}
                        style={{
                          width: '100%', padding: '12px 14px',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px', color: '#e2e8f0', fontSize: '0.9375rem',
                          outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className={sg.className} style={{ display: 'block', color: '#71717a', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Message *
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Write your message here..."
                        required
                        rows={5}
                        className={inter.className}
                        style={{
                          width: '100%', padding: '12px 14px',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px', color: '#e2e8f0', fontSize: '0.9375rem',
                          outline: 'none', boxSizing: 'border-box', resize: 'vertical',
                          transition: 'border-color 0.2s', fontFamily: 'inherit',
                          minHeight: '120px',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={sg.className}
                      style={{
                        padding: '14px',
                        background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none', borderRadius: '12px',
                        color: 'white', fontWeight: 700, fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'opacity 0.2s, transform 0.2s',
                        boxShadow: loading ? 'none' : '0 0 24px rgba(99,102,241,0.3)',
                      }}
                      onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      {loading ? 'Sending…' : (<><Send size={16} /> Send Message</>)}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
