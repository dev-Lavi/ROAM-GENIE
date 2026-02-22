/**
 * War Room Routes  –  /api/warroom
 *
 * POST /api/warroom/monitor
 *   Body: {
 *     flightIata:      string   e.g. "EK502"
 *     destination:     string   e.g. "Dubai"
 *     layoverMinutes?: number   e.g. 135
 *     whatsappNumber?: string   e.g. "+919876543210"
 *   }
 *   Response: { flightStatus, advisories, intel, whatsappSent }
 *
 * GET /api/warroom/advisories?destination=Dubai
 *   Response: { destination, advisories: string[] }
 *
 * GET /api/warroom/flight?iata=EK502
 *   Response: flightStatus object
 */
import { Router } from 'express';
import {
    fetchFlightStatus,
    fetchTravelAdvisories,
    buildIntelBrief,
} from '../services/warRoomService.js';
import { sendWhatsApp } from '../services/twilioService.js';
import logger from '../utils/logger.js';

const router = Router();

// ─── POST /api/warroom/monitor ────────────────────────────────────────────────
router.post('/monitor', async (req, res) => {
    try {
        const { flightIata, destination, layoverMinutes, whatsappNumber } = req.body;

        if (!flightIata) {
            return res.status(400).json({ error: 'Field "flightIata" is required (e.g. "EK502").' });
        }

        logger.info(`[WarRoomRoute] Monitoring ${flightIata} → ${destination ?? 'unknown'}`);

        // Parallel: flight status + advisories
        const [flightStatus, advisories] = await Promise.all([
            fetchFlightStatus(flightIata),
            destination ? fetchTravelAdvisories(destination) : Promise.resolve([]),
        ]);

        // Build Gemini intelligence brief
        const intel = await buildIntelBrief(flightStatus, advisories, {
            destination: destination ?? 'your destination',
            layoverMinutes: layoverMinutes ?? null,
        });

        // Optionally push WhatsApp alert
        let whatsappSent = false;
        if (whatsappNumber && intel.alertLevel !== 'green') {
            try {
                await sendWhatsApp(whatsappNumber, intel.whatsappAlert);
                whatsappSent = true;
                logger.info(`[WarRoomRoute] WhatsApp alert sent (level: ${intel.alertLevel})`);
            } catch (waErr) {
                logger.warn(`[WarRoomRoute] WhatsApp send failed: ${waErr.message}`);
            }
        }

        res.json({ flightStatus, advisories, intel, whatsappSent });
    } catch (err) {
        logger.error(`[WarRoomRoute] Monitor error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/warroom/advisories ──────────────────────────────────────────────
router.get('/advisories', async (req, res) => {
    const { destination } = req.query;
    if (!destination) {
        return res.status(400).json({ error: 'Query param "destination" is required.' });
    }

    try {
        const advisories = await fetchTravelAdvisories(destination);
        res.json({ destination, advisories });
    } catch (err) {
        logger.error(`[WarRoomRoute] Advisories error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/warroom/flight ──────────────────────────────────────────────────
router.get('/flight', async (req, res) => {
    const { iata } = req.query;
    if (!iata) {
        return res.status(400).json({ error: 'Query param "iata" is required (e.g. ?iata=EK502).' });
    }

    try {
        const flightStatus = await fetchFlightStatus(iata.toUpperCase());
        res.json(flightStatus);
    } catch (err) {
        logger.error(`[WarRoomRoute] Flight status error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

export default router;
