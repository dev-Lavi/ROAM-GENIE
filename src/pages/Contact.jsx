import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Mail, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sent, setSent] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <PageWrapper title="Contact">
            <section style={{ padding: '80px 24px', maxWidth: '680px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'linear-gradient(135deg,rgba(236,72,153,0.2),rgba(139,92,246,0.15))',
                        border: '1.5px solid rgba(236,72,153,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <Mail size={32} style={{ color: '#f472b6' }} />
                    </div>
                    <h1 style={{
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800,
                        fontSize: '2.2rem', margin: '0 0 14px',
                        background: 'linear-gradient(135deg,#f472b6,#a78bfa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        Get in Touch
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                        Have questions about your journey? We're happy to help.
                    </p>
                </div>

                <Card glow style={{ padding: '36px' }}>
                    {sent ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '3rem', margin: '0 0 16px' }}>🎉</p>
                            <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 8px' }}>Message Sent!</p>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>We'll get back to you at {form.email} within 24 hours.</p>
                            <Button variant="ghost" size="md" style={{ marginTop: '24px' }} onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
                                Send another
                            </Button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <Input id="contact-name" label="Full Name" placeholder="Jane Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
                            <Input id="contact-email" label="Email" placeholder="jane@example.com" type="email" value={form.email} onChange={e => set('email', e.target.value)} icon={<Mail size={16} />} required />
                            <div>
                                <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                                    Message <span style={{ color: '#f87171' }}>*</span>
                                </label>
                                <textarea
                                    id="contact-message"
                                    rows={5}
                                    value={form.message}
                                    onChange={e => set('message', e.target.value)}
                                    placeholder="Tell us how we can help…"
                                    style={{
                                        width: '100%', padding: '12px 14px', resize: 'vertical',
                                        background: 'rgba(17,17,34,0.8)',
                                        border: '1.5px solid rgba(99,102,241,0.25)',
                                        borderRadius: '12px', color: '#e2e8f0',
                                        fontSize: '0.94rem', fontFamily: 'inherit',
                                        outline: 'none', boxSizing: 'border-box',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.25)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <Button size="lg" fullWidth icon={<Send size={18} />} onClick={() => { if (form.name && form.email && form.message) setSent(true); }}>
                                Send Message
                            </Button>
                        </div>
                    )}
                </Card>
            </section>
        </PageWrapper>
    );
};

export default Contact;
