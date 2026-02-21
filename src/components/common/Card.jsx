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
                background: 'rgba(17,17,34,0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(99,102,241,0.18)',
                borderRadius: '20px',
                padding,
                boxShadow: glow
                    ? '0 0 40px rgba(99,102,241,0.15), 0 4px 24px rgba(0,0,0,0.4)'
                    : '0 4px 24px rgba(0,0,0,0.35)',
                ...hoverStyle,
                ...style,
            }}
            onMouseEnter={e => {
                if (!hover) return;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(129,140,248,0.35)';
                e.currentTarget.style.boxShadow = glow
                    ? '0 0 60px rgba(99,102,241,0.25), 0 12px 40px rgba(0,0,0,0.5)'
                    : '0 12px 40px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={e => {
                if (!hover) return;
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)';
                e.currentTarget.style.boxShadow = glow
                    ? '0 0 40px rgba(99,102,241,0.15), 0 4px 24px rgba(0,0,0,0.4)'
                    : '0 4px 24px rgba(0,0,0,0.35)';
            }}
        >
            {children}
        </div>
    );
};

export default Card;
