/**
 * Emergency Routes  –  /api/emergency
 *
 * POST /api/emergency/flight-cancellation
 *   Body: { whatsappNumber: string }
 *   Sends a WhatsApp emergency alert via Twilio.
 *   Response: { success, sid, status }
 *
 * POST /api/emergency/offline-fallback
 *   Body: { whatsappNumber: string }
 *   Sends a WhatsApp offline fallback message via Twilio.
 *   Response: { success, sid, status }
 */
import { Router } from 'express';
import { sendWhatsApp } from '../services/twilioService.js';
import logger from '../utils/logger.js';

const router = Router();

// ─── Shared validator ─────────────────────────────────────────────────────────
function validateIndianWhatsApp(number) {
    // Acceptable: "+919876543210" or "919876543210" with or without "whatsapp:" prefix
    const stripped = number.replace(/^whatsapp:/i, '');
    return stripped.startsWith('+91') && stripped.length === 13;
}

// ─── POST /api/emergency/flight-cancellation ──────────────────────────────────
router.post('/flight-cancellation', async (req, res) => {
    const { whatsappNumber } = req.body;

    if (!whatsappNumber) {
        return res.status(400).json({ error: 'Field "whatsappNumber" is required.' });
    }

    if (!validateIndianWhatsApp(whatsappNumber)) {
        return res.status(400).json({
            error: 'Please provide a valid WhatsApp number starting with +91 (e.g. +919876543210).',
        });
    }

    try {
        logger.info(`[EmergencyRoute] Sending flight-cancellation alert to ${whatsappNumber}`);

        const body =
            '🚨 [Emergency] Your flight AI302 has been CANCELLED. ' +
            'Please check your email for rebooking or call +91-9999999999 for help.';

        const result = await sendWhatsApp(whatsappNumber, body);
        res.json({ success: true, ...result, message: 'Emergency alert sent!' });
    } catch (err) {
        logger.error(`[EmergencyRoute] Flight cancellation alert error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/emergency/offline-fallback ────────────────────────────────────
router.post('/offline-fallback', async (req, res) => {
    const { whatsappNumber } = req.body;

    if (!whatsappNumber) {
        return res.status(400).json({ error: 'Field "whatsappNumber" is required.' });
    }

    if (!validateIndianWhatsApp(whatsappNumber)) {
        return res.status(400).json({
            error: 'Please provide a valid WhatsApp number starting with +91.',
        });
    }

    try {
        logger.info(`[EmergencyRoute] Sending offline-fallback message to ${whatsappNumber}`);

        const body =
            '📴 [Fallback] Our systems are temporarily offline. ' +
            'For urgent help, call +91-9999999999 or visit your nearest airline office.';

        const result = await sendWhatsApp(whatsappNumber, body);
        res.json({ success: true, ...result, message: 'Offline fallback message sent!' });
    } catch (err) {
        logger.error(`[EmergencyRoute] Offline fallback error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

export default router;
