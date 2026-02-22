import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import TravelForm from '../components/travel/TravelForm';
import FlightCard from '../components/travel/FlightCard';
import HotelView from '../components/travel/HotelView';
import ItineraryView from '../components/travel/ItineraryView';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { generateTravelPlan } from '../api/itineraryApi';
import { getCity } from '../utils/iataMap';
import { Plane, Hotel, Map, AlertCircle, ChevronRight, Sparkles, Globe, ShieldCheck, ShieldX, ShieldQuestion } from 'lucide-react';

/* ─── Section Header ─────────────────────── */
const SectionHeader = ({ icon, title, subtitle, color = '#6366f1', count }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: `${color}18`, border: `1.5px solid ${color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {icon}
            </div>
            <div>
                <h2 style={{
                    color: '#e2e8f0', fontWeight: 700, fontSize: '1.3rem', margin: 0,
                    fontFamily: "'Space Grotesk',sans-serif",
                }}>
                    {title}
                </h2>
                {subtitle && <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '2px 0 0' }}>{subtitle}</p>}
            </div>
        </div>
        {count !== undefined && (
            <span style={{
                padding: '4px 14px', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 700,
                background: `${color}15`, color, border: `1px solid ${color}30`,
            }}>
                {count} found
            </span>
        )}
    </div>
);

/* ─── Hero ───────────────────────────────── */
const Hero = () => (
    <section style={{
        padding: '80px 24px 60px',
        textAlign: 'center',
        position: 'relative',
    }}>
        {/* Floating orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '8%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 18px', borderRadius: '99px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            color: '#818cf8', fontSize: '0.82rem', fontWeight: 700,
            letterSpacing: '0.05em', marginBottom: '28px',
            animation: 'fadeInUp 0.5s ease',
        }}>
            <Sparkles size={13} /> AI-POWERED TRAVEL PLANNING
        </div>

        <h1 style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 'clamp(2.2rem,6vw,4rem)', fontWeight: 800,
            lineHeight: 1.1, margin: '0 auto 20px', maxWidth: '700px',
            animation: 'fadeInUp 0.5s ease 0.1s both',
        }}>
            Plan Your Dream Trip
            <span style={{
                display: 'block', marginTop: '4px',
                background: 'linear-gradient(135deg,#818cf8,#a78bfa,#2dd4bf)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}>
                with RoamGenie
            </span>
        </h1>

        <p style={{
            color: '#64748b', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 0',
            lineHeight: 1.7, animation: 'fadeInUp 0.5s ease 0.2s both',
        }}>
            Discover flights, hotels & AI-crafted itineraries tailored to your preferences — all in seconds.
        </p>
    </section>
);

/* ─── Stats strip ────────────────────────── */
const Stats = () => (
    <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '1px',
        background: 'rgba(99,102,241,0.1)',
        borderRadius: '16px', overflow: 'hidden',
        margin: '0 24px 0', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto',
        border: '1px solid rgba(99,102,241,0.15)',
    }}>
        {[
            ['500+', 'Destinations'],
            ['2M+', 'Trips Planned'],
            ['4.9★', 'User Rating'],
            ['< 10s', 'Avg. Plan Time'],
        ].map(([val, label]) => (
            <div key={label} style={{
                flex: 1, minWidth: '120px', textAlign: 'center', padding: '20px 16px',
                background: 'rgba(10,10,20,0.8)',
            }}>
                <p style={{ color: '#818cf8', fontWeight: 800, fontSize: '1.4rem', margin: 0, fontFamily: "'Space Grotesk',sans-serif" }}>{val}</p>
                <p style={{ color: '#475569', fontSize: '0.78rem', margin: '4px 0 0', fontWeight: 500 }}>{label}</p>
            </div>
        ))}
    </div>
);

/* ─── Main Page ──────────────────────────── */
const TravelPlan = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(null);

    const handleSubmit = async (data) => {
        setLoading(true);
        setError(null);
        setPlan(null);
        setFormData(data);
        try {
            const result = await generateTravelPlan(data);
            setPlan(result);
            // Scroll to results
            setTimeout(() => {
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        } catch (err) {
            setError(err.message || 'Failed to generate travel plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const flights = plan?.flights || [];
    const hotels = plan?.hotels || [];
    const restaurants = plan?.restaurants || [];
    const itinerary = plan?.itinerary || plan?.itinerary_text || null;
    const hotelAIText = plan?.hotelRestaurantResults || '';
    const visaStatus = plan?.visaStatus || null;
    const destCountry = plan?.destinationCountry || '';

    const srcCity = formData ? getCity(formData.source) : '';
    const dstCity = formData ? getCity(formData.destination) : '';
    const sourceCode = formData?.source || '';
    const destinationCode = formData?.destination || '';


    return (
        <PageWrapper title="Plan Trip">
            {/* Hero */}
            <div style={{ paddingBottom: '0' }}>
                <Hero />
                <div style={{ padding: '0 0 40px' }}>
                    <Stats />
                </div>
            </div>

            {/* Form Section */}
            <section style={{ padding: '0 24px 64px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Card glow style={{ padding: '36px' }}>
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <Globe size={20} style={{ color: '#6366f1' }} />
                                <h2 style={{
                                    color: '#e2e8f0', fontWeight: 700, fontSize: '1.25rem', margin: 0,
                                    fontFamily: "'Space Grotesk',sans-serif",
                                }}>
                                    Where are you headed?
                                </h2>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                                Fill in your travel details and let AI build the perfect plan.
                            </p>
                        </div>
                        <TravelForm onSubmit={handleSubmit} loading={loading} />
                    </Card>
                </div>
            </section>

            {/* Loading */}
            {loading && (
                <section style={{ padding: '0 24px 80px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                        <Loader size="lg" text="Our AI is crafting your perfect trip… ✈️" />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                            {['Searching flights', 'Finding hotels', 'Crafting itinerary'].map((step, i) => (
                                <div key={step} style={{
                                    padding: '8px 18px', borderRadius: '10px',
                                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                    color: '#6366f1', fontSize: '0.82rem', fontWeight: 600,
                                    animation: `fadeIn 0.4s ease ${i * 0.3}s both`,
                                }}>
                                    ✦ {step}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Error */}
            {error && !loading && (
                <section style={{ padding: '0 24px 64px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{
                            padding: '24px', borderRadius: '16px',
                            background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)',
                            display: 'flex', alignItems: 'flex-start', gap: '14px',
                        }}>
                            <AlertCircle size={22} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
                            <div>
                                <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 4px' }}>Failed to generate plan</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>{error}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Results */}
            {plan && !loading && (
                <section id="results" style={{ padding: '0 24px 80px' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                        {/* Trip Summary Banner */}
                        <div style={{
                            padding: '20px 28px', borderRadius: '18px',
                            background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12))',
                            border: '1.5px solid rgba(99,102,241,0.3)',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            flexWrap: 'wrap', marginBottom: '24px',
                            animation: 'fadeInUp 0.4s ease',
                        }}>
                            <Plane size={20} style={{ color: '#818cf8', flexShrink: 0 }} />
                            <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '1rem', margin: 0 }}>
                                {srcCity} <ChevronRight size={16} style={{ verticalAlign: 'middle', color: '#6366f1' }} /> {dstCity}
                            </p>
                            {formData?.departDate && (
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>• {formData.departDate}{formData.returnDate ? ` → ${formData.returnDate}` : ''}</span>
                            )}
                            <span style={{
                                marginLeft: 'auto', padding: '4px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700,
                                background: 'rgba(20,184,166,0.15)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.3)',
                            }}>
                                ✓ Plan Ready
                            </span>
                        </div>

                        {/* Visa Status Banner */}
                        {visaStatus && (
                            <div style={{
                                padding: '14px 22px', borderRadius: '14px', marginBottom: '40px',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                animation: 'fadeInUp 0.4s ease 0.1s both',
                                ...(visaStatus === 'Visa-Free'
                                    ? { background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.3)' }
                                    : visaStatus === 'Visa Required'
                                        ? { background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.3)' }
                                        : { background: 'rgba(99,102,241,0.08)', border: '1.5px solid rgba(99,102,241,0.3)' }
                                ),
                            }}>
                                {visaStatus === 'Visa-Free'
                                    ? <ShieldCheck size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
                                    : visaStatus === 'Visa Required'
                                        ? <ShieldX size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                        : <ShieldQuestion size={20} style={{ color: '#818cf8', flexShrink: 0 }} />
                                }
                                <p style={{
                                    margin: 0, fontSize: '0.9rem', fontWeight: 600,
                                    color: visaStatus === 'Visa-Free' ? '#86efac' : visaStatus === 'Visa Required' ? '#fcd34d' : '#a5b4fc'
                                }}>
                                    {visaStatus === 'Visa-Free'
                                        ? `Great news! Visa-free travel to ${destCountry} ✈️`
                                        : visaStatus === 'Visa Required'
                                            ? `Visa required for ${destCountry} — please check requirements before travel.`
                                            : `Visa status for ${destCountry}: ${visaStatus}`
                                    }
                                </p>
                            </div>
                        )}

                        {/* Flights */}
                        {flights.length > 0 && (
                            <div style={{ marginBottom: '56px' }}>
                                <SectionHeader
                                    icon={<Plane size={20} style={{ color: '#6366f1' }} />}
                                    title="Available Flights"
                                    subtitle="Best options for your route"
                                    color="#6366f1"
                                    count={flights.length}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {flights.map((flight, i) => (
                                        <FlightCard
                                            key={i}
                                            index={i}
                                            {...flight}
                                            sourceCode={sourceCode}
                                            destinationCode={destinationCode}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hotels & Restaurants — renders structured cards OR parses AI text into cards */}
                        {(hotels.length > 0 || restaurants.length > 0 || hotelAIText) && (
                            <div style={{ marginBottom: '56px' }}>
                                <SectionHeader
                                    icon={<Hotel size={20} style={{ color: '#14b8a6' }} />}
                                    title="Stays & Dining"
                                    subtitle="Curated hotels & restaurants for your trip"
                                    color="#14b8a6"
                                    count={hotels.length || undefined}
                                />
                                <HotelView
                                    hotels={hotels}
                                    restaurants={restaurants}
                                    aiText={hotelAIText}
                                    city={dstCity}
                                />
                            </div>
                        )}

                        {/* Itinerary */}
                        {itinerary && (
                            <div>
                                <SectionHeader
                                    icon={<Map size={20} style={{ color: '#8b5cf6' }} />}
                                    title="Your Itinerary"
                                    subtitle="Day-by-day travel plan"
                                    color="#8b5cf6"
                                />
                                <ItineraryView itinerary={itinerary} destination={dstCity} />
                            </div>
                        )}

                        {/* No results */}
                        {!flights.length && !hotels.length && !itinerary && (
                            <Card style={{ textAlign: 'center', padding: '48px' }}>
                                <p style={{ fontSize: '2.5rem', margin: '0 0 12px' }}>🔍</p>
                                <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 8px' }}>No results returned</p>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>The server returned an empty plan. Check your inputs or try again.</p>
                            </Card>
                        )}
                    </div>
                </section>
            )}
        </PageWrapper>
    );
};

export default TravelPlan;
