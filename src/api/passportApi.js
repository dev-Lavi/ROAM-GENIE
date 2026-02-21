import { API_BASE_URL } from '../utils/constants';

export const analyzePassport = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE_URL}/api/passport/analyze`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Passport analysis failed: ${res.status}`);
    return res.json();
};
