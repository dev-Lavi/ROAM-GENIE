import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { monitorFlight } from '../api/warRoomApi';
import {
    Shield, Plane, AlertTriangle, CheckCircle, XCircle,
    Activity, MapPin, Clock, RefreshCw, Zap, AlertCircle,
    MessageSquare, ChevronRight, Radio,
} from 'lucide-react';

/* ─── Alert Level Meta ───────────────────────────────────── */
const ALERT_META = {
    green: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', icon: CheckCircle, label: 'All Clear' },
    amber: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: AlertTriangle, label: 'Watch' },
    red: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: XCircle, label: 'Action Required' },
};

/* ─── Radar Ring (animated indicator) ─────────────────────── */
const RadarRing = ({ level }) => {
    const meta = ALERT_META[level] || ALERT_META.green;
    return (
        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${meta.color}30`,
                animation: 'radarPulse 2s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', inset: '12px', borderRadius: '50%',
                border: `2px solid ${meta.color}60`,
                animation: 'radarPulse 2s ease-in-out 0.5s infinite',
            }} />
            <div style={{
                position: 'absolute', inset: '24px', borderRadius: '50%',
                background: `${meta.color}18`, border: `2px solid ${meta.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <meta.icon size={16} style={{ color: meta.color }} />
            </div>
        </div>
    );
};

/* ─── Flight Status Card ─────────────────────────────────── */
const FlightStatusCard = ({ fs }) => {
    const delayMin = fs.departure?.delay ?? 0;
    const isDelayed = delayMin > 0;
    const statusColor = fs.status === 'active' ? '#22c55e'
        : fs.status === 'delayed' ? '#f59e0b'
            : fs.status === 'cancelled' ? '#ef4444'
                : '#64748b';

    return (
        <div style={{
            borderRadius: '18px', overflow: 'hidden',
            background: 'rgba(15,15,30,0.8)', border: '1.5px solid rgba(129,140,248,0.2)',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 22px', background: 'rgba(129,140,248,0.06)',
                borderBottom: '1px solid rgba(129,140,248,0.12)',
                display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
            }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(129,140,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plane size={16} style={{ color: '#818cf8' }} />
                </div>
                <div>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>
                        {fs.flightIata}  <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.85rem' }}>{fs.airline}</span>
                    </p>
                </div>
                <span style={{
                    marginLeft: 'auto', padding: '4px 14px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700,
                    background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`,
                    textTransform: 'capitalize',
                }}>
                    {fs.status}
                </span>
                {fs.isMock && (
                    <span style={{
                        padding: '3px 10px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600,
                        background: 'rgba(100,116,139,0.12)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)',
                    }}>
                        DEMO DATA
                    </span>
                )}
            </div>

            {/* Route strip */}
            <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#818cf8', fontWeight: 800, fontSize: '1.3rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>{fs.departure?.iata}</p>
                    <p style={{ color: '#475569', fontSize: '0.72rem', margin: '2px 0 0' }}>{fs.departure?.airport?.split(' ')[0]}</p>
                    {fs.departure?.terminal && <p style={{ color: '#334155', fontSize: '0.7rem', margin: '2px 0 0' }}>T{fs.departure.terminal}</p>}
                </div>
                <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                    <div style={{ height: '2px', background: 'linear-gradient(90deg,#818cf8,#6366f1)' }} />
                    <Plane size={14} style={{ color: '#818cf8', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) translateY(-1px)', background: '#0f0f1e', padding: '0 4px' }} />
                    {isDelayed && (
                        <p style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: 700, margin: '6px 0 0' }}>
                            +{delayMin}min delay
                        </p>
                    )}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#818cf8', fontWeight: 800, fontSize: '1.3rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>{fs.arrival?.iata}</p>
                    <p style={{ color: '#475569', fontSize: '0.72rem', margin: '2px 0 0' }}>{fs.arrival?.airport?.split(' ')[0]}</p>
                    {fs.arrival?.terminal && <p style={{ color: '#334155', fontSize: '0.7rem', margin: '2px 0 0' }}>T{fs.arrival.terminal}</p>}
                </div>
            </div>

            {/* Times */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {[
                    { label: 'Scheduled Dep', val: fs.departure?.scheduled },
                    { label: 'Estimated Dep', val: fs.departure?.estimated },
                    { label: 'Scheduled Arr', val: fs.arrival?.scheduled },
                    { label: 'Estimated Arr', val: fs.arrival?.estimated },
                ].map(({ label, val }) => (
                    <div key={label} style={{ padding: '12px 18px', background: 'rgba(10,10,20,0.6)' }}>
                        <p style={{ color: '#475569', fontSize: '0.72rem', margin: '0 0 4px' }}>{label}</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                            {val ? new Date(val).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </p>
                    </div>
                ))}
            </div>

            {fs.departure?.gate && (
                <div style={{ padding: '10px 22px', background: 'rgba(99,102,241,0.04)', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                        Gate: <span style={{ color: '#818cf8', fontWeight: 700 }}>{fs.departure.gate}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

/* ─── Intel Brief Card ───────────────────────────────────── */
const IntelCard = ({ intel, advisories }) => {
    const meta = ALERT_META[intel.alertLevel] || ALERT_META.green;

    return (
        <div style={{
            borderRadius: '18px', overflow: 'hidden',
            background: 'rgba(15,15,30,0.9)',
            border: `1.5px solid ${meta.border}`,
        }}>
            {/* Alert header */}
            <div style={{
                padding: '16px 22px', background: meta.bg,
                borderBottom: `1px solid ${meta.border}`,
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            }}>
                <RadarRing level={intel.alertLevel} />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                            padding: '2px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700,
                            background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
                        }}>
                            {(intel.alertLevel || 'green').toUpperCase()} — {meta.label}
                        </span>
                    </div>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>
                        {intel.headline}
                    </p>
                </div>
            </div>

            {/* Summary */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
                    {intel.summary}
                </p>
            </div>

            {/* Connection viability */}
            {intel.connectionViable !== null && intel.connectionViable !== undefined && (
                <div style={{
                    padding: '12px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: intel.connectionViable ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                }}>
                    {intel.connectionViable
                        ? <CheckCircle size={16} style={{ color: '#22c55e' }} />
                        : <XCircle size={16} style={{ color: '#ef4444' }} />
                    }
                    <p style={{
                        color: intel.connectionViable ? '#86efac' : '#fca5a5',
                        fontWeight: 600, fontSize: '0.85rem', margin: 0,
                    }}>
                        {intel.connectionViable ? 'Connection appears viable' : 'Connection may be at risk'}
                    </p>
                </div>
            )}

            {/* Recommended actions */}
            {Array.isArray(intel.recommendedActions) && intel.recommendedActions.length > 0 && (
                <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <p style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                        Recommended Actions
                    </p>
                    {intel.recommendedActions.map((action, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <ChevronRight size={14} style={{ color: meta.color, flexShrink: 0, marginTop: '3px' }} />
                            <p style={{ color: '#cbd5e1', fontSize: '0.86rem', margin: 0, lineHeight: 1.5 }}>{action}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* WhatsApp alert preview */}
            {intel.whatsappAlert && (
                <div style={{
                    padding: '12px 22px',
                    background: 'rgba(37,211,102,0.04)',
                    borderTop: '1px solid rgba(37,211,102,0.1)',
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                }}>
                    <MessageSquare size={15} style={{ color: '#25d366', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                        <span style={{ color: '#25d366', fontWeight: 700, fontSize: '0.75rem' }}>WhatsApp Alert: </span>{intel.whatsappAlert}
                    </p>
                </div>
            )}
        </div>
    );
};

/* ─── Advisory Feed ──────────────────────────────────────── */
const AdvisoryFeed = ({ advisories, destination }) => {
    if (!advisories?.length) return null;
    return (
        <div style={{
            borderRadius: '18px', overflow: 'hidden',
            background: 'rgba(15,15,30,0.8)', border: '1.5px solid rgba(251,146,60,0.2)',
        }}>
            <div style={{
                padding: '14px 22px', background: 'rgba(251,146,60,0.06)',
                borderBottom: '1px solid rgba(251,146,60,0.12)',
                display: 'flex', alignItems: 'center', gap: '10px',
            }}>
                <Radio size={16} style={{ color: '#fb923c' }} />
                <span style={{ color: '#fb923c', fontWeight: 700, fontSize: '0.88rem' }}>
                    Live Advisories — {destination}
                </span>
                <span style={{
                    marginLeft: 'auto', padding: '2px 10px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                    background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)',
                }}>
                    {advisories.length} sources
                </span>
            </div>
            <div style={{ padding: '8px 0' }}>
                {advisories.map((adv, i) => (
                    <div key={i} style={{
                        padding: '10px 22px', borderBottom: i < advisories.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fb923c40', border: '1.5px solid #fb923c60', flexShrink: 0, marginTop: '6px' }} />
                        <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0, lineHeight: 1.55 }}>{adv}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ─── Main Page ───────────────────────────────────────────── */
const WarRoom = () => {
    const [flightCode, setFlightCode] = useState('');
    const [destination, setDestination] = useState('');
    const [layover, setLayover] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#e2e8f0', fontSize: '0.88rem', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color 0.2s',
    };

    const handleMonitor = async () => {
        if (!flightCode.trim()) { setError('Please enter a flight code (e.g. EK502).'); return; }
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await monitorFlight({
                flightIata: flightCode.trim().toUpperCase(),
                destination: destination.trim() || undefined,
                layoverMinutes: layover ? parseInt(layover) : undefined,
                whatsappNumber: whatsapp.trim() || undefined,
            });
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper title="Live War Room">
            {/* Hero */}
            <section style={{ padding: '72px 24px 48px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,158,11,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 18px', borderRadius: '99px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '28px',
                }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', animation: 'blink 1.4s ease-in-out infinite' }} />
                    LIVE TRIP WAR ROOM
                </div>

                <h1 style={{
                    fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(2rem,5vw,3.5rem)',
                    fontWeight: 800, lineHeight: 1.12, margin: '0 auto 20px', maxWidth: '680px',
                }}>
                    Your Active Travel Guardian.
                    <span style={{
                        display: 'block', marginTop: '4px',
                        background: 'linear-gradient(135deg,#f87171,#fb923c,#fbbf24)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        Always Watching.
                    </span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
                    Real-time flight disruption intelligence, travel advisories, and proactive alerts — delivered before you even think to check.
                </p>

                {/* Feature chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '28px' }}>
                    {[
                        { icon: Activity, text: 'Live Flight Status' },
                        { icon: MapPin, text: 'Travel Advisories' },
                        { icon: Clock, text: 'Connection Viability' },
                        { icon: Zap, text: 'AI Intelligence Brief' },
                        { icon: MessageSquare, text: 'WhatsApp Alerts' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600,
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            color: '#64748b',
                        }}>
                            <Icon size={12} /> {text}
                        </div>
                    ))}
                </div>
            </section>

            {/* Control Panel */}
            <section style={{ padding: '0 24px 48px' }}>
                <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <Card glow style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <Shield size={18} style={{ color: '#f87171' }} />
                            <h2 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>
                                Flight Monitor
                            </h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                    Flight Code <span style={{ color: '#ef4444', fontWeight: 700 }}>*</span>
                                </label>
                                <input
                                    value={flightCode}
                                    onChange={e => setFlightCode(e.target.value)}
                                    placeholder="e.g. EK502, AI302, 6E101"
                                    style={inputStyle}
                                    onKeyDown={e => e.key === 'Enter' && handleMonitor()}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                    Destination <span style={{ color: '#475569', fontWeight: 400 }}>(for advisories)</span>
                                </label>
                                <input
                                    value={destination}
                                    onChange={e => setDestination(e.target.value)}
                                    placeholder="e.g. Dubai, Paris, Tokyo"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                    Layover Duration <span style={{ color: '#475569', fontWeight: 400 }}>(minutes, optional)</span>
                                </label>
                                <input
                                    value={layover}
                                    onChange={e => setLayover(e.target.value)}
                                    type="number" min="0"
                                    placeholder="e.g. 135"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                    WhatsApp Number <span style={{ color: '#475569', fontWeight: 400 }}>(get alerts)</span>
                                </label>
                                <input
                                    value={whatsapp}
                                    onChange={e => setWhatsapp(e.target.value)}
                                    placeholder="+91 9876543210"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleMonitor}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '14px 24px', borderRadius: '14px',
                                background: loading ? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg,#ef4444,#f97316)',
                                border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 24px rgba(239,68,68,0.25)',
                            }}
                        >
                            {loading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Activity size={16} />}
                            {loading ? 'Scanning Intel…' : 'Launch War Room Monitor'}
                        </button>
                    </Card>
                </div>
            </section>

            {/* Loading */}
            {loading && (
                <section style={{ padding: '0 24px 64px' }}>
                    <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
                        <Loader size="lg" text="Gathering real-time intelligence… 📡" />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                            {['Checking flight status', 'Scanning advisories', 'AI brief generation'].map((step, i) => (
                                <div key={step} style={{
                                    padding: '7px 16px', borderRadius: '10px',
                                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
                                    color: '#f87171', fontSize: '0.8rem', fontWeight: 600,
                                    animation: `fadeIn 0.4s ease ${i * 0.3}s both`,
                                }}>
                                    ◉ {step}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Error */}
            {error && !loading && (
                <section style={{ padding: '0 24px 48px' }}>
                    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                        <div style={{
                            padding: '20px 24px', borderRadius: '14px',
                            background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.25)',
                            display: 'flex', gap: '14px', alignItems: 'flex-start',
                        }}>
                            <AlertCircle size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
                            <div>
                                <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px' }}>Monitor Failed</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>{error}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Results */}
            {result && !loading && (
                <section style={{ padding: '0 24px 80px' }}>
                    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* WhatsApp sent banner */}
                        {result.whatsappSent && (
                            <div style={{
                                padding: '12px 20px', borderRadius: '12px',
                                background: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.2)',
                                display: 'flex', gap: '10px', alignItems: 'center',
                                animation: 'fadeInUp 0.4s ease',
                            }}>
                                <MessageSquare size={16} style={{ color: '#25d366' }} />
                                <p style={{ color: '#86efac', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>
                                    WhatsApp alert dispatched to your number ✓
                                </p>
                            </div>
                        )}

                        {/* Intelligence Brief */}
                        {result.intel && (
                            <IntelCard intel={result.intel} advisories={result.advisories} />
                        )}

                        {/* Flight Status */}
                        {result.flightStatus && (
                            <FlightStatusCard fs={result.flightStatus} />
                        )}

                        {/* Advisories */}
                        {Array.isArray(result.advisories) && result.advisories.length > 0 && (
                            <AdvisoryFeed advisories={result.advisories} destination={destination || flightCode} />
                        )}
                    </div>
                </section>
            )}

            <style>{`
                @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
                @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
                @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
                @keyframes radarPulse { 0%{opacity:0.8;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.1)} 100%{opacity:0.8;transform:scale(1)} }
                input:focus { border-color: rgba(239,68,68,0.4) !important; }
            `}</style>
        </PageWrapper>
    );
};

export default WarRoom;
