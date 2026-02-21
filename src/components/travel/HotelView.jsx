import React from 'react';
import { Star, MapPin, Utensils, ExternalLink, Wifi, Coffee, Dumbbell } from 'lucide-react';
import Card from '../common/Card';

const AMENITY_ICONS = {
    wifi: <Wifi size={13} />,
    breakfast: <Coffee size={13} />,
    gym: <Dumbbell size={13} />,
    pool: '🏊',
    spa: '💆',
    parking: '🅿️',
    restaurant: <Utensils size={13} />,
};

const StarRating = ({ rating = 0 }) => (
    <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
            <Star
                key={i}
                size={13}
                style={{
                    color: i <= Math.round(rating) ? '#fbbf24' : '#334155',
                    fill: i <= Math.round(rating) ? '#fbbf24' : 'transparent',
                }}
            />
        ))}
        <span style={{ color: '#94a3b8', fontSize: '0.78rem', marginLeft: '4px' }}>{rating?.toFixed(1)}</span>
    </div>
);

const HotelCard = ({ hotel, index = 0 }) => {
    const {
        name = 'Hotel Name',
        location = '',
        price = 0,
        rating = 0,
        amenities = [],
        imageUrl,
        bookingUrl = '#',
        description = '',
        priceUnit = 'per night',
    } = hotel;

    const fmtPx = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

    return (
        <Card style={{ padding: 0, overflow: 'hidden', animation: `fadeInUp 0.4s ease ${index * 0.09}s both` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {/* Image */}
                <div style={{
                    width: '200px', minHeight: '160px', flexShrink: 0,
                    background: imageUrl ? `url(${imageUrl}) center/cover no-repeat` : 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                }}>
                    {!imageUrl && (
                        <span style={{ fontSize: '3rem', opacity: 0.4 }}>🏨</span>
                    )}
                    {rating >= 4.5 && (
                        <div style={{
                            position: 'absolute', top: '10px', left: '10px',
                            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                            color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                            padding: '3px 8px', borderRadius: '99px',
                            boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
                        }}>
                            ⭐ Top Rated
                        </div>
                    )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '20px 24px', minWidth: '240px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                            <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 6px' }}>{name}</h3>
                            {location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.82rem', marginBottom: '8px' }}>
                                    <MapPin size={13} style={{ color: '#6366f1' }} />{location}
                                </div>
                            )}
                            <StarRating rating={rating} />
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <p style={{ color: '#64748b', fontSize: '0.72rem', margin: '0 0 2px' }}>{priceUnit}</p>
                            <p style={{
                                color: '#a5b4fc', fontWeight: 800, fontSize: '1.4rem', margin: 0,
                                fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.02em',
                            }}>
                                {fmtPx}
                            </p>
                        </div>
                    </div>

                    {description && (
                        <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, margin: '12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {description}
                        </p>
                    )}

                    {/* Amenities */}
                    {amenities.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '12px 0' }}>
                            {amenities.map((a, i) => (
                                <span key={i} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 500,
                                    background: 'rgba(99,102,241,0.08)', color: '#818cf8',
                                    border: '1px solid rgba(99,102,241,0.2)',
                                }}>
                                    {AMENITY_ICONS[a.toLowerCase()] || '✦'} {a}
                                </span>
                            ))}
                        </div>
                    )}

                    <a
                        href={bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '8px 18px', borderRadius: '11px',
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            color: '#fff', fontWeight: 700, fontSize: '0.84rem',
                            textDecoration: 'none', transition: 'all 0.2s',
                            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                            marginTop: '8px',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.55)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.4)'; }}
                    >
                        Book Now <ExternalLink size={13} />
                    </a>
                </div>
            </div>
        </Card>
    );
};

/* ─────────────────────────────── RestaurantCard ── */
const RestaurantCard = ({ restaurant, index = 0 }) => {
    const { name = '', location = '', cuisine = '', price_range = '', rating = 0 } = restaurant;
    return (
        <Card style={{ animation: `fadeInUp 0.4s ease ${index * 0.07}s both` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', flexShrink: 0,
                }}>
                    🍽️
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div>
                            <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{name}</p>
                            {cuisine && <span style={{ color: '#2dd4bf', fontSize: '0.75rem', fontWeight: 600 }}>{cuisine}</span>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <StarRating rating={rating} />
                            {price_range && <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '4px 0 0' }}>{price_range}</p>}
                        </div>
                    </div>
                    {location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
                            <MapPin size={11} style={{ color: '#14b8a6' }} />{location}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

/* ─────────────────────────────── HotelView (main) ── */
const HotelView = ({ hotels = [], restaurants = [] }) => {
    if (!hotels.length && !restaurants.length) return null;

    return (
        <div>
            {/* Hotels */}
            {hotels.length > 0 && (
                <section style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {hotels.map((hotel, i) => (
                            <HotelCard key={i} hotel={hotel} index={i} />
                        ))}
                    </div>
                </section>
            )}

            {/* Restaurants */}
            {restaurants.length > 0 && (
                <section>
                    <h3 style={{
                        color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <Utensils size={14} style={{ color: '#14b8a6' }} /> Recommended Restaurants
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '14px' }}>
                        {restaurants.map((r, i) => (
                            <RestaurantCard key={i} restaurant={r} index={i} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default HotelView;
