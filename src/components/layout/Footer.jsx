import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Globe, Mail, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => (
    <footer style={{
        background: 'rgba(10,10,20,0.95)',
        borderTop: '1px solid rgba(99,102,241,0.15)',
        padding: '56px 24px 32px',
        marginTop: 'auto',
    }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
                gap: '40px',
                marginBottom: '48px',
            }}>
                {/* Brand */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <img src="/logo.png" alt="RoamGenie" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        </div>
                        <span style={{
                            fontFamily: "'Space Grotesk',sans-serif",
                            fontWeight: 700, fontSize: '1.1rem',
                            background: 'linear-gradient(135deg,#818cf8,#a78bfa)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>RoamGenie</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: '220px' }}>
                        AI-powered travel planning. Flights, hotels & itineraries — all in one place.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        {[Twitter, Instagram, Github].map((Icon, i) => (
                            <a key={i} href="#" style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#6366f1', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                            >
                                <Icon size={16} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quick Links</h4>
                    {[['/', 'Plan a Trip'], ['/passport', 'Passport Lookup'], ['/ivr', 'IVR Assistant'], ['/contact', 'Contact Us']].map(([to, label]) => (
                        <Link key={to} to={to} style={{ display: 'block', color: '#64748b', fontSize: '0.88rem', marginBottom: '10px', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
                            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                        >
                            → {label}
                        </Link>
                    ))}
                </div>

                {/* Features */}
                <div>
                    <h4 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Features</h4>
                    {['AI Itinerary Gen', 'Real-time Flights', 'Hotel Discovery', 'Visa Assistance', 'IVR Booking'].map(f => (
                        <p key={f} style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '10px' }}>✦ {f}</p>
                    ))}
                </div>

                {/* Contact */}
                <div>
                    <h4 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Contact</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.88rem', marginBottom: '12px' }}>
                        <Mail size={14} style={{ color: '#6366f1' }} />
                        roamgenie@example.com
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.88rem' }}>
                        <Globe size={14} style={{ color: '#6366f1' }} />
                        roamgenie.app
                    </div>
                </div>
            </div>

            <div style={{
                borderTop: '1px solid rgba(99,102,241,0.1)',
                paddingTop: '24px',
                display: 'flex', flexWrap: 'wrap', gap: '12px',
                alignItems: 'center', justifyContent: 'space-between',
            }}>
                <p style={{ color: '#475569', fontSize: '0.82rem', margin: 0 }}>
                    © 2025 RoamGenie · Built with ❤️ for travellers
                </p>
                <p style={{ color: '#475569', fontSize: '0.82rem', margin: 0 }}>
                    Powered by AI · All rights reserved
                </p>
            </div>
        </div>
    </footer>
);

export default Footer;
