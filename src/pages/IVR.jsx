import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Phone } from 'lucide-react';

const IVR = () => {
    const [phone, setPhone] = useState('');
    const [submitted, setSubmitted] = useState(false);

    return (
        <PageWrapper title="IVR Assistant">
            <section style={{ padding: '80px 24px', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'linear-gradient(135deg,rgba(20,184,166,0.2),rgba(14,165,233,0.15))',
                        border: '1.5px solid rgba(20,184,166,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <Phone size={32} style={{ color: '#2dd4bf' }} />
                    </div>
                    <h1 style={{
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800,
                        fontSize: '2.2rem', margin: '0 0 14px',
                        background: 'linear-gradient(135deg,#2dd4bf,#38bdf8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        IVR Booking Assistant
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                        Get a call from our AI assistant to complete your booking.
                    </p>
                </div>

                <Card glow style={{ padding: '36px' }}>
                    {submitted ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '3rem', margin: '0 0 16px' }}>📞</p>
                            <p style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 8px' }}>Call Scheduled!</p>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                                Our AI assistant will call <strong style={{ color: '#e2e8f0' }}>{phone}</strong> shortly.
                            </p>
                            <Button variant="ghost" size="md" style={{ marginTop: '24px' }} onClick={() => { setSubmitted(false); setPhone(''); }}>
                                Schedule another
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <Input
                                id="ivr-phone"
                                label="Your Phone Number"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                icon={<Phone size={16} />}
                                hint="We'll call you to finalize your booking"
                                required
                            />
                            <Button
                                size="lg" fullWidth style={{ marginTop: '24px' }}
                                icon={<Phone size={18} />}
                                onClick={() => { if (phone) setSubmitted(true); }}
                            >
                                Schedule My Call
                            </Button>
                        </div>
                    )}
                </Card>
            </section>
        </PageWrapper>
    );
};

export default IVR;
