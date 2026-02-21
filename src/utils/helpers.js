/** Format a price number to currency string */
export const formatPrice = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

/** Convert "HH:MM" duration string to human-readable */
export const formatDuration = (minutes) => {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/** Format ISO date to "DD Mon YYYY" */
export const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Clamp string to N chars */
export const truncate = (str, n = 100) =>
    str && str.length > n ? str.slice(0, n) + '…' : str;

/** Sleep helper */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
