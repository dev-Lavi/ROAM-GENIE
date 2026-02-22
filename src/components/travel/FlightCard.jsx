import React, { useState } from 'react';
import {
    Clock, ExternalLink, Plane, ChevronDown, ChevronUp,
    MapPin, Info,
} from 'lucide-react';
import { formatDuration } from '../../utils/helpers';

const CLASS_META = {
    economy:         { bg: 'rgba(20,184,166,0.12)',  color: '#2dd4bf', border: 'rgba(20,184,166,0.3)',  label: 'Economy' },
    premium_economy: { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8', border: 'rgba(99,102,241,0.3)',  label: 'Premium Economy' },
    business:        { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)', label: 'Business' },
    first:           { bg: 'rgba(236,72,153,0.12)', color: '#f472b6', border: 'rgba(236,72,153,0.3)', label: 'First Class' },
    first_class:     { bg: 'rgba(236,72,153,0.12)', color: '#f472b6', border: 'rgba(236,72,153,0.3)', label: 'First Class' },
};

const parseTime = (val) => {
    if (!val) return { time: null, date: null, raw: null };
    const s = typeof val === 'string' ? val.trim() : String(val);
    const iso = s.includes('T') ? s : s.replace(' ', 'T');
    const d = new Date(iso);
    if (isNaN(d.getTime())) return { time: null, date: null, raw: s };
    return {
        time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        raw: s,
    };
};

const formatINR = (n) =>
    n ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : '—';

/* ── Booking link: Google Flights fallback ── */
const buildBookingLink = (link, source, destination, departure) => {
    if (link && link !== '#') return link;
    const date = departure ? departure.slice(0, 10).replace(/-/g, '') : '';
    return `https://www.google.com/travel/flights?q=flights+from+${source || ''}+to+${destination || ''}+on+${date}`;
};

/* ── Single leg detail row ── */
const LegRow = ({ leg, idx, palette }) => {
    const dep = parseTime(leg.depTime);
    const arr = parseTime(leg.arrTime);
    return (
        <div style={{
            padding: '14px 16px', borderRadius: '12px',
            background: idx % 2 === 0 ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(99,102,241,0.1)', marginBottom: '8px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <Plane size={13} style={{ color: '#818cf8' }} />
                <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.88rem' }}>{leg.airline || 'Airline'}</span>
                {leg.flightNumber && (
                    <span style={{
                        padding: '1px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                        background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)',
                    }}>{leg.flightNumber}</span>
                )}
                {leg.aircraft && (
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>• {leg.aircraft}</span>
                )}
                {leg.travelClass && (
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>• {leg.travelClass}</span>
                )}
                {leg.legroom && (
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>• 🪑 {leg.legroom}</span>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '1.1rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>
                        {dep.time || '--:--'}
                    </p>
                    <p style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.82rem', margin: '1px 0 0' }}>{leg.depCode}</p>
                    <p style={{ color: '#64748b', fontSize: '0.68rem', margin: 0 }}>{leg.depName}</p>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', minWidth: '80px' }}>
                    {leg.duration && (
                        <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', gap: '3px', alignItems: 'center' }}>
                            <Clock size={10} />{formatDuration(leg.duration)}
                        </span>
                    )}
                    <div style={{ width: '100%', height: '1.5px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                </div>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '1.1rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>
                        {arr.time || '--:--'}
                    </p>
                    <p style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.82rem', margin: '1px 0 0' }}>{leg.arrCode}</p>
                    <p style={{ color: '#64748b', fontSize: '0.68rem', margin: 0 }}>{leg.arrName}</p>
                </div>
            </div>
        </div>
    );
};

/* ── Layover badge ── */
const LayoverBadge = ({ layover }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 14px', borderRadius: '10px', margin: '4px 0',
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
    }}>
        <MapPin size={13} style={{ color: '#fbbf24' }} />
        <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
            Layover in {layover.name || layover.id || 'Transit'} — {layover.duration ? formatDuration(layover.duration) : ''}
        </span>
    </div>
);

/* ── Main FlightCard ── */
const FlightCard = ({
    airline = '',
    price = 0,
    departure = null,
    arrival = null,
    duration = null,
    stops = 0,
    flightClass = 'economy',
    link = null,
    logoUrl = null,
    depAirportCode = '',
    depAirportName = '',
    arrAirportCode = '',
    arrAirportName = '',
    flightNumber = '',
    aircraft = '',
    layovers = [],
    allLegs = [],
    index = 0,
    // These come from parent (TravelPlan) if leg codes are blank
    sourceCode = '',
    destinationCode = '',
}) => {
    const [expanded, setExpanded] = useState(false);

    const classKey = (flightClass || 'economy').toLowerCase().replace(/\s+/g, '_');
    const cls = CLASS_META[classKey] || CLASS_META.economy;

    const dep = parseTime(departure);
    const arr = parseTime(arrival);

    const depCode = depAirportCode || sourceCode;
    const arrCode = arrAirportCode || destinationCode;
    const bookingUrl = buildBookingLink(link, depCode, arrCode, departure);

    const displayAirline = airline || 'Airline';
    const hasFullLegs = allLegs.length > 0;
    const hasLayovers = layovers.length > 0;
    const hasDetails = hasFullLegs || flightNumber || aircraft || depAirportName || arrAirportName;

    return (
        <div style={{
            borderRadius: '20px',
            background: 'rgba(10,10,25,0.9)',
            border: `1.5px solid ${expanded ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.14)'}`,
            boxShadow: expanded ? '0 16px 48px rgba(99,102,241,0.2)' : '0 4px 24px rgba(0,0,0,0.25)',
            animation: `fadeInUp 0.4s ease ${index * 0.08}s both`,
            transition: 'all 0.3s ease',
            overflow: 'hidden',
        }}>
            {/* ── Gradient accent ── */}
            <div style={{ height: '2px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#2dd4bf)' }} />

            {/* ── Main Row ── */}
            <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>

                {/* Airline logo + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '170px', flex: '1.2' }}>
                    <div style={{
                        width: '54px', height: '54px', borderRadius: '14px',
                        background: 'rgba(99,102,241,0.1)', border: '1.5px solid rgba(99,102,241,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden',
                    }}>
                        {logoUrl
                            ? <img src={logoUrl} alt={displayAirline}
                                style={{ width: '38px', height: '38px', objectFit: 'contain' }}
                                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                            : null
                        }
                        <Plane size={22} style={{ color: '#818cf8', display: logoUrl ? 'none' : 'block' }} />
                    </div>
                    <div>
                        <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', margin: '0 0 4px', fontFamily: "'Space Grotesk',sans-serif" }}>
                            {displayAirline}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{
                                padding: '2px 9px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                                background: cls.bg, color: cls.color, border: `1px solid ${cls.border}`,
                            }}>
                                {cls.label}
                            </span>
                            {flightNumber && (
                                <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>{flightNumber}</span>
                            )}
                        </div>
                        {aircraft && (
                            <p style={{ color: '#64748b', fontSize: '0.7rem', margin: '3px 0 0' }}>✈ {aircraft}</p>
                        )}
                    </div>
                </div>

                {/* Route timeline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '2.5', justifyContent: 'center', flexWrap: 'wrap' }}>

                    {/* Departure */}
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#e2e8f0', fontWeight: 900, fontSize: '1.7rem', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Space Grotesk',sans-serif" }}>
                            {dep.time || '--:--'}
                        </p>
                        {depCode && (
                            <p style={{ color: '#818cf8', fontWeight: 800, fontSize: '0.9rem', margin: '2px 0 0', letterSpacing: '0.05em' }}>
                                {depCode}
                            </p>
                        )}
                        {dep.date && (
                            <p style={{ color: '#475569', fontSize: '0.7rem', margin: '2px 0 0' }}>{dep.date}</p>
                        )}
                        {depAirportName && (
                            <p style={{ color: '#475569', fontSize: '0.66rem', margin: '1px 0 0', maxWidth: '100px' }}>{depAirportName}</p>
                        )}
                    </div>

                    {/* Duration connector */}
                    <div style={{ flex: 1, minWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        {duration && (
                            <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <Clock size={12} />{formatDuration(duration)}
                            </span>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg,rgba(99,102,241,0.5),rgba(139,92,246,0.5))' }} />
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '50%',
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                boxShadow: '0 0 14px rgba(99,102,241,0.5)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Plane size={14} style={{ color: '#fff' }} />
                            </div>
                            <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg,rgba(139,92,246,0.5),rgba(20,184,166,0.5))' }} />
                        </div>
                        <span style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px',
                            background: stops === 0 ? 'rgba(20,184,166,0.14)' : 'rgba(245,158,11,0.14)',
                            color: stops === 0 ? '#2dd4bf' : '#fbbf24',
                            border: `1px solid ${stops === 0 ? 'rgba(20,184,166,0.35)' : 'rgba(245,158,11,0.35)'}`,
                        }}>
                            {stops === 0 ? '✦ Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`}
                        </span>
                    </div>

                    {/* Arrival */}
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#e2e8f0', fontWeight: 900, fontSize: '1.7rem', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Space Grotesk',sans-serif" }}>
                            {arr.time || '--:--'}
                        </p>
                        {arrCode && (
                            <p style={{ color: '#818cf8', fontWeight: 800, fontSize: '0.9rem', margin: '2px 0 0', letterSpacing: '0.05em' }}>
                                {arrCode}
                            </p>
                        )}
                        {arr.date && (
                            <p style={{ color: '#475569', fontSize: '0.7rem', margin: '2px 0 0' }}>{arr.date}</p>
                        )}
                        {arrAirportName && (
                            <p style={{ color: '#475569', fontSize: '0.66rem', margin: '1px 0 0', maxWidth: '100px' }}>{arrAirportName}</p>
                        )}
                    </div>
                </div>

                {/* Price + CTAs */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '150px' }}>
                    <div>
                        <p style={{ color: '#64748b', fontSize: '0.68rem', margin: '0 0 2px', textAlign: 'right', fontWeight: 500 }}>Per person</p>
                        <p style={{
                            color: '#a5b4fc', fontWeight: 900, fontSize: '1.65rem', margin: 0,
                            fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.02em',
                        }}>
                            {formatINR(price)}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {hasDetails && (
                            <button
                                onClick={() => setExpanded(e => !e)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    padding: '8px 12px', borderRadius: '11px', cursor: 'pointer',
                                    background: expanded ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${expanded ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                    color: expanded ? '#818cf8' : '#64748b',
                                    fontWeight: 600, fontSize: '0.78rem', fontFamily: 'inherit',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                Details
                            </button>
                        )}
                        <a
                            href={bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '9px 18px', borderRadius: '12px',
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                color: '#fff', fontWeight: 700, fontSize: '0.84rem',
                                textDecoration: 'none',
                                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.6)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)'; }}
                        >
                            Book <ExternalLink size={13} />
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Expanded Details Panel ── */}
            {expanded && (
                <div style={{
                    padding: '0 24px 24px',
                    borderTop: '1px solid rgba(99,102,241,0.15)',
                    animation: 'fadeInUp 0.25s ease',
                }}>
                    {/* Two booking options */}
                    <div style={{
                        display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '16px 0 20px',
                        borderBottom: '1px solid rgba(99,102,241,0.1)',
                    }}>
                        <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600, alignSelf: 'center' }}>Book on:</span>
                        {[
                            { label: '✈ Google Flights', url: `https://www.google.com/travel/flights?q=flights+${depCode}+to+${arrCode}+${departure?.slice(0, 10) || ''}` },
                            { label: '🌐 MakeMyTrip', url: `https://www.makemytrip.com/flights/` },
                            { label: '🌐 EaseMyTrip', url: `https://www.easemytrip.com/` },
                            { label: '🌐 IXIGO', url: `https://www.ixigo.com/` },
                        ].map(({ label, url }) => (
                            <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{
                                padding: '5px 14px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                                color: '#818cf8', textDecoration: 'none', transition: 'all 0.2s',
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                            >
                                {label}
                            </a>
                        ))}
                    </div>

                    {/* Leg-by-leg breakdown */}
                    {hasFullLegs && (
                        <div style={{ paddingTop: '16px' }}>
                            <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>
                                Flight Segments
                            </p>
                            {allLegs.map((leg, i) => (
                                <React.Fragment key={i}>
                                    <LegRow leg={leg} idx={i} />
                                    {layovers[i] && <LayoverBadge layover={layovers[i]} />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* Summary info chips when no legs */}
                    {!hasFullLegs && (depAirportName || arrAirportName || aircraft) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '16px' }}>
                            {depAirportName && (
                                <div style={chipStyle}>
                                    <MapPin size={12} style={{ color: '#6366f1' }} />
                                    <span>From: {depAirportName} ({depCode})</span>
                                </div>
                            )}
                            {arrAirportName && (
                                <div style={chipStyle}>
                                    <MapPin size={12} style={{ color: '#6366f1' }} />
                                    <span>To: {arrAirportName} ({arrCode})</span>
                                </div>
                            )}
                            {aircraft && (
                                <div style={chipStyle}>
                                    <Plane size={12} style={{ color: '#6366f1' }} />
                                    <span>{aircraft}</span>
                                </div>
                            )}
                            {flightNumber && (
                                <div style={chipStyle}>
                                    <Info size={12} style={{ color: '#6366f1' }} />
                                    <span>Flight {flightNumber}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const chipStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '5px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 500,
    background: 'rgba(99,102,241,0.07)', color: '#94a3b8',
    border: '1px solid rgba(99,102,241,0.15)',
};

export default FlightCard;
