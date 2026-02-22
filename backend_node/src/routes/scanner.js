/**
 * Scanner Routes  –  /api/scanner
 *
 * POST /api/scanner/parse
 *   Body: { text: string, passportCountry?: string, whatsappNumber?: string }
 *   Response: { booking, itinerary, whatsappSummary, whatsappSent }
 *
 * POST /api/scanner/parse-image
 *   Body: multipart with "file" (image), + optional passportCountry, whatsappNumber
 *   Response: { ocrText, booking, itinerary, whatsappSummary, whatsappSent }
 */
import { Router } from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import {
    parseBookingConfirmation,
    generateItineraryFromBooking,
    buildWhatsAppSummary,
} from '../services/scannerService.js';
import { sendWhatsApp } from '../services/twilioService.js';
import logger from '../utils/logger.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Shared core logic ────────────────────────────────────────────────────────
async function processBookingText(rawText, passportCountry, whatsappNumber) {
    // 1. Parse booking details
    const booking = await parseBookingConfirmation(rawText);

    // 2. Generate full day-by-day itinerary in parallel with nothing (only one async call here but keep pattern consistent)
    const itinerary = await generateItineraryFromBooking(booking, passportCountry || null);

    // 3. Build WhatsApp message (includes itinerary snippet)
    const whatsappSummary = buildWhatsAppSummary(booking, itinerary, passportCountry || null);

    // 4. Send via Twilio WhatsApp if number provided
    let whatsappSent = false;
    let whatsappError = null;

    if (whatsappNumber && whatsappNumber.trim()) {
        try {
            logger.info(`[ScannerRoute] Sending WhatsApp via Twilio to ${whatsappNumber}`);
            await sendWhatsApp(whatsappNumber.trim(), whatsappSummary);
            whatsappSent = true;
            logger.info(`[ScannerRoute] ✅ WhatsApp sent successfully to ${whatsappNumber}`);
        } catch (waErr) {
            whatsappError = waErr.message;
            logger.warn(`[ScannerRoute] ⚠️ WhatsApp send failed: ${waErr.message}`);
        }
    }

    return { booking, itinerary, whatsappSummary, whatsappSent, whatsappError };
}

// ─── POST /api/scanner/parse  (text body) ─────────────────────────────────────
router.post('/parse', async (req, res) => {
    try {
        const { text, passportCountry, whatsappNumber } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Field "text" is required.' });
        }

        logger.info('[ScannerRoute] Processing text booking confirmation');
        const result = await processBookingText(text.trim(), passportCountry, whatsappNumber);

        res.json(result);
    } catch (err) {
        logger.error(`[ScannerRoute] Parse error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/scanner/parse-image  (multipart image) ────────────────────────
router.post('/parse-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Send an image as "file" field.' });
        }

        const { passportCountry, whatsappNumber } = req.body;

        logger.info('[ScannerRoute] Running Tesseract OCR on uploaded image');

        // OCR the image
        const { data } = await Tesseract.recognize(req.file.buffer, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    logger.debug(`[ScannerRoute] OCR: ${(m.progress * 100).toFixed(0)}%`);
                }
            },
        });

        const ocrText = data.text?.trim() || '';
        if (!ocrText) {
            return res.status(422).json({ error: 'Could not extract text from the uploaded image.' });
        }

        logger.info('[ScannerRoute] OCR complete — forwarding to Gemini parser');
        const result = await processBookingText(ocrText, passportCountry, whatsappNumber);

        res.json({ ocrText, ...result });
    } catch (err) {
        logger.error(`[ScannerRoute] Image parse error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ error: err.message });
    }
});

export default router;
