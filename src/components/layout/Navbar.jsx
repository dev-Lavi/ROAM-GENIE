import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, Map, FileText, Phone, Menu, X } from 'lucide-react';

const NAV_LINKS = [
    { to: '/', label: 'Plan Trip', icon: <Plane size={16} /> },
    { to: '/passport', label: 'Passport', icon: <FileText size={16} /> },
    { to: '/ivr', label: 'IVR', icon: <Phone size={16} /> },
    { to: '/contact', label: 'Contact', icon: <Map size={16} /> },
];

const Navbar = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setOpen(false); }, [location]);

    return (
        <>
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                padding: '0 24px',
                height: '68px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: scrolled
                    ? 'rgba(10,10,20,0.92)'
                    : 'rgba(10,10,20,0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: scrolled
                    ? '1px solid rgba(99,102,241,0.2)'
                    : '1px solid transparent',
                transition: 'background 0.3s, border-color 0.3s',
            }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(99,102,241,0.45)',
                    }}>
                        <img src="/logo.png" alt="RoamGenie" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    </div>
                    <span style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontWeight: 700, fontSize: '1.25rem',
                        background: 'linear-gradient(135deg,#818cf8,#a78bfa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        RoamGenie
                    </span>
                </Link>

                {/* Desktop Links */}
                <ul style={{
                    display: 'flex', gap: '6px', listStyle: 'none',
                    margin: 0, padding: 0,
                    '@media(maxWidth:768px)': { display: 'none' },
                }} className="hidden md:flex">
                    {NAV_LINKS.map(({ to, label, icon }) => {
                        const active = location.pathname === to;
                        return (
                            <li key={to}>
                                <Link to={to} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '7px 16px', borderRadius: '10px',
                                    fontSize: '0.88rem', fontWeight: 600,
                                    letterSpacing: '0.01em',
                                    background: active ? 'rgba(99,102,241,0.18)' : 'transparent',
                                    color: active ? '#818cf8' : '#94a3b8',
                                    border: active ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                                    transition: 'all 0.2s',
                                    textDecoration: 'none',
                                }}>
                                    {icon}{label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* CTA */}
                <Link to="/" style={{
                    padding: '8px 20px', borderRadius: '12px',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', fontSize: '0.88rem', fontWeight: 700,
                    letterSpacing: '0.01em', textDecoration: 'none',
                    boxShadow: '0 4px 18px rgba(99,102,241,0.4)',
                    transition: 'all 0.2s',
                    display: 'none',
                }} className="hidden md:inline-flex"
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.4)'}
                >
                    ✈ Plan Now
                </Link>

                {/* Burger */}
                <button
                    onClick={() => setOpen(o => !o)}
                    style={{
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        color: '#818cf8', borderRadius: '10px',
                        width: '40px', height: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                    className="md:hidden"
                    aria-label="Toggle navigation"
                >
                    {open ? <X size={20} /> : <Menu size={20} />}
                </button>
            </nav>

            {/* Mobile Drawer */}
            {open && (
                <div style={{
                    position: 'fixed', top: '68px', left: 0, right: 0, zIndex: 999,
                    background: 'rgba(10,10,20,0.97)',
                    backdropFilter: 'blur(24px)',
                    borderBottom: '1px solid rgba(99,102,241,0.2)',
                    padding: '16px',
                    animation: 'fadeInUp 0.2s ease',
                }}>
                    {NAV_LINKS.map(({ to, label, icon }) => {
                        const active = location.pathname === to;
                        return (
                            <Link key={to} to={to} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '13px 16px', borderRadius: '12px',
                                color: active ? '#818cf8' : '#94a3b8',
                                background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                                fontWeight: 600, fontSize: '0.95rem',
                                textDecoration: 'none', marginBottom: '4px',
                            }}>
                                {icon}{label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default Navbar;
