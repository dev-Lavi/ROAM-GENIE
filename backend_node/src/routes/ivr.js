/**
 * IVR Routes  –  /api/ivr
 *
 * POST /api/ivr/call
 *   Body: { toNumber: string }   - E.164 formatted Indian number e.g. "+919876543210"
 *   Forwards the request to the n8n webhook and optionally also triggers a Twilio call.
 *   Response: { success, sid?, message }
 */
import { Router } from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = Router();

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// ─── POST /api/ivr/call ───────────────────────────────────────────────────────
router.post('/call', async (req, res) => {
    const { toNumber } = req.body;

    if (!toNumber) {
        return res.status(400).json({ error: 'Field "toNumber" is required.' });
    }

    // Validate Indian number format (+91XXXXXXXXXX = 13 chars)
    if (!toNumber.startsWith('+91') || toNumber.length !== 13) {
        return res.status(400).json({
            error: 'Please provide a valid Indian phone number starting with +91 (e.g. +919876543210).',
        });
    }

    try {
        logger.info(`[IVRRoute] Forwarding call request to n8n for ${toNumber}`);

        const payload = { to_number: toNumber };
        const response = await axios.post(N8N_WEBHOOK_URL, payload, { timeout: 15_000 });

        const result = response.data;

        if (result?.success) {
            logger.info(`[IVRRoute] Call initiated: SID ${result.sid}`);
            return res.json({ success: true, sid: result.sid, message: 'Call initiated successfully!' });
        }

        logger.warn(`[IVRRoute] n8n returned non-success: ${JSON.stringify(result)}`);
        return res.json({ success: false, message: 'Call request sent, but no SID returned.' });
    } catch (err) {
        logger.error(`[IVRRoute] n8n webhook error: ${err.message}`);

        const status = err.response?.status ?? 500;
        const details = err.response?.data ?? err.message;
        res.status(status).json({
            error: `Call initiation failed. Status: ${status}. Details: ${JSON.stringify(details)}`,
        });
    }
});

export default router;
