// With the Vite proxy configured, use '' (relative) so /api/* is proxied to :3000 in dev.
// In production, set VITE_API_BASE_URL to the deployed backend URL.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const FLIGHT_CLASSES = [
    { value: 'economy', label: 'Economy' },
    { value: 'premium_economy', label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First Class' },
];

export const TRAVEL_PREFERENCES = [
    'Adventure', 'Cultural', 'Beach', 'Mountain', 'City Tour',
    'Wildlife', 'Food & Cuisine', 'Nightlife', 'Shopping', 'Relaxation',
    'Historical', 'Photography', 'Solo', 'Family Friendly',
];

export const BUDGET_RANGES = [
    { value: 'budget', label: 'Budget  (< ₹30k)', icon: '💰' },
    { value: 'moderate', label: 'Moderate (₹30k–₹1L)', icon: '💳' },
    { value: 'luxury', label: 'Luxury  (> ₹1L)', icon: '💎' },
];
