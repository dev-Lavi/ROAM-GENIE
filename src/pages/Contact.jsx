import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { submitContact } from '../api/contactApi';
import { Mail, Send, CheckCircle2, AlertCircle, User, Phone } from 'lucide-react';

const Contact = () => {
    const [form, setForm] = useState({ firstName: '', secondName: '', email: '', phone: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.firstName || !form.email || !form.phone) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true); setError(null);
        try {
            await submitContact(form);  // POSTs { firstName, secondName, email, phone } to CRM
            setSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper title="Contact">
            <section style={{ padding: '60px 24px 80px', maxWidth: '680px', margin: '0 auto' }}>
                {/* ── Header ── */}
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
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '2.2rem', margin: '0 0 12px',
                        background: 'linear-gradient(135deg,#f472b6,#a78bfa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        Get in Touch
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                        Have questions about your journey? We save your details to our CRM and get back to you within 24h.
                    </p>
                </div>

                <Card glow style={{ padding: '36px' }}>
                    {sent ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <CheckCircle2 size={52} style={{ color: '#a78bfa', margin: '0 auto 16px', display: 'block' }} />
                            <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1.15rem', margin: '0 0 8px' }}>Message Received!</p>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 24px' }}>
                                We'll reach you at <strong style={{ color: '#e2e8f0' }}>{form.email}</strong> soon.
                            </p>
                            <Button variant="ghost" size="md" onClick={() => { setSent(false); setForm({ firstName: '', secondName: '', email: '', phone: '' }); }}>
                                Send another message
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <Input
                                        id="contact-firstname"
                                        label="First Name"
                                        placeholder="Jane"
                                        value={form.firstName}
                                        onChange={e => set('firstName', e.target.value)}
                                        icon={<User size={16} />}
                                        required
                                    />
                                    <Input
                                        id="contact-lastname"
                                        label="Last Name"
                                        placeholder="Doe"
                                        value={form.secondName}
                                        onChange={e => set('secondName', e.target.value)}
                                        icon={<User size={16} />}
                                    />
                                </div>

                                <Input
                                    id="contact-email"
                                    label="Email"
                                    type="email"
                                    placeholder="jane@example.com"
                                    value={form.email}
                                    onChange={e => set('email', e.target.value)}
                                    icon={<Mail size={16} />}
                                    required
                                />

                                <Input
                                    id="contact-phone"
                                    label="Phone Number"
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={form.phone}
                                    onChange={e => set('phone', e.target.value)}
                                    icon={<Phone size={16} />}
                                    required
                                />

                                {error && (
                                    <div style={{
                                        padding: '12px 16px', borderRadius: '12px',
                                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                    }}>
                                        <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
                                        <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.85rem' }}>{error}</p>
                                    </div>
                                )}

                                <Button type="submit" size="lg" fullWidth icon={<Send size={18} />} loading={loading}>
                                    {loading ? 'Sending…' : 'Send My Info'}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </section>
        </PageWrapper>
    );
};

export default Contact;
