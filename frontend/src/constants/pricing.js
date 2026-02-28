// ─── Village Base Prices (₹ per month) ──────────────────────────────────────
export const VILLAGE_PRICES = {
    'Chennai': 250,
    'Karur': 230,
    'Coimbatore': 240,
    'Madurai': 220,
    'Salem': 230,
    'Trichy': 235,
    'Tirunelveli': 220,
    'Erode': 225,
    'Vellore': 225,
    'Thanjavur': 220,
    'Dindigul': 215,
    'Tiruppur': 230,
    'Hosur': 240,
    'Kanchipuram': 235,
    'Ooty': 250,
};

// ─── Subscription Offers ────────────────────────────────────────────────────
// multiplier = how many months you PAY for
// freeMonths  = how many months you GET free
export const OFFERS = [
    { label: '1 Month', months: 1, multiplier: 1, freeMonths: 0 },
    { label: '6 Months', months: 6, multiplier: 5, freeMonths: 1 },
    { label: '1 Year', months: 12, multiplier: 10, freeMonths: 2 },
];

// ─── Amplifier discount ───────────────────────────────────────────────────────
export const AMPLIFIER_DISCOUNT = 50;
