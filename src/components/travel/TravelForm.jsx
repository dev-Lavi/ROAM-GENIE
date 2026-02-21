import React, { useState } from 'react';
import {
    PlaneTakeoff, PlaneLanding, Calendar, Wallet,
    Star, ChevronRight, Sparkles
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { FLIGHT_CLASSES, TRAVEL_PREFERENCES, BUDGET_RANGES } from '../../utils/constants';

const defaultForm = {
    source: '',
    destination: '',
    departDate: '',
    returnDate: '',
    budget: 'moderate',
    flightClass: 'economy',
    passengers: 1,
    preferences: [],
    tripType: 'roundtrip',
};

const TravelForm = ({ onSubmit, loading }) => {
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        setErrors(e => ({ ...e, [key]: undefined }));
    };

    const togglePref = (pref) =>
        set('preferences',
            form.preferences.includes(pref)
                ? form.preferences.filter(p => p !== pref)
                : [...form.preferences, pref]
        );

    const validate = () => {
        const e = {};
        if (!form.source.trim()) e.source = 'Enter origin IATA (e.g. DEL)';
        if (!form.destination.trim()) e.destination = 'Enter destination IATA (e.g. BOM)';
        if (!form.departDate) e.departDate = 'Select departure date';
        if (form.tripType === 'roundtrip' && !form.returnDate)
            e.returnDate = 'Select return date for round trip';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(form);
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div style={{
                display: 'grid', gap: '28px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}>
                {/* ── Trip Type ── */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                        Trip Type
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {[['roundtrip', 'Round Trip'], ['oneway', 'One Way']].map(([val, label]) => (
                            <button
                                key={val} type="button"
                                onClick={() => set('tripType', val)}
                                style={{
                                    padding: '8px 20px', borderRadius: '12px',
                                    fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                                    fontFamily: 'inherit', transition: 'all 0.2s',
                                    background: form.tripType === val ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.08)',
                                    color: form.tripType === val ? '#fff' : '#94a3b8',
                                    border: form.tripType === val ? 'none' : '1px solid rgba(99,102,241,0.2)',
                                    boxShadow: form.tripType === val ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Source / Destination ── */}
                <Input
                    id="source-iata"
                    label="From"
                    placeholder="DEL"
                    value={form.source}
                    onChange={e => set('source', e.target.value.toUpperCase())}
                    icon={<PlaneTakeoff size={16} />}
                    error={errors.source}
                    hint="IATA airport code"
                    required
                    maxLength={3}
                    inputStyle={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}
                />
                <Input
                    id="destination-iata"
                    label="To"
                    placeholder="BOM"
                    value={form.destination}
                    onChange={e => set('destination', e.target.value.toUpperCase())}
                    icon={<PlaneLanding size={16} />}
                    error={errors.destination}
                    hint="IATA airport code"
                    required
                    maxLength={3}
                    inputStyle={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}
                />

                {/* ── Dates ── */}
                <Input
                    id="depart-date"
                    label="Departure Date"
                    type="date"
                    value={form.departDate}
                    onChange={e => set('departDate', e.target.value)}
                    icon={<Calendar size={16} />}
                    error={errors.departDate}
                    required
                    inputStyle={{ colorScheme: 'dark' }}
                    inputProps={{ min: today }}
                />
                {form.tripType === 'roundtrip' && (
                    <Input
                        id="return-date"
                        label="Return Date"
                        type="date"
                        value={form.returnDate}
                        onChange={e => set('returnDate', e.target.value)}
                        icon={<Calendar size={16} />}
                        error={errors.returnDate}
                        inputStyle={{ colorScheme: 'dark' }}
                        inputProps={{ min: form.departDate || today }}
                    />
                )}

                {/* ── Passengers ── */}
                <div>
                    <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Passengers
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <button key={n} type="button"
                                onClick={() => set('passengers', n)}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                                    fontFamily: 'inherit', transition: 'all 0.2s',
                                    background: form.passengers === n ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.08)',
                                    color: form.passengers === n ? '#fff' : '#94a3b8',
                                    border: form.passengers === n ? 'none' : '1px solid rgba(99,102,241,0.2)',
                                    boxShadow: form.passengers === n ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
                                }}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Flight Class ── */}
                <div>
                    <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Class
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {FLIGHT_CLASSES.map(({ value, label }) => (
                            <button key={value} type="button"
                                onClick={() => set('flightClass', value)}
                                style={{
                                    padding: '7px 14px', borderRadius: '10px', cursor: 'pointer',
                                    fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem',
                                    transition: 'all 0.2s',
                                    background: form.flightClass === value ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.05)',
                                    color: form.flightClass === value ? '#818cf8' : '#64748b',
                                    border: form.flightClass === value ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(99,102,241,0.15)',
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Budget ── */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                        <Wallet size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Budget Range
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' }}>
                        {BUDGET_RANGES.map(({ value, label, icon }) => (
                            <button key={value} type="button"
                                onClick={() => set('budget', value)}
                                style={{
                                    padding: '16px', borderRadius: '14px', cursor: 'pointer',
                                    fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem',
                                    transition: 'all 0.2s', textAlign: 'center',
                                    background: form.budget === value
                                        ? 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.2))'
                                        : 'rgba(99,102,241,0.05)',
                                    color: form.budget === value ? '#a5b4fc' : '#64748b',
                                    border: form.budget === value ? '1.5px solid rgba(99,102,241,0.5)' : '1px solid rgba(99,102,241,0.15)',
                                    boxShadow: form.budget === value ? '0 0 20px rgba(99,102,241,0.2)' : 'none',
                                }}
                            >
                                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{icon}</div>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Preferences ── */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                        <Star size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Travel Preferences <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {TRAVEL_PREFERENCES.map(pref => {
                            const active = form.preferences.includes(pref);
                            return (
                                <button key={pref} type="button"
                                    onClick={() => togglePref(pref)}
                                    style={{
                                        padding: '7px 14px', borderRadius: '99px', cursor: 'pointer',
                                        fontFamily: 'inherit', fontWeight: 500, fontSize: '0.82rem',
                                        transition: 'all 0.2s',
                                        background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.06)',
                                        color: active ? '#fff' : '#64748b',
                                        border: active ? 'none' : '1px solid rgba(99,102,241,0.15)',
                                        boxShadow: active ? '0 2px 10px rgba(99,102,241,0.3)' : 'none',
                                        transform: active ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                >
                                    {pref}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Submit ── */}
                <div style={{ gridColumn: '1 / -1', paddingTop: '8px' }}>
                    <Button
                        type="submit"
                        size="xl"
                        fullWidth
                        loading={loading}
                        icon={<Sparkles size={18} />}
                    >
                        {loading ? 'Generating your plan…' : 'Generate My Travel Plan'}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default TravelForm;
