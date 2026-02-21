/** Partial IATA → City name mapping (expand as needed) */
const IATA_MAP = {
    // India
    DEL: 'Delhi', BOM: 'Mumbai', BLR: 'Bengaluru',
    MAA: 'Chennai', CCU: 'Kolkata', HYD: 'Hyderabad',
    COK: 'Kochi', GOI: 'Goa', AMD: 'Ahmedabad',
    PNQ: 'Pune', JAI: 'Jaipur', LKO: 'Lucknow',
    ATQ: 'Amritsar', IXC: 'Chandigarh', VTZ: 'Vizag',
    BBI: 'Bhubaneswar', GAU: 'Guwahati', TRV: 'Thiruvananthapuram',
    // International
    DXB: 'Dubai', AUH: 'Abu Dhabi', SIN: 'Singapore',
    KUL: 'Kuala Lumpur', BKK: 'Bangkok', HKG: 'Hong Kong',
    NRT: 'Tokyo', ICN: 'Seoul', PEK: 'Beijing',
    PVG: 'Shanghai', SYD: 'Sydney', MEL: 'Melbourne',
    LHR: 'London', CDG: 'Paris', FRA: 'Frankfurt',
    AMS: 'Amsterdam', ZRH: 'Zurich', FCO: 'Rome',
    BCN: 'Barcelona', MAD: 'Madrid', IST: 'Istanbul',
    JFK: 'New York', LAX: 'Los Angeles', ORD: 'Chicago',
    SFO: 'San Francisco', MIA: 'Miami', YYZ: 'Toronto',
    GRU: 'São Paulo', EZE: 'Buenos Aires', JNB: 'Johannesburg',
    NBO: 'Nairobi', CAI: 'Cairo', CMN: 'Casablanca',
};

export default IATA_MAP;

export const getCity = (code) =>
    IATA_MAP[code?.toUpperCase()] || code?.toUpperCase() || 'Unknown';
