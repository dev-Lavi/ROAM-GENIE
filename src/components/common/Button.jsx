import React from 'react';
import { useApp } from '../../context/AppContext';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    type = 'button',
    style = {},
    ...rest
}) => {
    const { theme } = useApp();
    const isLight = theme === 'light';

    // ── Variant styles (theme-aware) ───────────────────────────────────────────
    const variants = {
        primary: {
            background: isLight
                ? 'linear-gradient(135deg,#ea580c,#f97316)'
                : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff',
            border: 'none',
            boxShadow: isLight
                ? '0 4px 24px rgba(234,88,12,0.30)'
                : '0 4px 24px rgba(99,102,241,0.35)',
        },
        secondary: {
            background: 'transparent',
            color: isLight ? '#ea580c' : '#818cf8',
            border: isLight ? '1.5px solid rgba(234,88,12,0.5)' : '1.5px solid rgba(99,102,241,0.5)',
            boxShadow: 'none',
        },
        ghost: {
            background: isLight ? 'rgba(234,88,12,0.08)' : 'rgba(99,102,241,0.08)',
            color: isLight ? '#ea580c' : '#a5b4fc',
            border: isLight ? '1px solid rgba(234,88,12,0.2)' : '1px solid rgba(99,102,241,0.2)',
            boxShadow: 'none',
        },
        danger: {
            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 20px rgba(239,68,68,0.3)',
        },
    };

    const sizes = {
        sm: { padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' },
        md: { padding: '10px 22px', fontSize: '0.92rem', borderRadius: '12px' },
        lg: { padding: '14px 32px', fontSize: '1rem', borderRadius: '14px' },
        xl: { padding: '16px 42px', fontSize: '1.1rem', borderRadius: '16px' },
    };

    const v = variants[variant] || variants.primary;
    const s = sizes[size] || sizes.md;

    const hoverShadow = variant === 'primary'
        ? (isLight ? '0 8px 32px rgba(234,88,12,0.45)' : '0 8px 32px rgba(99,102,241,0.5)')
        : v.boxShadow;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            {...rest}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                fontWeight: 600,
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                outline: 'none',
                width: fullWidth ? '100%' : 'auto',
                letterSpacing: '0.01em',
                ...v,
                ...s,
                ...style,
            }}
            onMouseEnter={e => {
                if (disabled || loading) return;
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = hoverShadow;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = v.boxShadow;
            }}
        >
            {loading ? (
                <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
            ) : icon}
            {children}
        </button>
    );
};

export default Button;
