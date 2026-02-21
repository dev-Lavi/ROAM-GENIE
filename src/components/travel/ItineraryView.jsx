import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import Card from '../common/Card';

const dayColors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9',
];

const ItineraryView = ({ itinerary }) => {
    const [openDay, setOpenDay] = useState(0);

    if (!itinerary) return null;

    /* Support both raw markdown string and structured { days: [...] } */
    if (typeof itinerary === 'string') {
        return (
            <div style={{
                background: 'rgba(17,17,34,0.7)',
                border: '1px solid rgba(99,102,241,0.18)',
                borderRadius: '20px',
                padding: '32px',
            }}>
                <div className="markdown-body" style={{
                    color: '#cbd5e1', lineHeight: 1.8,
                    fontSize: '0.95rem',
                }}>
                    <style>{`
            .markdown-body h1,.markdown-body h2,.markdown-body h3 {
              color:#a5b4fc; font-family:'Space Grotesk',sans-serif; margin:1.2em 0 0.6em;
            }
            .markdown-body h1 { font-size:1.4rem; }
            .markdown-body h2 { font-size:1.2rem; }
            .markdown-body h3 { font-size:1.05rem; }
            .markdown-body p  { margin:0.6em 0; }
            .markdown-body ul { padding-left:1.4em; }
            .markdown-body li { margin:0.35em 0; }
            .markdown-body strong { color:#e2e8f0; }
            .markdown-body em    { color:#94a3b8; }
            .markdown-body hr    { border:none; border-top:1px solid rgba(99,102,241,0.2); margin:1.5em 0; }
            .markdown-body code  { background:rgba(99,102,241,0.15); color:#a5b4fc; padding:2px 6px; border-radius:4px; font-size:0.85em; }
          `}</style>
                    <ReactMarkdown>{itinerary}</ReactMarkdown>
                </div>
            </div>
        );
    }

    /* Structured { days: [ { day, title, activities:[] } ] } */
    const days = itinerary?.days || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {days.map((dayData, idx) => {
                const color = dayColors[idx % dayColors.length];
                const isOpen = openDay === idx;
                const activities = dayData.activities || [];

                return (
                    <Card key={idx} style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Day Header */}
                        <button
                            onClick={() => setOpenDay(isOpen ? -1 : idx)}
                            style={{
                                width: '100%', padding: '18px 24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                cursor: 'pointer', background: 'transparent', border: 'none',
                                fontFamily: 'inherit', textAlign: 'left',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: `${color}22`, border: `1.5px solid ${color}55`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Calendar size={18} style={{ color }} />
                                </div>
                                <div>
                                    <p style={{ color, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                                        Day {dayData.day || idx + 1}
                                    </p>
                                    <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '1rem', margin: 0 }}>
                                        {dayData.title || `Day ${idx + 1}`}
                                    </p>
                                </div>
                            </div>
                            <div style={{ color: '#475569' }}>
                                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>

                        {/* Activities */}
                        {isOpen && (
                            <div style={{
                                padding: '0 24px 24px',
                                borderTop: `1px solid ${color}25`,
                                animation: 'fadeInUp 0.25s ease',
                            }}>
                                {activities.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
                                        {activities.map((act, aIdx) => (
                                            <div key={aIdx} style={{
                                                display: 'flex', gap: '14px', alignItems: 'flex-start',
                                                padding: '14px', borderRadius: '12px',
                                                background: 'rgba(99,102,241,0.05)',
                                                border: '1px solid rgba(99,102,241,0.1)',
                                            }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '8px',
                                                    background: `${color}18`, border: `1px solid ${color}40`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0, fontSize: '1rem',
                                                }}>
                                                    {act.emoji || '📌'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                        {act.time && (
                                                            <span style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 700 }}>{act.time}</span>
                                                        )}
                                                        <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{act.title || act}</p>
                                                    </div>
                                                    {act.description && (
                                                        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>{act.description}</p>
                                                    )}
                                                    {act.location && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: '#475569', fontSize: '0.78rem' }}>
                                                            <MapPin size={11} />{act.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#475569', fontSize: '0.88rem', marginTop: '16px' }}>No activities listed for this day.</p>
                                )}
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};

export default ItineraryView;
