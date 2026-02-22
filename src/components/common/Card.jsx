import React from 'react';

const Card = ({
    children,
    style = {},
    className = '',
    hover = true,
    glow = false,
    padding = '24px',
    onClick,
}) => {
    const hoverStyle = hover ? {
        transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        cursor: onClick ? 'pointer' : 'default',
    } : {};

    return (
        <div
            className={className}
            onClick={onClick}
            style={{
                background: 'var(--clr-card-bg)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--clr-card-border)',
                borderRadius: '20px',
                padding,
                boxShadow: glow ? 'var(--clr-card-glow)' : 'var(--clr-card-shadow)',
                transition: 'background 0.35s ease, border-color 0.35s ease, transform 0.25s ease, box-shadow 0.25s ease',
                ...hoverStyle,
                ...style,
            }}
            onMouseEnter={e => {
                if (!hover) return;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--clr-border-lt)';
                e.currentTarget.style.boxShadow = glow
                    ? '0 0 60px rgba(99,102,241,0.22), 0 12px 40px rgba(0,0,0,0.35)'
                    : '0 12px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={e => {
                if (!hover) return;
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = 'var(--clr-card-border)';
                e.currentTarget.style.boxShadow = glow ? 'var(--clr-card-glow)' : 'var(--clr-card-shadow)';
            }}
        >
            {children}
        </div>
    );
};

export default Card;
