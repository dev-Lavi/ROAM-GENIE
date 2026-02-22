/**
 * Passport / Visa Service
 *
 * Loads the passport-index CSV dataset and exposes helpers to:
 *  - Find visa-free destinations for a given passport country
 *  - Get the built-in comprehensive fallback dataset
 *  - Get country flag emojis
 */
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import logger from '../utils/logger.js';

// ─── Fallback hard-coded visa dataset ────────────────────────────────────────

const FALLBACK_VISA_DATA = {
    India: {
        visa_free: [
            'Bhutan', 'Nepal', 'Maldives', 'Mauritius', 'Seychelles', 'Fiji',
            'Vanuatu', 'Micronesia', 'Samoa', 'Cook Islands', 'Niue', 'Tuvalu',
            'Indonesia', 'Thailand', 'Malaysia', 'Singapore', 'Philippines',
            'Cambodia', 'Laos', 'Myanmar', 'Sri Lanka', 'Bangladesh',
            'South Korea', 'Japan', 'Qatar', 'UAE', 'Oman', 'Kuwait',
            'Bahrain', 'Jordan', 'Iran', 'Armenia', 'Georgia', 'Kazakhstan',
            'Kyrgyzstan', 'Tajikistan', 'Uzbekistan', 'Mongolia', 'Turkey',
            'Serbia', 'Albania', 'North Macedonia', 'Bosnia and Herzegovina',
            'Montenegro', 'Moldova', 'Belarus', 'Madagascar', 'Comoros',
            'Cape Verde', 'Guinea-Bissau', 'Mozambique', 'Zimbabwe', 'Zambia',
            'Uganda', 'Rwanda', 'Burundi', 'Tanzania', 'Kenya', 'Ethiopia',
            'Djibouti', 'Somalia', 'Sudan', 'Egypt', 'Morocco', 'Tunisia',
            'Barbados', 'Dominica', 'Grenada', 'Haiti', 'Jamaica',
            'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
            'Trinidad and Tobago', 'El Salvador', 'Honduras', 'Nicaragua',
            'Bolivia', 'Ecuador', 'Suriname',
        ],
    },
    'United States': {
        visa_free: [
            'Canada', 'Mexico', 'United Kingdom', 'Ireland', 'France', 'Germany',
            'Italy', 'Spain', 'Netherlands', 'Belgium', 'Luxembourg', 'Austria',
            'Switzerland', 'Portugal', 'Greece', 'Denmark', 'Sweden', 'Norway',
            'Finland', 'Iceland', 'Estonia', 'Latvia', 'Lithuania', 'Poland',
            'Czech Republic', 'Slovakia', 'Hungary', 'Slovenia', 'Croatia',
            'Malta', 'Cyprus', 'Japan', 'South Korea', 'Singapore', 'Australia',
            'New Zealand', 'Chile', 'Uruguay', 'Argentina', 'Brazil', 'Israel',
            'Taiwan', 'Hong Kong', 'Macau', 'Brunei', 'Malaysia', 'Thailand',
        ],
    },
    Germany: {
        visa_free: [
            'European Union Countries', 'United States', 'Canada', 'Australia',
            'New Zealand', 'Japan', 'South Korea', 'Singapore', 'Malaysia',
            'Thailand', 'Philippines', 'Indonesia', 'Vietnam', 'Cambodia',
            'Israel', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain',
            'Chile', 'Argentina', 'Brazil', 'Uruguay', 'Paraguay', 'Mexico',
            'Costa Rica', 'Nicaragua', 'Honduras', 'El Salvador', 'Guatemala',
            'Panama', 'Colombia', 'Ecuador', 'Peru', 'Bolivia', 'Venezuela',
            'Guyana', 'Suriname', 'South Africa', 'Botswana', 'Namibia',
            'Mauritius', 'Seychelles', 'Morocco', 'Tunisia', 'Turkey',
            'Serbia', 'Montenegro', 'Albania', 'North Macedonia', 'Bosnia and Herzegovina',
        ],
    },
    Singapore: {
        visa_free: [
            'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam',
            'Cambodia', 'Laos', 'Myanmar', 'Brunei', 'Japan', 'South Korea',
            'Hong Kong', 'Macau', 'Taiwan', 'United States', 'Canada',
            'United Kingdom', 'Ireland', 'European Union Countries',
            'Australia', 'New Zealand', 'Chile', 'Argentina', 'Brazil',
            'Uruguay', 'Israel', 'Turkey', 'United Arab Emirates', 'Qatar',
            'Kuwait', 'Bahrain', 'Oman', 'Saudi Arabia', 'Jordan',
        ],
    },
    'United Kingdom': {
        visa_free: [
            'European Union Countries', 'United States', 'Canada', 'Australia',
            'New Zealand', 'Japan', 'South Korea', 'Singapore', 'Malaysia',
            'Thailand', 'Philippines', 'Indonesia', 'Vietnam', 'Hong Kong',
            'Macau', 'Taiwan', 'Israel', 'United Arab Emirates', 'Qatar',
            'Kuwait', 'Bahrain', 'Oman', 'Chile', 'Argentina', 'Brazil',
            'Uruguay', 'Mexico', 'Costa Rica', 'Panama', 'Colombia',
            'Ecuador', 'Peru', 'Bolivia', 'Venezuela', 'Guyana', 'Suriname',
        ],
    },
};

// ─── Country flag emoji map ───────────────────────────────────────────────────

export const COUNTRY_FLAGS = {
    Thailand: '🇹🇭', Singapore: '🇸🇬', Malaysia: '🇲🇾', Indonesia: '🇮🇩',
    Philippines: '🇵🇭', Cambodia: '🇰🇭', Laos: '🇱🇦', Myanmar: '🇲🇲',
    Vietnam: '🇻🇳', Brunei: '🇧🇳', Nepal: '🇳🇵', Bhutan: '🇧🇹',
    Maldives: '🇲🇻', 'Sri Lanka': '🇱🇰', Bangladesh: '🇧🇩', India: '🇮🇳',
    Japan: '🇯🇵', 'South Korea': '🇰🇷', China: '🇨🇳', Taiwan: '🇹🇼',
    'Hong Kong': '🇭🇰', Macau: '🇲🇴', Mongolia: '🇲🇳', Kazakhstan: '🇰🇿',
    Kyrgyzstan: '🇰🇬', Tajikistan: '🇹🇯', Uzbekistan: '🇺🇿',

    UAE: '🇦🇪', Qatar: '🇶🇦', Oman: '🇴🇲', Kuwait: '🇰🇼',
    Bahrain: '🇧🇭', 'Saudi Arabia': '🇸🇦', Jordan: '🇯🇴', Lebanon: '🇱🇧',
    Syria: '🇸🇾', Iraq: '🇮🇶', Iran: '🇮🇷', Israel: '🇮🇱',
    Turkey: '🇹🇷', Cyprus: '🇨🇾', Armenia: '🇦🇲', Georgia: '🇬🇪',

    'United Kingdom': '🇬🇧', Ireland: '🇮🇪', France: '🇫🇷', Germany: '🇩🇪',
    Italy: '🇮🇹', Spain: '🇪🇸', Portugal: '🇵🇹', Netherlands: '🇳🇱',
    Belgium: '🇧🇪', Luxembourg: '🇱🇺', Switzerland: '🇨🇭', Austria: '🇦🇹',
    Denmark: '🇩🇰', Sweden: '🇸🇪', Norway: '🇳🇴', Finland: '🇫🇮',
    Iceland: '🇮🇸', Greece: '🇬🇷', Malta: '🇲🇹', Poland: '🇵🇱',
    'Czech Republic': '🇨🇿', Slovakia: '🇸🇰', Hungary: '🇭🇺',
    Slovenia: '🇸🇮', Croatia: '🇭🇷', 'Bosnia and Herzegovina': '🇧🇦',
    Serbia: '🇷🇸', Montenegro: '🇲🇪', Albania: '🇦🇱',
    'North Macedonia': '🇲🇰', Bulgaria: '🇧🇬', Romania: '🇷🇴',
    Moldova: '🇲🇩', Ukraine: '🇺🇦', Belarus: '🇧🇾', Russia: '🇷🇺',
    Estonia: '🇪🇪', Latvia: '🇱🇻', Lithuania: '🇱🇹',

    'United States': '🇺🇸', Canada: '🇨🇦', Mexico: '🇲🇽', Guatemala: '🇬🇹',
    Belize: '🇧🇿', 'El Salvador': '🇸🇻', Honduras: '🇭🇳', Nicaragua: '🇳🇮',
    'Costa Rica': '🇨🇷', Panama: '🇵🇦', Colombia: '🇨🇴', Venezuela: '🇻🇪',
    Guyana: '🇬🇾', Suriname: '🇸🇷', Brazil: '🇧🇷', Ecuador: '🇪🇨',
    Peru: '🇵🇪', Bolivia: '🇧🇴', Paraguay: '🇵🇾', Uruguay: '🇺🇾',
    Argentina: '🇦🇷', Chile: '🇨🇱', Cuba: '🇨🇺', Jamaica: '🇯🇲',
    Haiti: '🇭🇹', 'Dominican Republic': '🇩🇴', 'Trinidad and Tobago': '🇹🇹',
    Barbados: '🇧🇧', 'Saint Lucia': '🇱🇨', Grenada: '🇬🇩',
    'Saint Vincent and the Grenadines': '🇻🇨',
    'Saint Kitts and Nevis': '🇰🇳', Dominica: '🇩🇲',

    Morocco: '🇲🇦', Algeria: '🇩🇿', Tunisia: '🇹🇳', Libya: '🇱🇾',
    Egypt: '🇪🇬', Sudan: '🇸🇩', Ethiopia: '🇪🇹', Kenya: '🇰🇪',
    Uganda: '🇺🇬', Tanzania: '🇹🇿', Rwanda: '🇷🇼', Burundi: '🇧🇮',
    Somalia: '🇸🇴', Djibouti: '🇩🇯', Madagascar: '🇲🇬', Mauritius: '🇲🇺',
    Seychelles: '🇸🇨', Comoros: '🇰🇲', 'South Africa': '🇿🇦',
    Namibia: '🇳🇦', Botswana: '🇧🇼', Zimbabwe: '🇿🇼', Zambia: '🇿🇲',
    Mozambique: '🇲🇿', Malawi: '🇲🇼', Angola: '🇦🇴', Ghana: '🇬🇭',
    Nigeria: '🇳🇬', Senegal: '🇸🇳', 'Cape Verde': '🇨🇻', 'Guinea-Bissau': '🇬🇼',

    Australia: '🇦🇺', 'New Zealand': '🇳🇿', Fiji: '🇫🇯',
    'Papua New Guinea': '🇵🇬', Vanuatu: '🇻🇺', Samoa: '🇼🇸',
    Tonga: '🇹🇴', Tuvalu: '🇹🇻', Micronesia: '🇫🇲',
    'Cook Islands': '🇨🇰', Niue: '🇳🇺',
};

// ─── Region lists ────────────────────────────────────────────────────────────

export const REGIONS = {
    Asia: [
        'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines',
        'Cambodia', 'Laos', 'Myanmar', 'Vietnam', 'Brunei', 'Nepal', 'Bhutan',
        'South Korea', 'Japan', 'Mongolia', 'Kazakhstan', 'Kyrgyzstan',
        'Tajikistan', 'Uzbekistan',
    ],
    Europe: [
        'Germany', 'France', 'Italy', 'Spain', 'United Kingdom', 'Ireland',
        'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Portugal',
        'Greece', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Iceland',
        'Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Slovenia',
        'Croatia', 'Serbia', 'Montenegro', 'Albania', 'North Macedonia',
        'Bosnia and Herzegovina', 'Bulgaria', 'Romania', 'Moldova', 'Belarus',
    ],
    'Middle East': [
        'UAE', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'Saudi Arabia',
        'Jordan', 'Turkey', 'Armenia', 'Georgia', 'Iran', 'Israel',
    ],
    Africa: [
        'Mauritius', 'Seychelles', 'Madagascar', 'Comoros', 'Cape Verde',
        'Guinea-Bissau', 'Mozambique', 'Zimbabwe', 'Zambia', 'Uganda',
        'Rwanda', 'Burundi', 'Tanzania', 'Kenya', 'Ethiopia', 'Djibouti',
        'Somalia', 'Sudan', 'Egypt', 'Morocco', 'Tunisia', 'South Africa',
        'Namibia', 'Botswana',
    ],
    Americas: [
        'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina',
        'Chile', 'Uruguay', 'Paraguay', 'Colombia', 'Ecuador', 'Peru',
        'Bolivia', 'Venezuela', 'Guyana', 'Suriname', 'Jamaica', 'Haiti',
        'Barbados', 'Trinidad and Tobago', 'Dominica', 'Grenada',
        'Saint Lucia', 'Saint Vincent and the Grenadines',
        'Saint Kitts and Nevis', 'El Salvador', 'Honduras', 'Nicaragua',
    ],
    Oceania: [
        'Australia', 'New Zealand', 'Fiji', 'Vanuatu', 'Samoa', 'Tonga',
        'Cook Islands', 'Niue', 'Tuvalu', 'Micronesia', 'Papua New Guinea',
    ],
};

// ─── Module-level cached visa records ────────────────────────────────────────

let cachedRecords = null; // Array<{ Passport, Destination, Requirement }>
let cachedPassports = null;

/**
 * Load the passport-index CSV from GitHub (with fallback to built-in data).
 * Results are cached in memory for the lifetime of the process.
 *
 * @returns {Promise<Array<{Passport:string, Destination:string, Requirement:string}>>}
 */
async function loadVisaRecords() {
    if (cachedRecords) return cachedRecords;

    const urls = [
        process.env.PASSPORT_DATASET_URL ||
        'https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/passport-index-tidy.csv',
        'https://raw.githubusercontent.com/datasets/passport-index/main/data/passport-index-tidy.csv',
    ];

    for (const url of urls) {
        try {
            logger.info(`[PassportService] Fetching visa dataset from ${url}`);
            const { data } = await axios.get(url, { timeout: 15_000, responseType: 'text' });
            cachedRecords = parse(data, { columns: true, skip_empty_lines: true, trim: true });
            logger.info(`[PassportService] Loaded ${cachedRecords.length} visa records`);
            return cachedRecords;
        } catch (err) {
            logger.warn(`[PassportService] Failed to load from ${url}: ${err.message}`);
        }
    }

    // Fallback: convert hardcoded data to flat records
    logger.warn('[PassportService] Using built-in fallback visa dataset');
    cachedRecords = [];
    for (const [passport, { visa_free }] of Object.entries(FALLBACK_VISA_DATA)) {
        for (const dest of visa_free) {
            cachedRecords.push({ Passport: passport, Destination: dest, Requirement: 'visa free' });
        }
    }
    return cachedRecords;
}

/**
 * Return a sorted list of all unique passport countries in the dataset.
 * @returns {Promise<string[]>}
 */
export async function getAvailablePassports() {
    if (cachedPassports) return cachedPassports;
    const records = await loadVisaRecords();
    cachedPassports = [...new Set(records.map((r) => r.Passport))].sort();
    return cachedPassports;
}

/**
 * Return visa-free (and visa-on-arrival) destinations for the given passport.
 *
 * @param {string} passportCountry
 * @returns {Promise<{ countries: string[], regionBreakdown: object }>}
 */
export async function getVisaFreeCountries(passportCountry) {
    const records = await loadVisaRecords();
    const lower = passportCountry.trim().toLowerCase();

    const vfRecords = records.filter(
        (r) =>
            r.Passport?.trim().toLowerCase() === lower &&
            /visa[\s-]?free|visa on arrival/i.test(r.Requirement),
    );

    // Broader search if nothing found
    const finalRecords =
        vfRecords.length > 0
            ? vfRecords
            : records.filter(
                (r) =>
                    r.Passport?.toLowerCase().includes(lower) &&
                    /visa[\s-]?free|visa on arrival/i.test(r.Requirement),
            );

    const countries = [
        ...new Set(finalRecords.map((r) => r.Destination?.trim()).filter(Boolean)),
    ].sort();

    // Regional breakdown counts
    const regionBreakdown = {};
    for (const [region, regionCountries] of Object.entries(REGIONS)) {
        regionBreakdown[region] = countries.filter((c) => regionCountries.includes(c)).length;
    }

    logger.info(
        `[PassportService] ${countries.length} visa-free destinations found for "${passportCountry}"`,
    );
    return { countries, regionBreakdown };
}
