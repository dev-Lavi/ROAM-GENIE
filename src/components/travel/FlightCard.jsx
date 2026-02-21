import React from 'react';
import { Clock, ExternalLink, ArrowRight, Zap } from 'lucide-react';
import Card from '../common/Card';
import { formatDuration } from '../../utils/helpers';

const CLASS_COLORS = {
    economy: { bg: 'rgba(20,184,166,0.12)', color: '#2dd4bf', border: 'rgba(20,184,166,0.3)' },
    premium_economy: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
    business: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    first: { bg: 'rgba(236,72,153,0.12)', color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
};

const FlightCard = ({
    airline = 'Unknown Airline',
    price = 0,
    departure = '',
    arrival = '',
    duration,
    stops = 0,
    flightClass = 'economy',
    link = '#',
    logoUrl,
    index = 0,
}) => {
    const cls = CLASS_COLORS[flightClass] || CLASS_COLORS.economy;
    const fmtPx = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

    const depTime = departure ? new Date(departure).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--';
    const arrTime = arrival ? new Date(arrival).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--';
    const depDate = departure ? new Date(departure).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';
    const arrDate = arrival ? new Date(arrival).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';

    return (
        <Card style={{ animation: `fadeInUp 0.4s ease ${index * 0.08}s both` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>

                {/* Airline Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '180px', flex: '1' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden',
                    }}>
                        {logoUrl
                            ? <img src={logoUrl} alt={airline} style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                            : <span style={{ fontSize: '1.3rem' }}>✈</span>
                        }
                    </div>
                    <div>
                        <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{airline}</p>
                        <span style={{
                            display: 'inline-block', marginTop: '4px',
                            padding: '2px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
                            background: cls.bg, color: cls.color, border: `1px solid ${cls.border}`,
                        }}>
                            {flightClass.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Route Timeline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '2', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* Departure */}
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '1.5rem', margin: 0, letterSpacing: '-0.01em' }}>{depTime}</p>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '2px 0 0', fontWeight: 500 }}>{depDate}</p>
                    </div>

                    {/* Duration line */}
                    <div style={{ flex: 1, minWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '0.75rem', color: '#64748b', fontWeight: 500,
                        }}>
                            <Clock size={12} />
                            {duration ? formatDuration(duration) : '—'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(99,102,241,0.4),rgba(139,92,246,0.4))' }} />
                            <div style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                boxShadow: '0 0 8px rgba(99,102,241,0.6)',
                                flexShrink: 0,
                            }} />
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(139,92,246,0.4),rgba(99,102,241,0.4))' }} />
                        </div>
                        <span style={{
                            fontSize: '0.72rem', fontWeight: 600, padding: '1px 8px', borderRadius: '99px',
                            background: stops === 0 ? 'rgba(20,184,166,0.12)' : 'rgba(245,158,11,0.12)',
                            color: stops === 0 ? '#2dd4bf' : '#fbbf24',
                            border: `1px solid ${stops === 0 ? 'rgba(20,184,166,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        }}>
                            {stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`}
                        </span>
                    </div>

                    {/* Arrival */}
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '1.5rem', margin: 0, letterSpacing: '-0.01em' }}>{arrTime}</p>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '2px 0 0', fontWeight: 500 }}>{arrDate}</p>
                    </div>
                </div>

                {/* Price & CTA */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '140px' }}>
                    <div>
                        <p style={{ color: '#64748b', fontSize: '0.72rem', margin: 0, textAlign: 'right' }}>Per person</p>
                        <p style={{
                            color: '#a5b4fc', fontWeight: 800, fontSize: '1.5rem', margin: 0,
                            fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.02em',
                        }}>
                            {fmtPx}
                        </p>
                    </div>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '9px 18px', borderRadius: '12px',
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                            textDecoration: 'none', transition: 'all 0.2s',
                            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.55)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.4)'; }}
                    >
                        Book <ExternalLink size={13} />
                    </a>
                </div>
            </div>
        </Card>
    );
};

export default FlightCard;
