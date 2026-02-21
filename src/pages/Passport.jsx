import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/common/Card';
import { FileText, Upload, Globe } from 'lucide-react';

const Passport = () => (
    <PageWrapper title="Passport Lookup">
        <section style={{ padding: '80px 24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{
                    width: '72px', height: '72px', borderRadius: '20px',
                    background: 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.2))',
                    border: '1.5px solid rgba(99,102,241,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                }}>
                    <FileText size={32} style={{ color: '#818cf8' }} />
                </div>
                <h1 style={{
                    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800,
                    fontSize: '2.2rem', margin: '0 0 14px',
                    background: 'linear-gradient(135deg,#818cf8,#a78bfa)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                    Passport & Visa Checker
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                    Upload your passport to check visa requirements and travel eligibility.
                </p>
            </div>

            <Card glow style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{
                    border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '16px',
                    padding: '48px 32px', marginBottom: '24px', cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'transparent'; }}
                >
                    <Upload size={32} style={{ color: '#6366f1', margin: '0 auto 14px', display: 'block' }} />
                    <p style={{ color: '#94a3b8', fontWeight: 600, margin: '0 0 6px' }}>Click or drag your passport image here</p>
                    <p style={{ color: '#475569', fontSize: '0.82rem', margin: 0 }}>JPG, PNG, or PDF · Max 10MB</p>
                </div>
                <p style={{ color: '#475569', fontSize: '0.85rem' }}>
                    🔒 Your document is processed locally and never stored on our servers.
                </p>
            </Card>
        </section>
    </PageWrapper>
);

export default Passport;
