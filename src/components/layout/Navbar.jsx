import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, Map, FileText, Phone, Menu, X, ScanLine, Shield, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_LINKS = [
    { to: '/', label: 'Plan Trip', icon: <Plane size={16} /> },
    { to: '/scanner', label: 'Trip Scanner', icon: <ScanLine size={16} /> },
    { to: '/warroom', label: 'War Room', icon: <Shield size={16} /> },
    { to: '/passport', label: 'Passport', icon: <FileText size={16} /> },
    { to: '/ivr', label: 'IVR', icon: <Phone size={16} /> },
    { to: '/contact', label: 'Contact Us', icon: <Map size={16} /> },
];

const Navbar = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useApp();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const isLight = theme === 'light';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setOpen(false); }, [location]);

    // Dynamic colours based on theme
    const navBg = scrolled
        ? (isLight ? 'rgba(240,244,255,0.97)' : 'rgba(10,10,20,0.92)')
        : (isLight ? 'rgba(240,244,255,0.85)' : 'rgba(10,10,20,0.6)');

    const navBorder = scrolled
        ? (isLight ? 'rgba(79,70,229,0.18)' : 'rgba(99,102,241,0.2)')
        : '1px solid transparent';

    const activeBg = isLight ? 'rgba(79,70,229,0.10)' : 'rgba(99,102,241,0.18)';
    const activeClr = isLight ? '#4f46e5' : '#818cf8';
    const activeBorder = isLight ? '1px solid rgba(79,70,229,0.28)' : '1px solid rgba(99,102,241,0.35)';
    const inactiveClr = isLight ? '#4338ca' : '#94a3b8';

    const drawerBg = isLight ? 'rgba(240,244,255,0.99)' : 'rgba(10,10,20,0.97)';
    const drawerBorder = isLight ? '1px solid rgba(79,70,229,0.18)' : '1px solid rgba(99,102,241,0.2)';

    return (
        <>
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                padding: '0 24px', height: '68px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: navBg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: scrolled ? (isLight ? '1px solid rgba(79,70,229,0.18)' : '1px solid rgba(99,102,241,0.2)') : '1px solid transparent',
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
                <ul style={{ display: 'flex', gap: '4px', listStyle: 'none', margin: 0, padding: 0 }} className="hidden md:flex">
                    {NAV_LINKS.map(({ to, label, icon }) => {
                        const active = location.pathname === to;
                        return (
                            <li key={to}>
                                <Link to={to} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '7px 14px', borderRadius: '10px',
                                    fontSize: '0.86rem', fontWeight: 600, letterSpacing: '0.01em',
                                    background: active ? activeBg : 'transparent',
                                    color: active ? activeClr : inactiveClr,
                                    border: active ? activeBorder : '1px solid transparent',
                                    transition: 'all 0.2s', textDecoration: 'none',
                                }}
                                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = activeClr; e.currentTarget.style.background = isLight ? 'rgba(79,70,229,0.06)' : 'rgba(99,102,241,0.08)'; } }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = inactiveClr; e.currentTarget.style.background = 'transparent'; } }}
                                >
                                    {icon}{label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Right side: theme toggle + burger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Theme Toggle */}
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        aria-label="Toggle theme"
                    >
                        {isLight
                            ? <Moon size={18} key="moon" />
                            : <Sun size={18} key="sun" />
                        }
                    </button>

                    {/* Burger (mobile) */}
                    <button
                        onClick={() => setOpen(o => !o)}
                        style={{
                            background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.1)',
                            border: isLight ? '1px solid rgba(79,70,229,0.2)' : '1px solid rgba(99,102,241,0.2)',
                            color: isLight ? '#4f46e5' : '#818cf8',
                            borderRadius: '10px', width: '40px', height: '40px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                        className="md:hidden"
                        aria-label="Toggle navigation"
                    >
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Drawer */}
            {open && (
                <div style={{
                    position: 'fixed', top: '68px', left: 0, right: 0, zIndex: 999,
                    background: drawerBg,
                    backdropFilter: 'blur(24px)',
                    borderBottom: drawerBorder,
                    padding: '16px',
                    animation: 'fadeInUp 0.2s ease',
                }}>
                    {NAV_LINKS.map(({ to, label, icon }) => {
                        const active = location.pathname === to;
                        return (
                            <Link key={to} to={to} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '13px 16px', borderRadius: '12px',
                                color: active ? activeClr : inactiveClr,
                                background: active ? activeBg : 'transparent',
                                fontWeight: 600, fontSize: '0.95rem',
                                textDecoration: 'none', marginBottom: '4px',
                            }}>
                                {icon}{label}
                            </Link>
                        );
                    })}

                    {/* Theme toggle in mobile drawer too */}
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        style={{ marginTop: '8px', width: '100%', borderRadius: '12px', height: '44px', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}
                    >
                        {isLight ? <Moon size={16} /> : <Sun size={16} />}
                        {isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    </button>
                </div>
            )}
        </>
    );
};

export default Navbar;
