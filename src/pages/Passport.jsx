import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { analyzePassport, getVisaFreeCountries } from '../api/passportApi';
import { FileText, Upload, Globe, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

/* ── Available passport countries (mirrors backend fallback list) ── */
const COUNTRIES = [
    'India', 'United States', 'United Kingdom', 'Germany', 'France',
    'Singapore', 'Japan', 'Australia', 'Canada', 'Netherlands',
    'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland',
    'South Korea', 'New Zealand', 'Austria', 'Portugal', 'Greece',
    'Spain', 'Italy', 'Belgium', 'Luxembourg', 'Ireland',
];

const REGIONS = {
    Asia: ['Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Cambodia', 'Laos', 'Myanmar', 'Vietnam', 'Brunei', 'Nepal', 'Bhutan', 'South Korea', 'Japan', 'Mongolia', 'Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Uzbekistan'],
    Europe: ['Germany', 'France', 'Italy', 'Spain', 'United Kingdom', 'Ireland', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Portugal', 'Greece', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Iceland', 'Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Slovenia', 'Croatia', 'Serbia', 'Montenegro', 'Albania', 'North Macedonia', 'Bosnia and Herzegovina', 'Bulgaria', 'Romania', 'Moldova', 'Belarus'],
    'Middle East': ['UAE', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'Saudi Arabia', 'Jordan', 'Turkey', 'Armenia', 'Georgia', 'Iran', 'Israel'],
    Africa: ['Mauritius', 'Seychelles', 'Madagascar', 'Comoros', 'Cape Verde', 'Guinea-Bissau', 'Mozambique', 'Zimbabwe', 'Zambia', 'Uganda', 'Rwanda', 'Burundi', 'Tanzania', 'Kenya', 'Ethiopia', 'Djibouti', 'Somalia', 'Sudan', 'Egypt', 'Morocco', 'Tunisia', 'South Africa', 'Namibia', 'Botswana'],
    Americas: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Uruguay', 'Paraguay', 'Colombia', 'Ecuador', 'Peru', 'Bolivia', 'Venezuela', 'Guyana', 'Suriname', 'Jamaica', 'Haiti', 'Barbados', 'Trinidad and Tobago', 'Dominica', 'Grenada', 'Saint Lucia', 'El Salvador', 'Honduras', 'Nicaragua'],
    Oceania: ['Australia', 'New Zealand', 'Fiji', 'Vanuatu', 'Samoa', 'Tonga', 'Cook Islands', 'Niue', 'Tuvalu', 'Micronesia', 'Papua New Guinea'],
};

const RegionStat = ({ label, count, color }) => (
    <div style={{
        padding: '16px', borderRadius: '14px', textAlign: 'center',
        background: `rgba(${color},0.1)`, border: `1px solid rgba(${color},0.25)`,
    }}>
        <p style={{ color: `rgb(${color})`, fontWeight: 800, fontSize: '1.6rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>{count}</p>
        <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '4px 0 0', fontWeight: 500 }}>{label}</p>
    </div>
);

const Passport = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [selected, setSelected] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [passportCountry, setPassportCountry] = useState(null);
    const [visaFree, setVisaFree] = useState([]);
    const [confidence, setConfidence] = useState(null);

    /* ── File pick ── */
    const onFilePick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setError(null);
    };

    /* ── Drag-and-drop ── */
    const onDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setError(null); }
    };

    /* ── OCR scan ── */
    const handleScan = async () => {
        if (!file) return;
        setLoading(true); setError(null);
        try {
            const res = await analyzePassport(file);
            setPassportCountry(res.country);
            setConfidence(res.confidence);
            setVisaFree(res.visa_free_countries || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ── Manual lookup ── */
    const handleManualLookup = async () => {
        if (!selected) return;
        setLoading(true); setError(null);
        try {
            const res = await getVisaFreeCountries(selected);
            setPassportCountry(selected);
            setConfidence(null);
            setVisaFree(res.countries || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ── Filtered countries ── */
    const filtered = visaFree.filter(c => c.toLowerCase().includes(search.toLowerCase()));

    /* ── Regional stats ── */
    const regionCount = (countries) =>
        Object.fromEntries(Object.entries(REGIONS).map(([r, list]) => [r, list.filter(c => countries.includes(c)).length]));
    const stats = regionCount(visaFree);
    const regionColors = { Asia: '99,102,241', Europe: '34,197,94', 'Middle East': '245,158,11', Africa: '239,68,68', Americas: '20,184,166', Oceania: '168,85,247' };

    return (
        <PageWrapper title="Passport Lookup">
            <section style={{ padding: '60px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>

                {/* ── Page Header ── */}
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
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '2.2rem', margin: '0 0 12px',
                        background: 'linear-gradient(135deg,#818cf8,#a78bfa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        Passport &amp; Visa Checker
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                        Scan your passport or select your country to see where you can travel visa-free.
                    </p>
                </div>

                {/* ── Two-column input area ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px', marginBottom: '40px' }}>

                    {/* Upload */}
                    <Card glow style={{ padding: '28px' }}>
                        <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Upload size={16} style={{ color: '#6366f1' }} /> Upload Passport Photo
                        </h3>

                        <label
                            htmlFor="passport-file"
                            onDragOver={e => e.preventDefault()}
                            onDrop={onDrop}
                            style={{
                                display: 'block', border: '2px dashed rgba(99,102,241,0.3)',
                                borderRadius: '14px', padding: '32px 16px', textAlign: 'center',
                                cursor: 'pointer', transition: 'all 0.2s', marginBottom: '16px',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            {preview ? (
                                <img src={preview} alt="Passport preview" style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                            ) : (
                                <>
                                    <Upload size={28} style={{ color: '#6366f1', margin: '0 auto 10px', display: 'block' }} />
                                    <p style={{ color: '#94a3b8', fontWeight: 600, margin: '0 0 4px', fontSize: '0.9rem' }}>Click or drag passport image</p>
                                    <p style={{ color: '#475569', fontSize: '0.78rem', margin: 0 }}>JPG · PNG · PDF — max 10MB</p>
                                </>
                            )}
                            <input id="passport-file" type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={onFilePick} />
                        </label>

                        <Button size="md" fullWidth icon={<FileText size={16} />} onClick={handleScan} loading={loading} disabled={!file}>
                            Scan Passport
                        </Button>
                        <p style={{ color: '#475569', fontSize: '0.75rem', textAlign: 'center', marginTop: '10px' }}>
                            🔒 Processed server-side — never stored permanently.
                        </p>
                    </Card>

                    {/* Manual */}
                    <Card glow style={{ padding: '28px' }}>
                        <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Globe size={16} style={{ color: '#8b5cf6' }} /> Manual Country Selection
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>Or select your passport country from the list:</p>
                        <select
                            value={selected}
                            onChange={e => setSelected(e.target.value)}
                            style={{
                                width: '100%', padding: '11px 14px', marginBottom: '16px',
                                background: 'rgba(17,17,34,0.85)',
                                border: '1.5px solid rgba(99,102,241,0.25)',
                                borderRadius: '12px', color: selected ? '#e2e8f0' : '#64748b',
                                fontSize: '0.94rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                            }}
                        >
                            <option value="">Select passport country…</option>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Button size="md" fullWidth icon={<Search size={16} />} onClick={handleManualLookup} loading={loading} disabled={!selected}>
                            Find Visa-Free Destinations
                        </Button>
                    </Card>
                </div>

                {/* ── Loading ── */}
                {loading && <Loader size="md" text="Looking up visa-free destinations…" />}

                {/* ── Error ── */}
                {error && !loading && (
                    <div style={{
                        padding: '18px 24px', borderRadius: '14px', marginBottom: '32px',
                        background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)',
                        display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                        <AlertCircle size={20} style={{ color: '#f87171', flexShrink: 0 }} />
                        <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.9rem' }}>{error}</p>
                    </div>
                )}

                {/* ── Results ── */}
                {passportCountry && visaFree.length > 0 && !loading && (
                    <div style={{ animation: 'fadeInUp 0.4s ease' }}>

                        {/* Country banner */}
                        <div style={{
                            padding: '18px 24px', borderRadius: '16px', marginBottom: '32px',
                            background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12))',
                            border: '1.5px solid rgba(99,102,241,0.3)',
                            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                        }}>
                            <CheckCircle2 size={22} style={{ color: '#818cf8', flexShrink: 0 }} />
                            <div>
                                <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                                    {passportCountry} Passport
                                    {confidence && <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.85rem', marginLeft: '8px' }}>(Confidence: {(confidence * 100).toFixed(0)}%)</span>}
                                </p>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '2px 0 0' }}>
                                    You can travel visa-free to <strong style={{ color: '#a5b4fc' }}>{visaFree.length}</strong> countries!
                                </p>
                            </div>
                        </div>

                        {/* Regional Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '12px', marginBottom: '32px' }}>
                            {Object.entries(stats).map(([region, count]) => (
                                <RegionStat key={region} label={region} count={count} color={regionColors[region]} />
                            ))}
                        </div>

                        {/* Search + Grid */}
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                placeholder="Filter countries…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    width: '100%', padding: '11px 14px 11px 40px', boxSizing: 'border-box',
                                    background: 'rgba(17,17,34,0.8)', border: '1.5px solid rgba(99,102,241,0.25)',
                                    borderRadius: '12px', color: '#e2e8f0', fontSize: '0.94rem',
                                    fontFamily: 'inherit', outline: 'none',
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '10px' }}>
                            {filtered.map((country, i) => (
                                <div
                                    key={country}
                                    style={{
                                        padding: '12px 16px', borderRadius: '12px',
                                        background: 'rgba(17,17,34,0.7)',
                                        border: '1px solid rgba(34,197,94,0.2)',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        animation: `fadeInUp 0.3s ease ${Math.min(i * 0.02, 0.4)}s both`,
                                    }}
                                >
                                    <span style={{
                                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                                        background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.5)',
                                    }} />
                                    <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>{country}</span>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <p style={{ color: '#475569', gridColumn: '1/-1', textAlign: 'center', padding: '24px' }}>No countries match your filter.</p>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </PageWrapper>
    );
};

export default Passport;
