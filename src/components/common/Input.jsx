import React from 'react';

const Input = ({
    label,
    id,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    icon,
    error,
    hint,
    required = false,
    style = {},
    inputStyle = {},
    inputProps = {},
    ...rest
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
            {label && (
                <label
                    htmlFor={id}
                    style={{
                        fontSize: '0.82rem', fontWeight: 600,
                        color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}
                >
                    {label} {required && <span style={{ color: '#f87171' }}>*</span>}
                </label>
            )}

            <div style={{ position: 'relative' }}>
                {icon && (
                    <span style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: '#6366f1', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                    }}>
                        {icon}
                    </span>
                )}
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    {...inputProps}
                    {...rest}
                    style={{
                        width: '100%',
                        padding: icon ? '11px 14px 11px 42px' : '11px 14px',
                        background: 'rgba(17,17,34,0.8)',
                        border: `1.5px solid ${error ? '#ef4444' : 'rgba(99,102,241,0.25)'}`,
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        fontSize: '0.94rem',
                        fontFamily: 'inherit',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        ...inputStyle,
                    }}
                    onFocus={e => {
                        e.target.style.borderColor = '#6366f1';
                        e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
                    }}
                    onBlur={e => {
                        e.target.style.borderColor = error ? '#ef4444' : 'rgba(99,102,241,0.25)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.78rem', margin: 0 }}>{error}</p>}
            {hint && <p style={{ color: '#64748b', fontSize: '0.78rem', margin: 0 }}>{hint}</p>}
        </div>
    );
};

export default Input;
