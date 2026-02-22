/**
 * Contact Routes  –  /api/contact
 *
 * POST /api/contact/submit
 *   Body: { firstName, lastName, email, phone }
 *   Forwards the info to the Vendasta CRM webhook.
 *   Response: { success, message }
 */
import { Router } from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = Router();

const VENDASTA_CRM_URL = process.env.VENDASTA_CRM_URL;

// ─── POST /api/contact/submit ─────────────────────────────────────────────────
router.post('/submit', async (req, res) => {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email || !phone) {
        return res.status(400).json({
            error: 'All fields are required: firstName, lastName, email, phone.',
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    try {
        logger.info(`[ContactRoute] Submitting contact info for ${email} to Vendasta CRM`);

        const payload = {
            firstName,
            secondName: lastName,
            email,
            phone,
        };

        const response = await axios.post(VENDASTA_CRM_URL, payload, {
            timeout: 15_000,
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
            logger.info(`[ContactRoute] CRM submission successful for ${email}`);
            return res.json({ success: true, message: 'Info sent to our CRM successfully!' });
        }

        logger.warn(`[ContactRoute] Unexpected CRM status: ${response.status}`);
        res.status(response.status).json({
            success: false,
            message: `CRM returned unexpected status: ${response.status}`,
        });
    } catch (err) {
        logger.error(`[ContactRoute] CRM submission error: ${err.message}`);
        const status = err.response?.status ?? 500;
        res.status(status).json({ error: `Failed to submit info. Status: ${status}` });
    }
});

export default router;
