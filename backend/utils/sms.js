/**
 * SMS Utility - Placeholder
 * Replace with real SMS provider (e.g., Fast2SMS, MSG91, Twilio)
 *
 * Fast2SMS example:
 *   POST https://www.fast2sms.com/dev/bulkV2
 *   Headers: { authorization: API_KEY }
 *   Body: { route: 'q', message: msg, language: 'english', numbers: mobile }
 */

const sendSms = async (mobile, message) => {
    // ─── PLACEHOLDER ───────────────────────────────────────────
    // In production, replace this block with actual SMS API call.
    console.log(`[SMS] To: ${mobile} | Message: ${message}`);

    // ─── Fast2SMS integration (uncomment & set API key in .env) ─
    // const axios = require('axios');
    // await axios.post(
    //   'https://www.fast2sms.com/dev/bulkV2',
    //   { route: 'q', message, language: 'english', numbers: mobile },
    //   { headers: { authorization: process.env.FAST2SMS_API_KEY } }
    // );

    return { success: true };
};

module.exports = sendSms;
