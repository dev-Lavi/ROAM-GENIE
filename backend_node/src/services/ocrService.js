/**
 * OCR Service
 * Uses tesseract.js to extract text from passport images (in-process, no external binary needed).
 * Mirrors the Python pytesseract + OpenCV pipeline.
 */
import Tesseract from 'tesseract.js';
import logger from '../utils/logger.js';

const COUNTRY_MAPPING = {
    'INDIA': 'India',
    'UNITED STATES OF AMERICA': 'United States',
    'UNITED KINGDOM': 'United Kingdom',
    'GERMANY': 'Germany',
    'FRANCE': 'France',
    'SINGAPORE': 'Singapore',
    'JAPAN': 'Japan',
    'AUSTRALIA': 'Australia',
    'CANADA': 'Canada',
    'NETHERLANDS': 'Netherlands',
    'CHINA': 'China',
    'UAE': 'UAE',
    'SOUTH KOREA': 'South Korea',
    'ITALY': 'Italy',
    'SPAIN': 'Spain',
};

const MRZ_PATTERNS = [
    /REPUBLIC OF ([A-Z\s]+)/,
    /UNITED STATES OF AMERICA/,
    /UNITED KINGDOM/,
    /PASSPORT\s+([A-Z\s]+)/,
    /NATIONALITY\s+([A-Z\s]+)/,
    /COUNTRY CODE\s+([A-Z]{3})/,
];

/**
 * Parse raw OCR text and extract the passport issuing country.
 *
 * @param {string} text - Raw text from Tesseract
 * @returns {{ country: string, confidence: number } | null}
 */
function parsePassportText(text) {
    const upper = text.toUpperCase();

    // Pattern matching
    for (const pattern of MRZ_PATTERNS) {
        const match = upper.match(pattern);
        if (match) {
            const country = (match[1] ?? match[0]).trim();
            if (COUNTRY_MAPPING[country]) {
                return { country: COUNTRY_MAPPING[country], confidence: 0.8 };
            }
        }
    }

    // Keyword scan
    for (const [key, name] of Object.entries(COUNTRY_MAPPING)) {
        if (upper.includes(key)) {
            return { country: name, confidence: 0.6 };
        }
    }

    return null;
}

/**
 * Extract passport country from an uploaded image buffer using Tesseract.js.
 *
 * @param {Buffer} imageBuffer - Raw image data
 * @returns {Promise<{ country: string, confidence: number } | null>}
 */
export async function extractPassportInfo(imageBuffer) {
    try {
        logger.info('[OCRService] Running Tesseract OCR on passport image');

        const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    logger.debug(`[OCRService] Progress: ${(m.progress * 100).toFixed(0)}%`);
                }
            },
            tessedit_pageseg_mode: '6',
        });

        logger.info('[OCRService] OCR complete');
        return parsePassportText(data.text);
    } catch (err) {
        logger.error(`[OCRService] Tesseract error: ${err.message}`);
        throw err;
    }
}
