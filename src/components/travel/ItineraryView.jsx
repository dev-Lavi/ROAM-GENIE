import React, { useState } from 'react';
import {
    Calendar, Clock, MapPin, Coffee, Sun, Moon,
    ChevronDown, ChevronUp,
} from 'lucide-react';



/* ─── Day Color Palette ─────────────────── */
const DAY_PALETTES = [
    { from: '#6366f1', to: '#818cf8', glow: 'rgba(99,102,241,0.35)', light: 'rgba(99,102,241,0.08)' },
    { from: '#8b5cf6', to: '#a78bfa', glow: 'rgba(139,92,246,0.35)', light: 'rgba(139,92,246,0.08)' },
    { from: '#ec4899', to: '#f472b6', glow: 'rgba(236,72,153,0.35)', light: 'rgba(236,72,153,0.08)' },
    { from: '#14b8a6', to: '#2dd4bf', glow: 'rgba(20,184,166,0.35)', light: 'rgba(20,184,166,0.08)' },
    { from: '#f59e0b', to: '#fbbf24', glow: 'rgba(245,158,11,0.35)', light: 'rgba(245,158,11,0.08)' },
    { from: '#0ea5e9', to: '#38bdf8', glow: 'rgba(14,165,233,0.35)', light: 'rgba(14,165,233,0.08)' },
    { from: '#22c55e', to: '#4ade80', glow: 'rgba(34,197,94,0.35)', light: 'rgba(34,197,94,0.08)' },
    { from: '#f97316', to: '#fb923c', glow: 'rgba(249,115,22,0.35)', light: 'rgba(249,115,22,0.08)' },
];

/* ─── Time-of-day icons ─── */
const getTimeIcon = (time) => {
    if (!time) return <Clock size={14} />;
    const hour = parseInt(time.split(':')[0], 10);
    if (hour < 12) return <Coffee size={14} />;
    if (hour < 17) return <Sun size={14} />;
    if (hour < 20) return <Sun size={14} />;  // afternoon/evening use Sun
    return <Moon size={14} />;
};

/* ─── Activity keyword → emoji ─── */
const getActivityEmoji = (text = '') => {
    const t = text.toLowerCase();
    if (t.includes('breakfast') || t.includes('brunch')) return '☕';
    if (t.includes('lunch') || t.includes('dinner') || t.includes('eat') || t.includes('restaurant') || t.includes('cuisine') || t.includes('food')) return '🍽️';
    if (t.includes('temple') || t.includes('mosque') || t.includes('church') || t.includes('shrine')) return '🛕';
    if (t.includes('museum') || t.includes('gallery') || t.includes('exhibit')) return '🏛️';
    if (t.includes('beach') || t.includes('ocean') || t.includes('sea')) return '🏖️';
    if (t.includes('mountain') || t.includes('trek') || t.includes('hike') || t.includes('hill')) return '⛰️';
    if (t.includes('market') || t.includes('shop') || t.includes('bazaar') || t.includes('mall')) return '🛍️';
    if (t.includes('hotel') || t.includes('check-in') || t.includes('check in') || t.includes('resort')) return '🏨';
    if (t.includes('flight') || t.includes('airport') || t.includes('depart')) return '✈️';
    if (t.includes('train') || t.includes('bus') || t.includes('transport')) return '🚆';
    if (t.includes('palace') || t.includes('fort') || t.includes('castle')) return '🏰';
    if (t.includes('park') || t.includes('garden') || t.includes('nature')) return '🌿';
    if (t.includes('sunset') || t.includes('sunrise') || t.includes('viewpoint')) return '🌅';
    if (t.includes('boat') || t.includes('cruise') || t.includes('river')) return '🚢';
    if (t.includes('safari') || t.includes('wildlife') || t.includes('zoo')) return '🦁';
    if (t.includes('photo') || t.includes('camera')) return '📷';
    if (t.includes('spa') || t.includes('relax') || t.includes('massage')) return '💆';
    if (t.includes('nightlife') || t.includes('bar') || t.includes('club')) return '🌃';
    return '📍';
};

/* ─── Parse raw markdown itinerary into structured days ─── */
const parseItinerary = (text) => {
    if (!text || typeof text !== 'string') return [];

    const days = [];
    // Split on "Day N" headers (handles ## Day 1, **Day 1**, Day 1:, etc.)
    const dayRegex = /(?:#{1,3}\s*|[\*]{0,2})?Day\s+(\d+)[:\s\-–—]*(.*?)(?=\n(?:#{1,3}\s*|[\*]{0,2})?Day\s+\d+|$)/gis;

    let match;
    while ((match = dayRegex.exec(text)) !== null) {
        const dayNum = parseInt(match[1], 10);
        const rest = match[0];

        // Extract title from first line after "Day N"
        const lines = rest.split('\n').map(l => l.trim()).filter(Boolean);
        let titleLine = lines[0] || '';
        // Remove "Day N" prefix and "day N:" prefix from title line
        titleLine = titleLine.replace(/^(?:#{1,3}\s*|[\*]{0,2})?Day\s+\d+[:\s\-–—]*/i, '').replace(/\*+/g, '').trim();

        // Parse activities from remaining lines
        const activities = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            // Skip section dividers
            if (/^[-=_*]{3,}$/.test(line)) continue;
            // Skip empty or repeated "Day N" lines
            if (/^(?:#{1,3}\s*)?Day\s+\d+/i.test(line)) continue;

            // Clean markdown artifacts
            let cleaned = line
                .replace(/^[\*\-•●▸►✦✓→]\s*/, '')
                .replace(/#{1,3}\s*/, '')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .trim();

            if (!cleaned) continue;

            // Try to extract time prefix like "9:00 AM:", "Morning:", etc.
            const timeMatch = cleaned.match(/^((?:\d{1,2}:\d{2}\s*(?:AM|PM)?)|(?:Morning|Afternoon|Evening|Night|Breakfast|Lunch|Dinner))\s*[:\-–]?\s*/i);
            let time = null;
            let title = cleaned;

            if (timeMatch) {
                time = timeMatch[1];
                title = cleaned.slice(timeMatch[0].length).trim();
            }

            // Try to extract location from parentheses or "at <place>"
            const locationMatch = title.match(/\s*[\(\[]([^)\]]+)[\)\]]\s*$/) ||
                title.match(/\s+(?:at|@)\s+([^,\.]+)(?:[,\.]|$)/i);
            let location = null;
            if (locationMatch) {
                location = locationMatch[1].trim();
                title = title.replace(locationMatch[0], '').trim();
            }

            if (title.length > 3) {
                activities.push({
                    time,
                    title,
                    location,
                    emoji: getActivityEmoji(title),
                });
            }
        }

        days.push({
            day: dayNum,
            title: titleLine || `Day ${dayNum}`,
            activities,
        });
    }

    return days;
};

/* ─── Activity Card ─── */
const ActivityItem = ({ act, idx, palette, isLast }) => {
    const dotOffset = idx * 48 + 24;
    return (
        <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
            {/* Timeline connector */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0 }}>
                {/* Dot */}
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                    boxShadow: `0 0 12px ${palette.glow}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0, zIndex: 1,
                }}>
                    {act.emoji}
                </div>
                {/* Vertical line */}
                {!isLast && (
                    <div style={{
                        width: '2px', flex: 1, minHeight: '24px',
                        background: `linear-gradient(to bottom, ${palette.from}60, transparent)`,
                        marginTop: '4px',
                    }} />
                )}
            </div>

            {/* Content */}
            <div style={{
                flex: 1, paddingBottom: isLast ? '0' : '20px',
                paddingTop: '4px',
            }}>
                {/* Time badge */}
                {act.time && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '2px 10px', borderRadius: '99px',
                        background: `${palette.light}`,
                        border: `1px solid ${palette.from}40`,
                        color: palette.from, fontSize: '0.72rem', fontWeight: 700,
                        marginBottom: '6px', letterSpacing: '0.03em',
                    }}>
                        {getTimeIcon(act.time)}
                        {act.time}
                    </div>
                )}

                {/* Activity name */}
                <p style={{
                    color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem',
                    margin: '0 0 4px', lineHeight: 1.4,
                }}>
                    {act.title}
                </p>

                {/* Location */}
                {act.location && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        color: '#64748b', fontSize: '0.78rem', marginTop: '2px',
                    }}>
                        <MapPin size={11} style={{ color: palette.from }} />
                        {act.location}
                    </div>
                )}

                {/* Description if present */}
                {act.description && (
                    <p style={{ color: '#64748b', fontSize: '0.83rem', margin: '6px 0 0', lineHeight: 1.6 }}>
                        {act.description}
                    </p>
                )}
            </div>
        </div>
    );
};

/* ─── Day Card ─── */
const DayCard = ({ dayData, idx, isOpen, onToggle }) => {
    const palette = DAY_PALETTES[idx % DAY_PALETTES.length];
    const activities = dayData.activities || [];

    return (
        <div style={{
            borderRadius: '20px', overflow: 'hidden',
            border: `1.5px solid ${isOpen ? palette.from + '50' : 'rgba(255,255,255,0.06)'}`,
            background: 'rgba(10,10,25,0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: isOpen ? `0 8px 40px ${palette.glow}` : '0 2px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: `fadeInUp 0.4s ease ${idx * 0.06}s both`,
        }}>
            {/* Header */}
            <button
                onClick={onToggle}
                style={{
                    width: '100%', padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: '0',
                    cursor: 'pointer', border: 'none', background: 'transparent',
                    fontFamily: 'inherit', textAlign: 'left',
                    borderBottom: isOpen ? `1px solid ${palette.from}25` : 'none',
                    transition: 'all 0.2s',
                }}
            >
                {/* Day number badge */}
                <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                    boxShadow: `0 4px 20px ${palette.glow}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', marginRight: '18px', flexShrink: 0,
                }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>DAY</span>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem', lineHeight: 1, fontFamily: "'Space Grotesk',sans-serif" }}>
                        {dayData.day || idx + 1}
                    </span>
                </div>

                {/* Title & count */}
                <div style={{ flex: 1 }}>
                    <h3 style={{
                        color: '#e2e8f0', fontWeight: 700, fontSize: '1.05rem',
                        margin: '0 0 4px', fontFamily: "'Space Grotesk',sans-serif",
                    }}>
                        {dayData.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {activities.length > 0 && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                fontSize: '0.75rem', color: '#64748b', fontWeight: 500,
                            }}>
                                <Calendar size={12} />
                                {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                            </span>
                        )}
                        {activities.slice(0, 3).map((act, i) => (
                            <span key={i} style={{ fontSize: '0.9rem' }} title={act.title}>
                                {act.emoji}
                            </span>
                        ))}
                        {activities.length > 3 && (
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>+{activities.length - 3} more</span>
                        )}
                    </div>
                </div>

                {/* Toggle arrow */}
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: isOpen ? `${palette.from}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isOpen ? palette.from + '40' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isOpen ? palette.from : '#475569',
                    transition: 'all 0.2s', flexShrink: 0, marginLeft: '12px',
                }}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </button>

            {/* Activity Timeline */}
            {isOpen && (
                <div style={{
                    padding: '24px 24px 24px 24px',
                    animation: 'fadeInUp 0.25s ease',
                }}>
                    {activities.length > 0 ? (
                        <div>
                            {activities.map((act, aIdx) => (
                                <ActivityItem
                                    key={aIdx}
                                    act={act}
                                    idx={aIdx}
                                    palette={palette}
                                    isLast={aIdx === activities.length - 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#475569', fontSize: '0.88rem', textAlign: 'center', padding: '16px 0' }}>
                            Details coming soon…
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── Fallback: render raw markdown beautifully ─── */
const MarkdownItinerary = ({ text }) => {
    // Try to find day blocks even in messy markdown
    const lines = text.split('\n');

    return (
        <div style={{
            background: 'rgba(10,10,25,0.85)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '20px',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative gradient blob */}
            <div style={{
                position: 'absolute', top: '-60px', right: '-60px',
                width: '200px', height: '200px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <style>{`
                .itin-md { color: #cbd5e1; line-height: 1.85; font-size: 0.95rem; }
                .itin-md h1, .itin-md h2 {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 1.2rem; font-weight: 700;
                    color: #a5b4fc; margin: 1.6em 0 0.6em;
                    padding: 10px 16px;
                    background: rgba(99,102,241,0.08);
                    border-left: 3px solid #6366f1;
                    border-radius: 0 10px 10px 0;
                }
                .itin-md h3 {
                    color: #2dd4bf; font-size: 1rem; font-weight: 600;
                    margin: 1.2em 0 0.4em; font-family: 'Space Grotesk', sans-serif;
                }
                .itin-md p { margin: 0.6em 0; }
                .itin-md ul { padding-left: 0; list-style: none; }
                .itin-md li {
                    margin: 0.45em 0; padding: 8px 14px 8px 36px;
                    position: relative; border-radius: 8px;
                    background: rgba(99,102,241,0.04);
                    border: 1px solid rgba(99,102,241,0.08);
                    transition: background 0.15s;
                }
                .itin-md li::before {
                    content: '✦';
                    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
                    color: #6366f1; font-size: 0.7rem;
                }
                .itin-md strong { color: #e2e8f0; font-weight: 700; }
                .itin-md em { color: #94a3b8; }
                .itin-md hr { border: none; border-top: 1px solid rgba(99,102,241,0.15); margin: 1.8em 0; }
                .itin-md code { background: rgba(99,102,241,0.15); color: #a5b4fc; padding: 2px 7px; border-radius: 4px; font-size: 0.85em; }
                .itin-md blockquote {
                    border-left: 3px solid #8b5cf6; padding: 10px 16px;
                    background: rgba(139,92,246,0.06); border-radius: 0 10px 10px 0;
                    color: #94a3b8; margin: 1em 0;
                }
            `}</style>
            <div className="itin-md"
                dangerouslySetInnerHTML={{
                    __html: renderMarkdown(text)
                }}
            />
        </div>
    );
};

/** Very lightweight markdown → HTML converter for the fallback view */
const renderMarkdown = (md) => {
    return md
        // Headings
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold & italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // HR
        .replace(/^---+$/gm, '<hr/>')
        // Lists
        .replace(/^[-•●▸►✦]\s+(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        // Paragraphs
        .replace(/\n\n+/g, '</p><p>')
        .replace(/^(?!<[hul]|<\/[hul]|<hr)(.+)$/gm, (_, p) => p ? `<p>${p}</p>` : '')
        .replace(/<p><\/p>/g, '')
        // Clean duplicate wrappers
        .replace(/<p>(<[hul])/g, '$1')
        .replace(/(<\/[hul]>)<\/p>/g, '$1');
};

/* ─── Download helper ──────────────────────────── */
const downloadItinerary = (rawText, parsedDays, destination) => {
    const title = destination ? `${destination} Itinerary` : 'Travel Itinerary';
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>
body{font-family:Georgia,serif;max-width:800px;margin:40px auto;color:#1a1a2e;line-height:1.7;}
h1{text-align:center;font-size:2rem;border-bottom:3px solid #6366f1;padding-bottom:12px;color:#4338ca;}
h2{font-size:1.3rem;color:#4338ca;margin:2em 0 0.5em;border-left:4px solid #6366f1;padding-left:12px;}
h3{color:#6366f1;font-size:1rem;margin:1em 0 0.3em;}
ul{padding-left:1.4em;}li{margin:0.3em 0;}
.day{background:#f8f7ff;padding:16px 20px;border-radius:12px;margin:1.5em 0;border:1px solid #e0e7ff;}
.day-badge{display:inline-block;background:#6366f1;color:#fff;padding:3px 12px;border-radius:99px;font-size:0.85rem;font-weight:bold;margin-bottom:8px;}
.act{padding:8px 0;border-bottom:1px solid #e0e7ff;}
.time{color:#6366f1;font-weight:bold;font-size:0.85rem;}
@media print{body{margin:20px;}}
</style>
</head>
<body>
<h1>${title}</h1>
<p style="text-align:center;color:#666;">Generated by RoamGenie • ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
`;
    if (parsedDays.length > 0) {
        parsedDays.forEach(day => {
            html += `<div class="day"><span class="day-badge">Day ${day.day}</span><h2>${day.title}</h2>`;
            if (day.activities?.length > 0) {
                day.activities.forEach(act => {
                    html += `<div class="act">`;
                    if (act.time) html += `<span class="time">${act.time} &mdash; </span>`;
                    html += `<strong>${act.emoji || ''} ${act.title}</strong>`;
                    if (act.location) html += ` <em style="color:#64748b;font-size:0.9em">(${act.location})</em>`;
                    if (act.description) html += `<p style="margin:4px 0 0;color:#64748b;font-size:0.9em">${act.description}</p>`;
                    html += `</div>`;
                });
            }
            html += `</div>`;
        });
    } else if (rawText) {
        html += `<pre style="white-space:pre-wrap;font-family:inherit">${rawText.replace(/</g,'&lt;')}</pre>`;
    }
    html += '</body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
};

/* ─── Main ItineraryView ─────────────────────────── */
const ItineraryView = ({ itinerary, destination = '' }) => {
    const [openDays, setOpenDays] = useState(new Set([0]));

    if (!itinerary) return null;

    const toggleDay = (idx) => {
        setOpenDays(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    /* ── Structured object { days: [...] } ── */
    if (typeof itinerary === 'object' && itinerary.days) {
        const days = itinerary.days;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {days.map((dayData, idx) => (
                    <DayCard
                        key={idx}
                        dayData={dayData}
                        idx={idx}
                        isOpen={openDays.has(idx)}
                        onToggle={() => toggleDay(idx)}
                    />
                ))}
            </div>
        );
    }

    /* ── Raw markdown string ── parse it into structured days ── */
    const parsedDays = parseItinerary(itinerary);

    if (parsedDays.length > 0) {
        return (
            <div>
                {/* Quick-expand controls */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Download button */}
                    <button
                        onClick={() => downloadItinerary(itinerary, parsedDays, destination)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '8px 18px', borderRadius: '11px', cursor: 'pointer',
                            background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                            border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                            fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.55)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.4)'; }}
                    >
                        ⬇ Download Itinerary
                    </button>
                    {/* Expand/Collapse */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setOpenDays(new Set(parsedDays.map((_, i) => i)))}
                            style={{
                                padding: '6px 14px', borderRadius: '10px', cursor: 'pointer',
                                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                                color: '#818cf8', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
                            }}
                        >
                            Expand All
                        </button>
                        <button
                            onClick={() => setOpenDays(new Set())}
                            style={{
                                padding: '6px 14px', borderRadius: '10px', cursor: 'pointer',
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#64748b', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
                            }}
                        >
                            Collapse All
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {parsedDays.map((dayData, idx) => (
                        <DayCard
                            key={idx}
                            dayData={dayData}
                            idx={idx}
                            isOpen={openDays.has(idx)}
                            onToggle={() => toggleDay(idx)}
                        />
                    ))}
                </div>
            </div>
        );
    }

    /* ── Fallback: couldn't parse days, render styled markdown ── */
    return <MarkdownItinerary text={itinerary} />;
};

export default ItineraryView;
