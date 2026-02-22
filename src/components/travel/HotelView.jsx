import React, { useState, useMemo } from 'react';
import { Star, MapPin, Utensils, ExternalLink, Wifi, Coffee, Dumbbell, ParkingCircle } from 'lucide-react';

/* ────────────────────────────────────────────────────────── */
/*  Unsplash image pool for hotels                           */
/* ────────────────────────────────────────────────────────── */
const HOTEL_IMAGES = [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe2fa?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=220&fit=crop',
];
const RESTAURANT_IMAGES = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=220&fit=crop',
];

const getHotelImg = (idx) => HOTEL_IMAGES[idx % HOTEL_IMAGES.length];
const getRestImg = (idx) => RESTAURANT_IMAGES[idx % RESTAURANT_IMAGES.length];

/* ────────────────────────────────────────────────────────── */
/*  Booking URL generators                                   */
/* ────────────────────────────────────────────────────────── */
const buildHotelBookingUrl = (name, city) => {
    const q = encodeURIComponent(`${name} ${city || ''}`);
    return `https://www.booking.com/search.html?ss=${q}`;
};
const buildRestaurantUrl = (name, city) => {
    const q = encodeURIComponent(`${name} ${city || ''} restaurant`);
    return `https://www.google.com/maps/search/${q}`;
};

/* ────────────────────────────────────────────────────────── */
/*  ── AI Text → Structured Places Parser ──                 */
/*                                                           */
/*  Strategy:                                                */
/*  1. Split on blank lines to get paragraphs/blocks         */
/*  2. Detect section headers (Hotels, Restaurants, etc.)    */
/*  3. Within each section, look for numbered/bulleted       */
/*     entries → those are individual places                 */
/*  4. Skip generic intro/tip paragraphs (long, no name)     */
/* ────────────────────────────────────────────────────────── */
const parseAIText = (text, city = '') => {
    if (!text?.trim()) return { hotels: [], restaurants: [] };

    const hotels = [];
    const restaurants = [];
    let section = 'hotels';

    // ── helpers ──
    const cleanMd = (s) =>
        s.replace(/\*+([^*]+)\*+/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/^#{1,6}\s*/, '')
            .replace(/^[-•●▸►✦→]\s*/, '')
            .replace(/^\d+[.)]\s*/, '')
            .trim();

    const stripParens = (s) => s.replace(/\s*[\(\[][^\)\]]{0,80}[\)\]]/g, '').trim();

    // A "name" line: short, often bold, may start with number/bullet
    const isNameLine = (line) => {
        const c = cleanMd(line);
        return (
            c.length > 2 && c.length < 120 &&
            !/^(welcome|given|based on|here are|below are|consider|note:|tip:|general|please|you can|we have)/i.test(c) &&
            !/^\s*#{1,4}\s+(hotel|restaurant|stay|dining|food|tips|budget|luxury|moderate|summary|overview)/i.test(line)
        );
    };

    // A "section header" (tells us Hotels vs Restaurants)
    const isSectionHeader = (line) => {
        const l = line.toLowerCase();
        return (
            line.trim().length < 80 &&
            (
                (/hotel|accommodation|stay|lodging|resort|hostel/i.test(l) && !/\d/.test(l)) ||
                (/restaurant|dining|eat|food|cafe|cuisine|eatery|bistro|diner/i.test(l) && !/\d/.test(l))
            )
        );
    };

    // A numbered / bulleted list entry
    const isListEntry = (line) => /^(\d+[.):]|\s*[-•●▸►✦→*])\s+\S/.test(line.trim());

    // Bold-is-name pattern: **Name** - description
    const boldNameRe = /^\*{1,2}([^*\n]{3,80})\*{1,2}[\s:,\-–—]*(.*)/;

    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const trimmed = raw.trim();
        if (!trimmed) continue;

        // ── Detect section type ──
        const lc = trimmed.toLowerCase();
        if (isSectionHeader(trimmed)) {
            if (/hotel|accommodation|stay|lodging|resort|hostel/i.test(lc)) { section = 'hotels'; continue; }
            if (/restaurant|dining|eat|food|cafe|cuisine|eatery|bistro|diner/i.test(lc)) { section = 'restaurants'; continue; }
        }
        // Also detect "## Hotels" style headings
        if (/^#{1,3}\s*(hotel|accommodation|stay)/i.test(trimmed)) { section = 'hotels'; continue; }
        if (/^#{1,3}\s*(restaurant|dining|food|eat)/i.test(trimmed)) { section = 'restaurants'; continue; }

        // ── Skip markdown sub-headings that describe categories (not places) ──
        if (/^#{1,6}\s*(luxury|budget|moderate|economy|premium|affordable|mid[-\s]?range|backpacker)/i.test(trimmed)) continue;

        // ── Parse a named place entry ──
        let name = null;
        let description = '';

        // Pattern 1: **Hotel Name** - description OR **Hotel Name** (bold first)
        const boldMatch = trimmed.match(boldNameRe);
        if (boldMatch) {
            name = boldMatch[1].trim();
            description = boldMatch[2]?.replace(/\*+/g, '').trim() || '';
        }

        // Pattern 2: numbered/bulleted list entry
        if (!name && isListEntry(trimmed)) {
            const withoutBullet = trimmed.replace(/^(\d+[.):]|\s*[-•●▸►✦→*])\s+/, '');
            // Check if bold inside
            const innerBold = withoutBullet.match(boldNameRe);
            if (innerBold) {
                name = innerBold[1].trim();
                description = innerBold[2]?.replace(/\*+/g, '').trim() || '';
            } else {
                // First part before ':' or '-' or '–' might be the name
                const sepMatch = withoutBullet.match(/^([^:–—\-\(]{4,80?})\s*[:–—\-]\s*(.*)/);
                if (sepMatch) {
                    name = cleanMd(sepMatch[1]);
                    description = cleanMd(sepMatch[2]);
                } else if (isNameLine(withoutBullet) && withoutBullet.length < 80) {
                    name = cleanMd(withoutBullet);
                }
            }
        }

        // Pattern 3: Short standalone line that looks like a name (under a section header)
        if (!name && isNameLine(trimmed) && trimmed.length < 80 && !trimmed.includes(':')) {
            name = cleanMd(trimmed);
        }

        if (!name || name.length < 3) continue;

        // Clean up name further
        name = stripParens(name).replace(/[,.:;]+$/, '').trim();
        if (name.length < 3) continue;

        // Collect additional description from next non-bulleted lines
        let j = i + 1;
        while (j < lines.length && lines[j].trim() && !isListEntry(lines[j]) && !isNameLine(lines[j]) && !isSectionHeader(lines[j])) {
            description += ' ' + cleanMd(lines[j]);
            j++;
        }
        description = description.trim().slice(0, 250);

        // Extract star rating
        const starMatch = (description + name).match(/(\d+(?:\.\d)?)\s*(?:star|★|⭐|\/5|out of 5)/i);
        const rating = starMatch ? Math.min(5, parseFloat(starMatch[1])) : 0;

        // Extract price
        const priceMatch = description.match(/₹\s*([\d,]+)\s*(?:per\s+night|\/night|\/night)?/i) ||
            description.match(/([\d,]+)\s*per\s+night/i);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;

        // Extract location
        const locMatch = description.match(/(?:located?|situated?|near|in|at)\s+([A-Z][^,\.]{3,40}(?:,\s*[A-Z][^,\.]{2,30})?)/);
        const location = locMatch ? locMatch[1].trim() : city;

        // Cuisine (restaurants)
        const cuisineMatch = description.match(/(?:serves?|cuisine[:s]?|speciali[sz]es?\s+in|known for)\s+([^,\.]{3,40})/i);
        const cuisine = cuisineMatch ? cuisineMatch[1].trim() : '';

        const entry = { name, description, rating, price, location };

        if (section === 'restaurants') {
            restaurants.push({ ...entry, cuisine });
        } else {
            hotels.push({ ...entry, amenities: [], priceUnit: 'per night' });
        }
    }

    return { hotels, restaurants };
};

/* ────────────────────────────────────────────────────────── */
/*  Star Rating Component                                     */
/* ────────────────────────────────────────────────────────── */
const StarRating = ({ rating = 0 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={13} style={{
                color: i <= Math.round(rating) ? '#fbbf24' : '#2d3748',
                fill: i <= Math.round(rating) ? '#fbbf24' : 'transparent',
            }} />
        ))}
        {rating > 0 && <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '4px', fontWeight: 600 }}>{rating.toFixed(1)}</span>}
    </div>
);

/* ────────────────────────────────────────────────────────── */
/*  Hotel Card                                               */
/* ────────────────────────────────────────────────────────── */
const HotelCard = ({ hotel, index = 0, city = '' }) => {
    const { name, location, price, rating, amenities = [], description, priceUnit = 'per night' } = hotel;
    const imgUrl = getHotelImg(index);
    const bookingUrl = buildHotelBookingUrl(name, city || location);
    const fmtPx = price > 0 ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price) : null;

    return (
        <div style={{
            borderRadius: '20px', overflow: 'hidden',
            background: 'rgba(10,10,25,0.9)',
            border: '1.5px solid rgba(99,102,241,0.15)',
            display: 'flex', flexWrap: 'wrap',
            boxShadow: '0 6px 32px rgba(0,0,0,0.25)',
            transition: 'transform 0.25s, box-shadow 0.25s',
            animation: `fadeInUp 0.4s ease ${index * 0.09}s both`,
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(99,102,241,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 32px rgba(0,0,0,0.25)'; }}
        >
            {/* Image */}
            <div style={{ width: '200px', minHeight: '180px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                <img
                    src={imgUrl} alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))'; }}
                />
                {rating >= 4.5 && (
                    <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                        color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                        padding: '3px 9px', borderRadius: '99px',
                        boxShadow: '0 2px 10px rgba(245,158,11,0.4)',
                    }}>⭐ Top Rated</div>
                )}
                {fmtPx && (
                    <div style={{
                        position: 'absolute', bottom: '10px', left: '10px',
                        background: 'rgba(10,10,25,0.9)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px',
                        padding: '4px 10px', textAlign: 'center',
                    }}>
                        <div style={{ color: '#a5b4fc', fontWeight: 800, fontSize: '0.95rem', fontFamily: "'Space Grotesk',sans-serif" }}>{fmtPx}</div>
                        <div style={{ color: '#64748b', fontSize: '0.6rem' }}>{priceUnit}</div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '20px 22px', minWidth: '220px' }}>
                <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.05rem', margin: '0 0 5px', fontFamily: "'Space Grotesk',sans-serif" }}>
                    {name}
                </h3>
                {(location || city) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem', marginBottom: '8px' }}>
                        <MapPin size={12} style={{ color: '#6366f1' }} /> {location || city}
                    </div>
                )}
                <StarRating rating={rating} />
                {description && (
                    <p style={{
                        color: '#64748b', fontSize: '0.83rem', lineHeight: 1.65, margin: '10px 0',
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{description}</p>
                )}
                {amenities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0' }}>
                        {amenities.map((a, i) => (
                            <span key={i} style={{
                                padding: '2px 9px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600,
                                background: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)',
                            }}>{a}</span>
                        ))}
                    </div>
                )}
                {/* Booking buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <a href={bookingUrl} target="_blank" rel="noopener noreferrer" style={primaryBtnStyle}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.55)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = primaryBtnStyle.boxShadow; }}>
                        Book on Booking.com <ExternalLink size={12} />
                    </a>
                    <a href={`https://hotels.google.com/?q=${encodeURIComponent(name + ' ' + (city || ''))}`}
                        target="_blank" rel="noopener noreferrer" style={secondaryBtnStyle}>
                        Google Hotels <ExternalLink size={12} />
                    </a>
                </div>
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────────────────── */
/*  Restaurant Card                                          */
/* ────────────────────────────────────────────────────────── */
const RestaurantCard = ({ restaurant, index = 0, city = '' }) => {
    const { name, location, cuisine, rating, description } = restaurant;
    const imgUrl = getRestImg(index);
    const mapsUrl = buildRestaurantUrl(name, city || location);

    return (
        <div style={{
            borderRadius: '18px', overflow: 'hidden',
            background: 'rgba(10,10,25,0.9)',
            border: '1.5px solid rgba(20,184,166,0.15)',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'transform 0.25s, box-shadow 0.25s',
            animation: `fadeInUp 0.4s ease ${index * 0.07}s both`,
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(20,184,166,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
        >
            {/* Image */}
            <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                <img src={imgUrl} alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,rgba(20,184,166,0.2),rgba(5,150,105,0.15))'; }}
                />
                {cuisine && (
                    <div style={{
                        position: 'absolute', bottom: '10px', left: '10px',
                        background: 'rgba(10,10,25,0.85)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(20,184,166,0.3)', borderRadius: '99px',
                        padding: '3px 10px', color: '#2dd4bf', fontSize: '0.7rem', fontWeight: 700,
                    }}>🍽 {cuisine}</div>
                )}
            </div>
            {/* Content */}
            <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{name}</p>
                    <StarRating rating={rating} />
                </div>
                {(location || city) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.75rem', margin: '5px 0' }}>
                        <MapPin size={11} style={{ color: '#14b8a6' }} /> {location || city}
                    </div>
                )}
                {description && (
                    <p style={{
                        color: '#64748b', fontSize: '0.8rem', lineHeight: 1.6, margin: '6px 0 10px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{description}</p>
                )}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
                        ...primaryBtnStyle,
                        background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
                        boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
                        fontSize: '0.75rem', padding: '7px 14px',
                    }}>
                        Find on Maps <ExternalLink size={11} />
                    </a>
                    <a href={`https://zomato.com/search?q=${encodeURIComponent(name + ' ' + (city || ''))}`}
                        target="_blank" rel="noopener noreferrer" style={{ ...secondaryBtnStyle, fontSize: '0.75rem', padding: '7px 12px' }}>
                        Zomato <ExternalLink size={11} />
                    </a>
                </div>
            </div>
        </div>
    );
};

/* ── Button styles ── */
const primaryBtnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '8px 16px', borderRadius: '11px',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff', fontWeight: 700, fontSize: '0.8rem',
    textDecoration: 'none', whiteSpace: 'nowrap',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
    transition: 'all 0.2s',
};
const secondaryBtnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '8px 12px', borderRadius: '11px',
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
    color: '#818cf8', fontWeight: 700, fontSize: '0.8rem',
    textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s',
};

/* ────────────────────────────────────────────────────────── */
/*  Tab Bar — ALWAYS shows both tabs                        */
/* ────────────────────────────────────────────────────────── */
const TabBar = ({ active, setActive, hotelCount, restaurantCount }) => (
    <div style={{
        display: 'flex', gap: '6px', marginBottom: '24px',
        background: 'rgba(10,10,25,0.6)', borderRadius: '14px',
        padding: '5px', border: '1px solid rgba(255,255,255,0.06)',
        width: 'fit-content',
    }}>
        <button
            onClick={() => setActive('hotels')}
            style={{
                padding: '9px 20px', borderRadius: '10px', cursor: 'pointer',
                background: active === 'hotels' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                border: 'none', color: active === 'hotels' ? '#fff' : '#64748b',
                fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit',
                boxShadow: active === 'hotels' ? '0 4px 14px rgba(99,102,241,0.4)' : 'none',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '7px',
            }}
        >
            🏨 Hotels
            <span style={{
                padding: '1px 8px', borderRadius: '99px', fontSize: '0.7rem',
                background: active === 'hotels' ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.2)',
                color: active === 'hotels' ? '#fff' : '#818cf8',
            }}>{hotelCount}</span>
        </button>
        <button
            onClick={() => setActive('restaurants')}
            style={{
                padding: '9px 20px', borderRadius: '10px', cursor: 'pointer',
                background: active === 'restaurants' ? 'linear-gradient(135deg,#14b8a6,#0d9488)' : 'transparent',
                border: 'none', color: active === 'restaurants' ? '#fff' : '#64748b',
                fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit',
                boxShadow: active === 'restaurants' ? '0 4px 14px rgba(20,184,166,0.4)' : 'none',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '7px',
            }}
        >
            🍽️ Restaurants
            <span style={{
                padding: '1px 8px', borderRadius: '99px', fontSize: '0.7rem',
                background: active === 'restaurants' ? 'rgba(255,255,255,0.25)' : 'rgba(20,184,166,0.12)',
                color: active === 'restaurants' ? '#fff' : '#2dd4bf',
            }}>{restaurantCount}</span>
        </button>
    </div>
);

/* ────────────────────────────────────────────────────────── */
/*  Empty state                                               */
/* ────────────────────────────────────────────────────────── */
const EmptyState = ({ type }) => (
    <div style={{
        textAlign: 'center', padding: '48px 20px',
        background: 'rgba(10,10,25,0.6)', borderRadius: '16px',
        border: '1px dashed rgba(255,255,255,0.1)',
    }}>
        <p style={{ fontSize: '2rem', margin: '0 0 10px' }}>{type === 'hotels' ? '🏨' : '🍽️'}</p>
        <p style={{ color: '#475569', fontSize: '0.88rem' }}>
            No {type} recommendations found in the AI response.
        </p>
    </div>
);

/* ────────────────────────────────────────────────────────── */
/*  Main HotelView                                           */
/* ────────────────────────────────────────────────────────── */
const HotelView = ({ hotels = [], restaurants = [], aiText = '', city = '' }) => {
    const [activeTab, setActiveTab] = useState('hotels');

    // Parse AI text if no structured data provided
    const { hotels: parsedHotels, restaurants: parsedRestaurants } = useMemo(
        () => (hotels.length === 0 && restaurants.length === 0 && aiText)
            ? parseAIText(aiText, city)
            : { hotels, restaurants },
        [hotels, restaurants, aiText, city]
    );

    const displayHotels = parsedHotels;
    const displayRestaurants = parsedRestaurants;

    // Tabs always shown
    return (
        <div>
            <TabBar
                active={activeTab}
                setActive={setActiveTab}
                hotelCount={displayHotels.length}
                restaurantCount={displayRestaurants.length}
            />

            {/* Hotels panel */}
            {activeTab === 'hotels' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {displayHotels.length > 0
                        ? displayHotels.map((h, i) => <HotelCard key={i} hotel={h} index={i} city={city} />)
                        : <EmptyState type="hotels" />
                    }
                </div>
            )}

            {/* Restaurants panel */}
            {activeTab === 'restaurants' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '14px' }}>
                    {displayRestaurants.length > 0
                        ? displayRestaurants.map((r, i) => <RestaurantCard key={i} restaurant={r} index={i} city={city} />)
                        : <EmptyState type="restaurants" />
                    }
                </div>
            )}
        </div>
    );
};

export default HotelView;
