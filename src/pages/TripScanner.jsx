import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { parseBookingText, parseBookingImage } from '../api/tripScannerApi';
import {
    ScanLine, Upload, FileText, Plane, Hotel, Car, Map,
    CheckCircle, AlertCircle, ChevronDown, ChevronUp,
    Sparkles, X, MessageSquare, Camera, Calendar,
} from 'lucide-react';

/* ─── Type meta ───────────────────────────────────────────── */
const TYPE_META = {
    flight: { label: 'Flight', icon: Plane, color: '#818cf8' },
    hotel: { label: 'Hotel', icon: Hotel, color: '#2dd4bf' },
    car_rental: { label: 'Car Rental', icon: Car, color: '#fb923c' },
    tour: { label: 'Tour Package', icon: Map, color: '#a78bfa' },
    unknown: { label: 'Booking', icon: FileText, color: '#64748b' },
};

/* ─── Detail Row ──────────────────────────────────────────── */
const Row = ({ label, value }) => {
    if (!value) return null;
    return (
        <div style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--clr-border)' }}>
            <span style={{ color: 'var(--clr-text-dim)', fontSize: '0.82rem', minWidth: '140px', flexShrink: 0 }}>{label}</span>
            <span style={{ color: 'var(--clr-text)', fontSize: '0.88rem', fontWeight: 500 }}>{value}</span>
        </div>
    );
};


/* ─── Booking Card AND MUSTAFA ────────────────────────────────────────── */
const BookingCard = ({ booking }) => {
    const [expanded, setExpanded] = useState(true);
    const type = booking.type || 'unknown';
    const meta = TYPE_META[type] || TYPE_META.unknown;
    const Icon = meta.icon;

    return (
        <div style={{
            borderRadius: '20px',
            background: 'var(--clr-card-bg)',
            border: `1.5px solid ${meta.color}30`,
            overflow: 'hidden',
            animation: 'fadeInUp 0.4s ease',
            boxShadow: 'var(--clr-card-shadow)',
        }}>
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '18px 24px', cursor: 'pointer',
                    background: `linear-gradient(135deg,${meta.color}12,transparent)`,
                    borderBottom: expanded ? `1px solid ${meta.color}20` : 'none',
                }}
            >
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: `${meta.color}18`, border: `1px solid ${meta.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Icon size={18} style={{ color: meta.color }} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--clr-text)', fontWeight: 700, fontSize: '0.95rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>
                        {meta.label} Confirmation
                    </p>
                    {(booking.pnr || booking.bookingReference) && (
                        <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.78rem', margin: '2px 0 0' }}>
                            Ref: {booking.pnr || booking.bookingReference}
                        </p>
                    )}
                </div>
                <span style={{
                    padding: '3px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                    background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}25`,
                }}>
                    {meta.label.toUpperCase()}
                </span>
                {expanded
                    ? <ChevronUp size={16} style={{ color: 'var(--clr-text-dim)', flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: 'var(--clr-text-dim)', flexShrink: 0 }} />
                }
            </div>

            {expanded && (
                <div style={{ padding: '20px 24px', background: 'var(--clr-card-bg)' }}>
                    {/* Flight */}
                    {type === 'flight' && (
                        <>
                            {booking.departure?.city && booking.arrival?.city && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '14px 18px', borderRadius: '12px', marginBottom: '16px',
                                    background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#818cf8', fontWeight: 800, fontSize: '1.1rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>
                                            {booking.departure.iata || booking.departure.city}
                                        </p>
                                        <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.7rem', margin: '2px 0 0' }}>{booking.departure.time || ''}</p>
                                    </div>
                                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,#818cf8,#6366f1)', position: 'relative' }}>
                                        <Plane size={14} style={{ color: '#818cf8', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--clr-card-bg)', padding: '0 4px' }} />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#818cf8', fontWeight: 800, fontSize: '1.1rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>
                                            {booking.arrival.iata || booking.arrival.city}
                                        </p>
                                        <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.7rem', margin: '2px 0 0' }}>{booking.arrival.time || ''}</p>
                                    </div>
                                </div>
                            )}
                            <Row label="Airline" value={booking.airline} />
                            <Row label="Flight No." value={booking.flightNumber} />
                            <Row label="PNR" value={booking.pnr} />
                            <Row label="Booking Ref" value={booking.bookingReference} />
                            <Row label="Departure" value={booking.departure?.airport ? `${booking.departure.airport}${booking.departure.terminal ? `, T${booking.departure.terminal}` : ''}` : null} />
                            <Row label="Depart Date" value={booking.departure?.date} />
                            <Row label="Arrival" value={booking.arrival?.airport ? `${booking.arrival.airport}${booking.arrival.terminal ? `, T${booking.arrival.terminal}` : ''}` : null} />
                            <Row label="Arrive Date" value={booking.arrival?.date} />
                            <Row label="Seat" value={booking.seat} />
                            <Row label="Class" value={booking.class} />
                            <Row label="Baggage" value={booking.baggageAllowance} />
                            {Array.isArray(booking.layovers) && booking.layovers.length > 0 && (
                                <div style={{ marginTop: '12px' }}>
                                    <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.82rem', marginBottom: '8px' }}>Layovers</p>
                                    {booking.layovers.map((l, i) => (
                                        <div key={i} style={{
                                            padding: '8px 12px', borderRadius: '8px', marginBottom: '6px',
                                            background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)',
                                            display: 'flex', gap: '8px', alignItems: 'center',
                                        }}>
                                            <span style={{ color: '#fb923c', fontSize: '0.8rem', fontWeight: 700 }}>{l.iata || l.city}</span>
                                            <span style={{ color: 'var(--clr-text-dim)', fontSize: '0.78rem' }}>{l.duration}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Hotel */}
                    {type === 'hotel' && booking.hotel && (
                        <>
                            <Row label="Hotel" value={booking.hotel.name} />
                            <Row label="Check-in" value={booking.hotel.checkIn} />
                            <Row label="Check-out" value={booking.hotel.checkOut} />
                            <Row label="Room Type" value={booking.hotel.roomType} />
                            <Row label="Address" value={booking.hotel.address} />
                            <Row label="Booking Ref" value={booking.bookingReference} />
                        </>
                    )}

                    {/* Car Rental */}
                    {type === 'car_rental' && booking.carRental && (
                        <>
                            <Row label="Company" value={booking.carRental.company} />
                            <Row label="Pick-up" value={booking.carRental.pickupDate} />
                            <Row label="Return" value={booking.carRental.returnDate} />
                            <Row label="Location" value={booking.carRental.pickupLocation} />
                        </>
                    )}

                    {/* Tour */}
                    {type === 'tour' && booking.tour && (
                        <>
                            <Row label="Tour Name" value={booking.tour.name} />
                            <Row label="Start Date" value={booking.tour.startDate} />
                            <Row label="End Date" value={booking.tour.endDate} />
                            {Array.isArray(booking.tour.inclusions) && booking.tour.inclusions.length > 0 && (
                                <div style={{ marginTop: '12px' }}>
                                    <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.82rem', marginBottom: '8px' }}>Inclusions</p>
                                    {booking.tour.inclusions.map((inc, i) => (
                                        <p key={i} style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', margin: '4px 0', paddingLeft: '12px', borderLeft: '2px solid rgba(167,139,250,0.4)' }}>• {inc}</p>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Common */}
                    {booking.passengerName && <Row label="Passenger" value={booking.passengerName} />}
                    {booking.totalPrice && <Row label="Total Price" value={`${booking.currency || ''} ${booking.totalPrice}`} />}

                    {booking.summary && (
                        <div style={{
                            marginTop: '16px', padding: '14px 16px', borderRadius: '12px',
                            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)',
                        }}>
                            <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                                💬 {booking.summary}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── Itinerary Card ──────────────────────────────────────── */
const ItineraryCard = ({ itinerary }) => {
    const [expanded, setExpanded] = useState(true);
    if (!itinerary || !itinerary.trim()) return null;

    return (
        <div style={{
            borderRadius: '20px', overflow: 'hidden',
            background: 'var(--clr-card-bg)',
            border: '1.5px solid rgba(139,92,246,0.3)',
            animation: 'fadeInUp 0.5s ease 0.15s both',
            boxShadow: 'var(--clr-card-shadow)',
        }}>
            {/* Header */}
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '18px 24px', cursor: 'pointer',
                    background: 'linear-gradient(135deg,rgba(139,92,246,0.10),transparent)',
                    borderBottom: expanded ? '1px solid rgba(139,92,246,0.15)' : 'none',
                }}
            >
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Calendar size={18} style={{ color: '#a78bfa' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--clr-text)', fontWeight: 700, fontSize: '0.95rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>
                        AI-Generated Itinerary
                    </p>
                    <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.78rem', margin: '2px 0 0' }}>
                        Day-by-day travel plan built from your booking
                    </p>
                </div>
                <span style={{
                    padding: '3px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                    background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)',
                }}>
                    ITINERARY
                </span>
                {expanded
                    ? <ChevronUp size={16} style={{ color: 'var(--clr-text-dim)', flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: 'var(--clr-text-dim)', flexShrink: 0 }} />
                }
            </div>

            {/* Body — rendered markdown */}
            {expanded && (
                <div style={{ padding: '24px 28px', background: 'var(--clr-card-bg)' }}>
                    <div className="itinerary-md">
                        <ReactMarkdown>{itinerary}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── WhatsApp Preview ────────────────────────────────────── */
const WhatsAppPreview = ({ text, sent, error }) => (
    <div style={{
        borderRadius: '16px', overflow: 'hidden',
        background: 'var(--clr-card-bg)',
        border: `1.5px solid ${sent ? 'rgba(37,211,102,0.25)' : error ? 'rgba(239,68,68,0.2)' : 'rgba(37,211,102,0.15)'}`,
        animation: 'fadeInUp 0.5s ease 0.25s both',
        boxShadow: 'var(--clr-card-shadow)',
    }}>
        <div style={{
            padding: '12px 18px',
            background: sent ? 'rgba(37,211,102,0.08)' : 'var(--clr-surface)',
            borderBottom: '1px solid var(--clr-border)',
            display: 'flex', alignItems: 'center', gap: '10px',
        }}>
            <MessageSquare size={16} style={{ color: '#25d366' }} />
            <span style={{ color: '#25d366', fontWeight: 700, fontSize: '0.85rem' }}>WhatsApp Summary</span>
            {sent && (
                <span style={{
                    marginLeft: 'auto', padding: '2px 10px', borderRadius: '99px',
                    fontSize: '0.72rem', fontWeight: 700,
                    background: 'rgba(37,211,102,0.12)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)',
                }}>✓ SENT via Twilio</span>
            )}
            {!sent && error && (
                <span style={{
                    marginLeft: 'auto', padding: '2px 10px', borderRadius: '99px',
                    fontSize: '0.72rem', fontWeight: 700,
                    background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)',
                }}>⚠ Send Failed</span>
            )}
            {!sent && !error && (
                <span style={{
                    marginLeft: 'auto', padding: '2px 10px', borderRadius: '99px',
                    fontSize: '0.72rem', fontWeight: 600,
                    background: 'var(--clr-surface-2)', color: 'var(--clr-text-dim)', border: '1px solid var(--clr-border)',
                }}>Preview</span>
            )}
        </div>
        <div style={{
            padding: '18px', fontFamily: 'monospace', fontSize: '0.78rem',
            color: 'var(--clr-text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap',
            maxHeight: '360px', overflowY: 'auto',
            background: 'var(--clr-card-bg)',
        }}>
            {text}
        </div>
        {error && (
            <div style={{ padding: '10px 18px', background: 'rgba(239,68,68,0.05)', borderTop: '1px solid rgba(239,68,68,0.1)' }}>
                <p style={{ color: '#fca5a5', fontSize: '0.78rem', margin: 0 }}>⚠ Twilio error: {error}</p>
            </div>
        )}
    </div>
);

/* ─── Main Page ───────────────────────────────────────────── */
const TripScanner = () => {
    const [mode, setMode] = useState('text');
    const [rawText, setRawText] = useState('');
    const [file, setFile] = useState(null);
    const [passport, setPassport] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef();

    const EXAMPLE_TEXT = `Booking Confirmation - Emirates Airlines
Flight: EK 202
From: Mumbai (BOM) Terminal 2 to Dubai (DXB) Terminal 3
Date: 15 March 2025, Departure 02:30, Arrival 04:45
PNR: ABCD12
Seat: 34A Economy Class
Baggage Allowance: 30kg
Passenger: John Doe
Total Paid: INR 28,500
Layover: Frankfurt (FRA) — 2h 15m`;

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            let data;
            if (mode === 'text') {
                if (!rawText.trim()) throw new Error('Please paste your booking confirmation text.');
                data = await parseBookingText({
                    text: rawText,
                    passportCountry: passport || null,
                    whatsappNumber: whatsapp || null,
                });
            } else {
                if (!file) throw new Error('Please select or drop a booking image.');
                data = await parseBookingImage({
                    file,
                    passportCountry: passport || null,
                    whatsappNumber: whatsapp || null,
                });
            }
            setResult(data);
            setTimeout(() => {
                document.getElementById('scanner-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) { setFile(dropped); setMode('image'); }
    };

    return (
        <PageWrapper title="Trip DNA Scanner">
            {/* ── Hero ─────────────────────────────────────────────── */}
            <section style={{ padding: '72px 24px 48px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle,var(--orb-1) 0%,transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle,var(--orb-2) 0%,transparent 70%)', pointerEvents: 'none' }} />

                {/* Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 18px', borderRadius: '99px',
                    background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.28)',
                    color: 'var(--clr-primary-lt)', fontSize: '0.82rem', fontWeight: 700,
                    letterSpacing: '0.05em', marginBottom: '28px',
                }}>
                    <ScanLine size={13} /> AI TRIP DNA SCANNER
                </div>

                <h1 style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 'clamp(2rem,5vw,3.5rem)',
                    fontWeight: 800, lineHeight: 1.12, margin: '0 auto 20px', maxWidth: '680px',
                    color: 'var(--clr-text)',
                }}>
                    Forward a Booking.
                    <span style={{
                        display: 'block', marginTop: '4px',
                        background: 'linear-gradient(135deg,var(--clr-primary-lt),var(--clr-accent-lt),var(--clr-teal))',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        We Build Your Itinerary.
                    </span>
                </h1>

                <p style={{ color: 'var(--clr-text-dim)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
                    Paste any flight confirmation, hotel voucher, or booking email. RoamGenie's AI extracts every detail
                    and generates a complete day-by-day itinerary — automatically.
                </p>

                {/* Steps strip */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', justifyContent: 'center', marginTop: '32px' }}>
                    {[
                        { n: '1', label: 'Paste / Upload booking' },
                        { n: '2', label: 'AI scans & extracts' },
                        { n: '3', label: 'Itinerary built instantly' },
                        { n: '4', label: 'WhatsApp summary sent' },
                    ].map(({ n, label }) => (
                        <div key={n} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px', borderRadius: '99px',
                            background: 'var(--clr-surface)',
                            border: '1px solid var(--clr-border)',
                            fontSize: '0.78rem', color: 'var(--clr-text-muted)', margin: '4px',
                        }}>
                            <span style={{
                                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--clr-primary-lt)', fontWeight: 700, fontSize: '0.72rem',
                            }}>{n}</span>
                            {label}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Input Card ───────────────────────────────────────── */}
            <section style={{ padding: '0 24px 48px' }}>
                <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <Card glow style={{ padding: '32px' }}>

                        {/* Mode toggle */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                            {[
                                { id: 'text', label: 'Paste Text', icon: FileText },
                                { id: 'image', label: 'Upload Image', icon: Camera },
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setMode(id)}
                                    style={{
                                        flex: 1, padding: '10px 16px', borderRadius: '10px',
                                        border: mode === id
                                            ? '1.5px solid rgba(99,102,241,0.5)'
                                            : '1px solid var(--clr-border)',
                                        background: mode === id
                                            ? 'rgba(99,102,241,0.12)'
                                            : 'var(--clr-surface)',
                                        color: mode === id ? 'var(--clr-primary-lt)' : 'var(--clr-text-dim)',
                                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Icon size={15} /> {label}
                                </button>
                            ))}
                        </div>

                        {/* Text mode */}
                        {mode === 'text' && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Booking Confirmation Text
                                    </label>
                                    <button
                                        onClick={() => setRawText(EXAMPLE_TEXT)}
                                        style={{
                                            padding: '3px 12px', borderRadius: '8px',
                                            border: '1px solid rgba(99,102,241,0.3)',
                                            background: 'rgba(99,102,241,0.08)', color: 'var(--clr-primary-lt)',
                                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                        }}
                                    >
                                        Try example
                                    </button>
                                </div>
                                <textarea
                                    value={rawText}
                                    onChange={e => setRawText(e.target.value)}
                                    placeholder="Paste your flight confirmation, hotel voucher, tour booking, or any travel document here…"
                                    rows={9}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid var(--clr-border)',
                                        background: 'var(--clr-input-bg, var(--clr-surface))',
                                        color: 'var(--clr-text)',
                                        fontSize: '0.82rem', outline: 'none',
                                        boxSizing: 'border-box', transition: 'border-color 0.2s',
                                        resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace',
                                    }}
                                />
                            </div>
                        )}

                        {/* Image mode */}
                        {mode === 'image' && (
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    marginBottom: '20px', padding: '40px 24px', borderRadius: '16px', cursor: 'pointer',
                                    border: `2px dashed ${dragOver ? 'rgba(99,102,241,0.6)' : 'var(--clr-border)'}`,
                                    background: dragOver ? 'rgba(99,102,241,0.06)' : 'var(--clr-surface)',
                                    textAlign: 'center', transition: 'all 0.2s',
                                }}
                            >
                                <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                                {file ? (
                                    <div>
                                        <CheckCircle size={32} style={{ color: '#2dd4bf', marginBottom: '8px' }} />
                                        <p style={{ color: 'var(--clr-text)', fontWeight: 600, margin: '0 0 4px' }}>{file.name}</p>
                                        <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.8rem', margin: 0 }}>{(file.size / 1024).toFixed(1)} KB</p>
                                        <button
                                            onClick={e => { e.stopPropagation(); setFile(null); }}
                                            style={{
                                                marginTop: '12px', padding: '4px 14px', borderRadius: '8px',
                                                border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)',
                                                color: '#f87171', fontSize: '0.78rem', cursor: 'pointer',
                                            }}
                                        >
                                            <X size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload size={32} style={{ color: 'var(--clr-text-dim)', marginBottom: '12px' }} />
                                        <p style={{ color: 'var(--clr-text-muted)', fontWeight: 600, margin: '0 0 4px', fontSize: '0.95rem' }}>Drop your booking image here</p>
                                        <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.82rem', margin: 0 }}>or click to browse — supports JPG, PNG, PDF</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Optional fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                    Passport Country <span style={{ color: 'var(--clr-text-dim)', fontWeight: 400 }}>(optional — visa check)</span>
                                </label>
                                <input
                                    value={passport}
                                    onChange={e => setPassport(e.target.value)}
                                    placeholder="e.g. India"
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid var(--clr-border)',
                                        background: 'var(--clr-input-bg, var(--clr-surface))',
                                        color: 'var(--clr-text)',
                                        fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                    WhatsApp Number <span style={{ color: 'var(--clr-text-dim)', fontWeight: 400 }}>(optional — get itinerary on WhatsApp)</span>
                                </label>
                                <input
                                    value={whatsapp}
                                    onChange={e => setWhatsapp(e.target.value)}
                                    placeholder="+91 9876543210"
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid var(--clr-border)',
                                        background: 'var(--clr-input-bg, var(--clr-surface))',
                                        color: 'var(--clr-text)',
                                        fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Scan Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '14px 24px', borderRadius: '14px',
                                background: loading
                                    ? 'rgba(99,102,241,0.3)'
                                    : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                transition: 'all 0.2s',
                                boxShadow: loading ? 'none' : '0 4px 24px rgba(99,102,241,0.3)',
                            }}
                        >
                            <Sparkles size={16} />
                            {loading ? 'Scanning & Building Itinerary…' : 'Scan & Build Itinerary'}
                        </button>
                    </Card>
                </div>
            </section>

            {/* ── Loading ──────────────────────────────────────────── */}
            {loading && (
                <section style={{ padding: '0 24px 64px' }}>
                    <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
                        <Loader size="lg" text="AI is reading your booking and building your itinerary… 🗺️" />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                            {['Extracting booking data', 'Parsing with AI', 'Generating itinerary', 'Sending WhatsApp'].map((step, i) => (
                                <div key={step} style={{
                                    padding: '7px 16px', borderRadius: '10px',
                                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                    color: 'var(--clr-primary)', fontSize: '0.8rem', fontWeight: 600,
                                    animation: `fadeIn 0.4s ease ${i * 0.4}s both`,
                                }}>
                                    ✦ {step}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Error ────────────────────────────────────────────── */}
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
                                <p style={{ color: '#f87171', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px' }}>Scan Failed</p>
                                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', margin: 0 }}>{error}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Results ──────────────────────────────────────────── */}
            {result && !loading && (
                <section id="scanner-results" style={{ padding: '0 24px 80px' }}>
                    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Success banner */}
                        <div style={{
                            padding: '14px 22px', borderRadius: '14px',
                            background: 'rgba(34,197,94,0.07)', border: '1.5px solid rgba(34,197,94,0.25)',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            animation: 'fadeInUp 0.4s ease',
                        }}>
                            <CheckCircle size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
                            <p style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                                Booking scanned &amp; itinerary generated!
                                {result.whatsappSent && ' WhatsApp summary sent via Twilio ✓'}
                                {result.whatsappError && ` (WhatsApp: ${result.whatsappError})`}
                            </p>
                        </div>

                        {/* OCR raw text (image mode) */}
                        {result.ocrText && (
                            <details style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
                                <summary style={{
                                    padding: '12px 18px', cursor: 'pointer',
                                    color: 'var(--clr-text-dim)', fontSize: '0.82rem', fontWeight: 600,
                                    background: 'var(--clr-surface)', userSelect: 'none',
                                }}>
                                    📄 View Raw OCR Text
                                </summary>
                                <div style={{
                                    padding: '14px 18px', background: 'var(--clr-surface-2)',
                                    fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--clr-text-muted)',
                                    whiteSpace: 'pre-wrap', lineHeight: 1.6,
                                }}>
                                    {result.ocrText}
                                </div>
                            </details>
                        )}

                        {/* 1 — Booking card */}
                        {result.booking && <BookingCard booking={result.booking} />}

                        {/* 2 — Itinerary card */}
                        {result.itinerary && <ItineraryCard itinerary={result.itinerary} />}

                        {/* 3 — WhatsApp preview */}
                        {result.whatsappSummary && (
                            <WhatsAppPreview
                                text={result.whatsappSummary}
                                sent={result.whatsappSent}
                                error={result.whatsappError}
                            />
                        )}
                    </div>
                </section>
            )}

            <style>{`
                @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn   { from { opacity:0; }                             to { opacity:1; }                         }
                textarea:focus, input:focus { border-color: var(--clr-primary) !important; }

                /* ── Itinerary markdown — DARK ── */
                .itinerary-md h1, .itinerary-md h2 {
                    color: #a78bfa;
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 1.05rem; font-weight: 700;
                    margin: 1.4em 0 0.5em;
                    padding-bottom: 6px;
                    border-bottom: 1px solid rgba(139,92,246,0.15);
                }
                .itinerary-md h3 { color: #818cf8; font-size: 0.92rem; font-weight: 600; margin: 1em 0 0.4em; }
                .itinerary-md p  { color: var(--clr-text-muted); font-size: 0.88rem; line-height: 1.75; margin: 0.4em 0; }
                .itinerary-md ul, .itinerary-md ol { padding-left: 1.4em; }
                .itinerary-md li { color: var(--clr-text-muted); font-size: 0.87rem; margin: 0.3em 0; line-height: 1.6; }
                .itinerary-md strong { color: var(--clr-text); }
                .itinerary-md em     { color: var(--clr-text-dim); }
                .itinerary-md blockquote {
                    border-left: 3px solid rgba(139,92,246,0.4);
                    padding-left: 12px; margin: 8px 0;
                    color: var(--clr-text-dim); font-size: 0.85rem;
                }
                .itinerary-md hr { border: none; border-top: 1px solid var(--clr-border); margin: 1.2em 0; }

                /* ── Itinerary markdown — LIGHT overrides ── */
                :root.light .itinerary-md h1,
                :root.light .itinerary-md h2 {
                    color: #ea580c;
                    border-bottom-color: rgba(234,88,12,0.15);
                }
                :root.light .itinerary-md h3 { color: #c2410c; }
            `}</style>
        </PageWrapper>
    );
};

export default TripScanner;
