/**
 * Passport Routes  –  /api/passport
 *
 * POST /api/passport/scan
 *   multipart/form-data: image (file)
 *   Response: { country, confidence, visaFreeCountries, regionBreakdown, flags }
 *
 * POST /api/passport/visa-free
 *   Body: { country: string }
 *   Response: { country, visaFreeCountries, regionBreakdown, flags, availablePassports }
 *
 * GET  /api/passport/countries
 *   Response: { countries: string[] }
 */
import { Router } from 'express';
import multer from 'multer';
import { extractPassportInfo } from '../services/ocrService.js';
import {
    getVisaFreeCountries,
    getAvailablePassports,
    COUNTRY_FLAGS,
} from '../services/passportService.js';
import logger from '../utils/logger.js';

const router = Router();

// Store uploads in memory (no disk I/O needed)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        if (/^image\/(jpeg|png|jpg|webp)$/.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG and WEBP images are accepted'), false);
        }
    },
});

// ─── POST /api/passport/scan ──────────────────────────────────────────────────
router.post('/scan', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded. Use field name "image".' });
        }

        logger.info(`[PassportRoute] Scanning passport image (${req.file.size} bytes)`);

        const passportInfo = await extractPassportInfo(req.file.buffer);

        if (!passportInfo) {
            return res.status(422).json({
                error: 'Could not extract passport information. Please try a clearer image.',
            });
        }

        const { countries, regionBreakdown } = await getVisaFreeCountries(passportInfo.country);

        const flags = {};
        countries.forEach((c) => { flags[c] = COUNTRY_FLAGS[c] ?? ''; });

        res.json({
            country: passportInfo.country,
            confidence: passportInfo.confidence,
            visaFreeCountries: countries,
            regionBreakdown,
            flags,
        });
    } catch (err) {
        logger.error(`[PassportRoute] Scan error: ${err.message}`);
        if (err.message.includes('Only JPG')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/passport/visa-free ────────────────────────────────────────────
router.post('/visa-free', async (req, res) => {
    try {
        const { country } = req.body;
        if (!country || typeof country !== 'string') {
            return res.status(400).json({ error: 'Field "country" (string) is required.' });
        }

        logger.info(`[PassportRoute] Finding visa-free countries for: ${country}`);
        const { countries, regionBreakdown } = await getVisaFreeCountries(country);

        const flags = {};
        countries.forEach((c) => { flags[c] = COUNTRY_FLAGS[c] ?? ''; });

        const availablePassports = await getAvailablePassports();

        res.json({
            country,
            visaFreeCountries: countries,
            regionBreakdown,
            flags,
            availablePassports,
        });
    } catch (err) {
        logger.error(`[PassportRoute] Visa-free lookup error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/passport/countries ─────────────────────────────────────────────
router.get('/countries', async (_req, res) => {
    try {
        const countries = await getAvailablePassports();
        res.json({ countries });
    } catch (err) {
        logger.error(`[PassportRoute] Countries fetch error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

export default router;
