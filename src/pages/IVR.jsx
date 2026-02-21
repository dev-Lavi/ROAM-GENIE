import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { submitIVR, sendWhatsAppAlert } from '../api/ivrApi';
import { Phone, MessageCircle, CheckCircle2, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const IVR = () => {
    const [phone, setPhone] = useState('+91');
    const [whatsapp, setWhatsapp] = useState('+91');
    const [callDone, setCallDone] = useState(false);
    const [alertDone, setAlertDone] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alertLoad, setAlertLoad] = useState('');
    const [error, setError] = useState(null);
    const [alertErr, setAlertErr] = useState(null);

    const validateIN = (num) => num.startsWith('+91') && num.replace(/\s/g, '').length === 13;

    /* ── IVR Call ── */
    const handleCall = async () => {
        if (!validateIN(phone)) {
            setError('Please enter a valid Indian number starting with +91 (e.g. +91 98765 43210)');
            return;
        }
        setLoading(true); setError(null);
        try {
            await submitIVR({ to_number: phone.replace(/\s/g, '') });
            setCallDone(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ── WhatsApp alert ── */
    const handleWhatsApp = async (type) => {
        if (!validateIN(whatsapp)) {
            setAlertErr('Please enter a valid Indian WhatsApp number starting with +91');
            return;
        }
        setAlertLoad(type); setAlertErr(null);
        try {
            await sendWhatsAppAlert({ to_number: whatsapp.replace(/\s/g, ''), type });
            setAlertDone(type);
        } catch (err) {
            setAlertErr(err.message);
        } finally {
            setAlertLoad('');
        }
    };

    return (
        <PageWrapper title="IVR Assistant">
            <section style={{ padding: '60px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>

                {/* ── Header ── */}
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
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '2.2rem', margin: '0 0 12px',
                        background: 'linear-gradient(135deg,#2dd4bf,#38bdf8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        IVR Booking Assistant
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                        Get an AI-powered call to finalize your booking, or receive emergency WhatsApp alerts.
                    </p>
                </div>

                {/* ── IVR Call Card ── */}
                <Card glow style={{ padding: '32px', marginBottom: '24px' }}>
                    <h2 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={18} style={{ color: '#2dd4bf' }} /> Schedule a Call
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px' }}>
                        Our AI assistant will call you via Twilio/n8n to walk through your booking.
                    </p>

                    {callDone ? (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <CheckCircle2 size={48} style={{ color: '#2dd4bf', margin: '0 auto 14px', display: 'block' }} />
                            <p style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 6px' }}>Call Initiated!</p>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 20px' }}>
                                Our AI assistant is calling <strong style={{ color: '#e2e8f0' }}>{phone}</strong> now.
                            </p>
                            <Button variant="ghost" size="md" onClick={() => { setCallDone(false); setPhone('+91'); }}>
                                Schedule another call
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Input
                                id="ivr-phone"
                                label="Your Phone Number"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={e => { setPhone(e.target.value); setError(null); }}
                                icon={<Phone size={16} />}
                                hint="Must be a valid Indian number starting with +91"
                                error={error}
                                required
                            />
                            <Button size="lg" fullWidth icon={<Phone size={18} />} style={{ marginTop: '20px' }} onClick={handleCall} loading={loading}>
                                {loading ? 'Initiating call…' : 'Start Call'}
                            </Button>
                        </>
                    )}
                </Card>

                {/* ── WhatsApp Emergency Alerts ── */}
                <Card glow style={{ padding: '32px' }}>
                    <h2 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={18} style={{ color: '#a78bfa' }} /> Emergency &amp; Offline WhatsApp Alerts
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px' }}>
                        Simulate real-time alerts via Twilio WhatsApp sandbox.
                    </p>
                    <p style={{ color: '#475569', fontSize: '0.78rem', marginBottom: '20px' }}>
                        💡 First send <code style={{ color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '1px 5px', borderRadius: '4px' }}>join edge-general</code> to <strong>+1 (415) 523-8886</strong> on WhatsApp to join the sandbox.
                    </p>

                    <Input
                        id="whatsapp-number"
                        label="WhatsApp Number"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={whatsapp}
                        onChange={e => { setWhatsapp(e.target.value); setAlertErr(null); setAlertDone(null); }}
                        icon={<MessageCircle size={16} />}
                        hint="Indian number starting with +91"
                        error={alertErr}
                    />

                    {alertDone && (
                        <div style={{
                            padding: '12px 16px', borderRadius: '12px', margin: '16px 0 0',
                            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                            display: 'flex', alignItems: 'center', gap: '10px',
                        }}>
                            <CheckCircle2 size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                            <p style={{ color: '#86efac', margin: 0, fontSize: '0.88rem' }}>
                                {alertDone === 'cancellation' ? '🚨 Flight cancellation alert' : '📴 Offline fallback message'} sent to {whatsapp}!
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                        <Button
                            variant="secondary" size="md" fullWidth
                            icon={<Wifi size={16} />}
                            loading={alertLoad === 'cancellation'}
                            onClick={() => handleWhatsApp('cancellation')}
                        >
                            🚨 Flight Cancellation Alert
                        </Button>
                        <Button
                            variant="secondary" size="md" fullWidth
                            icon={<WifiOff size={16} />}
                            loading={alertLoad === 'offline'}
                            onClick={() => handleWhatsApp('offline')}
                        >
                            📴 Offline Fallback
                        </Button>
                    </div>
                </Card>
            </section>
        </PageWrapper>
    );
};

export default IVR;
