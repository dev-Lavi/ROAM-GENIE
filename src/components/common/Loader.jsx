import React from 'react';

const Loader = ({ size = 'md', text = '', fullScreen = false }) => {
    const sizes = { sm: 32, md: 56, lg: 80 };
    const px = sizes[size] || sizes.md;

    const content = (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
        }}>
            <div style={{ position: 'relative', width: px, height: px }}>
                {/* Outer ring */}
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: `${px / 14}px solid rgba(99,102,241,0.12)`,
                }} />
                {/* Spinning arc */}
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: `${px / 14}px solid transparent`,
                    borderTopColor: '#6366f1',
                    borderRightColor: '#8b5cf6',
                    animation: 'spin 0.8s cubic-bezier(0.6,0,0.4,1) infinite',
                }} />
                {/* Inner dot */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: px * 0.28, height: px * 0.28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    boxShadow: '0 0 16px rgba(99,102,241,0.6)',
                    animation: 'pulse-ring 1.2s ease-out infinite',
                }} />
            </div>
            {text && (
                <p style={{
                    color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500,
                    letterSpacing: '0.03em', margin: 0,
                }}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(8px)',
            }}>
                {content}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '48px 0',
        }}>
            {content}
        </div>
    );
};

export default Loader;
