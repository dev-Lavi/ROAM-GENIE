/**
 * Twilio Service
 * Wraps the Twilio REST client for:
 *   - Outbound voice calls (IVR TwiML)
 *   - WhatsApp messages (emergency / offline fallback notifications)
 */
import twilio from 'twilio';
import logger from '../utils/logger.js';

let client;

try {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    logger.info('[TwilioService] Twilio client initialized');
} catch (err) {
    logger.error(`[TwilioService] Failed to initialize Twilio client: ${err.message}`);
    client = null;
}

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_WHATSAPP = process.env.TWILIO_WHATSAPP ?? 'whatsapp:+14155238886';

// ─── Voice Calls ──────────────────────────────────────────────────────────────

/**
 * Initiate a TTS voice call to the given number.
 *
 * @param {string} toNumber  - E.164 format (e.g. "+919876543210")
 * @param {string} message   - Text to be read aloud via TwiML <Say>
 * @returns {Promise<{ sid: string }>}
 */
export async function makeVoiceCall(toNumber, message) {
    if (!client) throw new Error('Twilio client not initialized');

    logger.info(`[TwilioService] Initiating voice call to ${toNumber}`);
    const call = await client.calls.create({
        to: toNumber,
        from: TWILIO_PHONE_NUMBER,
        twiml: `<Response><Say>${escapeXml(message)}</Say></Response>`,
    });

    logger.info(`[TwilioService] Call SID: ${call.sid}`);
    return { sid: call.sid };
}

// ─── WhatsApp Messages ────────────────────────────────────────────────────────

/**
 * Send a WhatsApp message via Twilio Sandbox / Business number.
 *
 * @param {string} toWhatsApp  - WhatsApp number (with +country code)
 * @param {string} body        - Message body text
 * @returns {Promise<{ sid: string, status: string }>}
 */
export async function sendWhatsApp(toWhatsApp, body) {
    if (!client) throw new Error('Twilio client not initialized');

    const to = toWhatsApp.startsWith('whatsapp:') ? toWhatsApp : `whatsapp:${toWhatsApp}`;
    logger.info(`[TwilioService] Sending WhatsApp message to ${to}`);

    const message = await client.messages.create({
        from: TWILIO_WHATSAPP,
        to,
        body,
    });

    logger.info(`[TwilioService] WhatsApp SID: ${message.sid}`);
    return { sid: message.sid, status: message.status };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
