# RoamGenie Backend — Node.js / Express

> AI-Powered Travel Planner backend converted from Python/Streamlit to Node.js/Express.

---

## 📁 Project Structure

```
backend_node/
├── .env                        # Environment variables (copy from .env.example)
├── package.json
├── src/
│   ├── server.js               # Express app entry point
│   ├── routes/
│   │   ├── travel.js           # POST /api/travel/plan
│   │   ├── passport.js         # POST /api/passport/scan  |  POST /api/passport/visa-free
│   │   ├── ivr.js              # POST /api/ivr/call
│   │   ├── contact.js          # POST /api/contact/submit
│   │   └── emergency.js        # POST /api/emergency/flight-cancellation
│   │                           # POST /api/emergency/offline-fallback
│   ├── services/
│   │   ├── geminiService.js    # Google Gemini AI agents (Researcher, Planner, Hotels)
│   │   ├── flightService.js    # SerpAPI Google Flights integration
│   │   ├── passportService.js  # CSV visa dataset + visa-free country lookup
│   │   ├── ocrService.js       # Tesseract.js passport image scanning
│   │   └── twilioService.js    # Twilio voice calls + WhatsApp messages
│   └── utils/
│       └── logger.js           # Winston logger
└── logs/                       # Auto-created on first run
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Edit `.env` and add your real API keys:

| Variable | Description |
|---|---|
| `GOOGLE_API_KEY` | Google Gemini API key |
| `SERPAPI_KEY` | SerpAPI key for flight & attraction search |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Twilio outbound phone number (E.164) |
| `TWILIO_WHATSAPP` | Twilio WhatsApp sandbox number |
| `N8N_WEBHOOK_URL` | n8n cloud webhook URL for IVR |
| `VENDASTA_CRM_URL` | Vendasta automation webhook URL |
| `PORT` | Server port (default: 3000) |

### 3. Run in development mode

```bash
npm run dev
```

### 4. Run in production

```bash
npm start
```

---

## 📡 API Reference

### `GET /health`
Returns service health status.

---

### `POST /api/travel/plan`
Generates a full AI travel plan.

**Body:**
```json
{
  "source": "BOM",
  "destination": "BKK",
  "departureDate": "2025-03-15",
  "returnDate": "2025-03-20",
  "numDays": 5,
  "travelTheme": "Couple Getaway",
  "activityPreferences": "Beaches and temples",
  "budget": "Standard",
  "flightClass": "Economy",
  "hotelRating": "4",
  "passportCountry": "India",
  "visaFreeCountries": ["Thailand", "Singapore"]
}
```

**Response:**
```json
{
  "visaStatus": "Visa-Free",
  "destinationCountry": "Thailand",
  "flights": [...],
  "researchResults": "...",
  "hotelRestaurantResults": "...",
  "itinerary": "..."
}
```

---

### `POST /api/passport/scan`
Scan a passport image to detect country and find visa-free destinations.

**Body:** `multipart/form-data` with field `image` (JPG/PNG/WEBP ≤ 10 MB)

**Response:**
```json
{
  "country": "India",
  "confidence": 0.8,
  "visaFreeCountries": ["Thailand", "Nepal", ...],
  "regionBreakdown": { "Asia": 15, "Europe": 3, ... },
  "flags": { "Thailand": "🇹🇭", ... }
}
```

---

### `POST /api/passport/visa-free`
Get visa-free countries for a manually selected passport country.

**Body:** `{ "country": "India" }`

---

### `GET /api/passport/countries`
Get a list of all available passport countries from the dataset.

---

### `POST /api/ivr/call`
Initiate an IVR call via n8n webhook.

**Body:** `{ "toNumber": "+919876543210" }`

---

### `POST /api/contact/submit`
Submit contact info to the Vendasta CRM.

**Body:** `{ "firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "+919876543210" }`

---

### `POST /api/emergency/flight-cancellation`
Send a WhatsApp flight cancellation alert.

**Body:** `{ "whatsappNumber": "+919876543210" }`

---

### `POST /api/emergency/offline-fallback`
Send a WhatsApp offline fallback message.

**Body:** `{ "whatsappNumber": "+919876543210" }`

---

## 🔄 Python → Node.js Feature Mapping

| Python Feature | Node.js Equivalent |
|---|---|
| `streamlit` | Express.js REST API |
| `agno.agent.Agent` | `geminiService.js` (runResearcher / runPlanner / runHotelRestaurantFinder) |
| `agno.models.google.Gemini` | `@google/generative-ai` SDK |
| `SerpApiTools` | `axios` → `serpapi.com/search.json` (Google Flights engine) |
| `pytesseract` + OpenCV | `tesseract.js` (pure JS, no binary needed) |
| `pandas` CSV | `csv-parse` |
| `twilio.rest.Client` | `twilio` npm package |
| `requests.post` | `axios` |
| `st.session_state` | Client-side state (returned in JSON responses) |
| `st.secrets` | `.env` + `dotenv` |
