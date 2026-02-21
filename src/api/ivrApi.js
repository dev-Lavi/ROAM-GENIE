import { API_BASE_URL } from '../utils/constants';

export const submitIVR = async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/ivr/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`IVR request failed: ${res.status}`);
    return res.json();
};
