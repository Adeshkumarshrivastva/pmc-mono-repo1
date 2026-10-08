// WhatsApp OTP delivery — same Chatboat account/template as apps/server's
// lib/whatsapp.ts (`verify_user_otp`). Added as a second delivery channel
// alongside SMS (see otp.js) because the SMS gateway can silently reject a
// message (DLT template mismatch, provider-side block, etc.) with no visible
// error — apps/server already covers for this by sending both SMS and
// WhatsApp on every OTP; this app only ever sent SMS, so a flaky SMS gateway
// meant academy users never got an OTP at all while everyone else still got
// theirs via WhatsApp.

async function sendWhatsappOtp({ phone, otp }) {
  const { WHATSAPP_API_KEY_SECRET, WHATSAPP_LICENCE_NUMBER_SECRET, WHATSAPP_TEST_NUMBER_SECRET } = process.env;
  if (!WHATSAPP_API_KEY_SECRET || !WHATSAPP_LICENCE_NUMBER_SECRET) {
    return null; // not configured — SMS-only fallback in otp.js still applies
  }

  const isDevelopment = process.env.NODE_ENV !== 'production';
  const params = new URLSearchParams({
    LicenseNumber: WHATSAPP_LICENCE_NUMBER_SECRET,
    APIKey: WHATSAPP_API_KEY_SECRET,
    Contact: isDevelopment && WHATSAPP_TEST_NUMBER_SECRET ? WHATSAPP_TEST_NUMBER_SECRET : phone,
    Template: 'verify_user_otp',
    Param: otp,
    URLParam: otp,
    Button: '',
  });

  try {
    const res = await fetch(`https://app.chatboat.in/api/sendtemplate.php?${params}`);
    const result = await res.json();
    console.log(`[OTP][WhatsApp] ${phone} ->`, result);
    return result;
  } catch (err) {
    console.error('OTP WhatsApp send failed:', err.message);
    return null;
  }
}

module.exports = { sendWhatsappOtp };
