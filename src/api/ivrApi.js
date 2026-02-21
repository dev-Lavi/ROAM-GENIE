/**
 * ivrApi.js
 *
 * POST /api/ivr/call
 *   Body: { toNumber: string }    ← camelCase (backend uses req.body.toNumber)
 *   Response: { success, sid?, message }
 *
 * POST /api/emergency/flight-cancellation
 *   Body: { whatsappNumber: string }
 *   Response: { success, sid, status, message }
 *
 * POST /api/emergency/offline-fallback
 *   Body: { whatsappNumber: string }
 *   Response: { success, sid, status, message }
 */

import { API_BASE_URL } from '../utils/constants';

/**
 * Initiate an IVR voice call.
 * @param {{ to_number: string }} data  - IVR.jsx passes { to_number }; we remap to toNumber
 */
export const submitIVR = async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/ivr/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toNumber: data.to_number || data.toNumber }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `IVR call failed: ${res.status}`);
    }

    return res.json();
};

/**
 * Send a WhatsApp emergency alert.
 * IVR.jsx calls sendWhatsAppAlert({ to_number, type })
 * where type is "cancellation" | "offline"
 *
 * @param {{ to_number: string, type: "cancellation" | "offline" }} data
 */
export const sendWhatsAppAlert = async (data) => {
    const number = data.to_number || data.whatsappNumber;
    const endpoint = data.type === 'cancellation'
        ? '/api/emergency/flight-cancellation'
        : '/api/emergency/offline-fallback';

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber: number }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `WhatsApp alert failed: ${res.status}`);
    }

    return res.json();
};
