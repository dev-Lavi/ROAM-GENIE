import { API_BASE_URL } from '../utils/constants';

export const searchFlights = async (params) => {
    const res = await fetch(`${API_BASE_URL}/api/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Flight search failed: ${res.status}`);
    return res.json();
};
