import { API_BASE_URL } from '../utils/constants';

export const submitContact = async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Contact submission failed: ${res.status}`);
    return res.json();
};
