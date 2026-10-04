// Phone OTP helpers — generation + delivery.
//
// Real delivery uses the same SMS gateway account as pmc-ambassador / the
// pmc-mono-repo server (SMS_UNAME/SMS_PASS/SMS_SENDER_ID/SMS_API_BASE_URL in
// backend/.env). The message text is kept byte-for-byte identical on purpose
// — Indian carriers reject SMS whose content doesn't match the sender ID's
// DLT-registered template, so changing the wording here (even just the
// branding) can make messages silently vanish instead of failing loudly.
//
// PRP migrated off the old gateway (which used /API/SendMsg.aspx). The new
// non-White-Label endpoint keeps the same uname/pass/send/dest/msg params but
// lives at a different path — see apps/server/src/lib/sms.ts in this repo for
// the equivalent server-side implementation. It also always answers HTTP 200:
// JSON `{ isSuccess, returnMessage }` when it accepts the message, and a bare
// error string (e.g. "incorrect username or password") when it doesn't. So
// `response.ok` alone can't tell success from failure — the body has to be
// parsed.
//
// If the gateway env vars aren't set, or the gateway call itself fails, OTPs
// fall back to being logged to the server console only (never shown in the
// UI) so the login flow still works end-to-end without a live/working
// gateway — check this process's terminal output for `[OTP] <phone> → <code>`.

const SMS_API_URL = 'https://api.bulksmsadmin.com/BulkSMSapi/keyApiSendSMS/SendMsg';

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

function parseGatewayResponse(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

async function sendOtpMessage({ phone, otp }) {
  console.log(`[OTP] ${phone} → ${otp}`);

  const { SMS_UNAME, SMS_PASS, SMS_SENDER_ID } = process.env;
  if (!SMS_UNAME || !SMS_PASS || !SMS_SENDER_ID) {
    return { sent: true, devMode: true }; // no gateway configured — dev/demo fallback
  }

  const params = new URLSearchParams({
    uname: SMS_UNAME,
    pass: SMS_PASS,
    send: SMS_SENDER_ID,
    dest: phone,
    msg: `Dear customer, your OTP for registration is ${otp} Use this OTP to validate your login.\nPSTVMC`,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${SMS_API_URL}?${params}`, { signal: controller.signal });
    const body = await res.text();
    const result = parseGatewayResponse(body);

    if (!res.ok || !result?.isSuccess) {
      console.error(`OTP send failed (http ${res.status}): ${body}`);
      // Gateway is configured but rejected/misbehaved — fall back to dev mode
      // rather than blocking sign-in entirely; the OTP above still works.
      return { sent: true, devMode: true };
    }
    return { sent: true, devMode: false };
  } catch (err) {
    console.error('OTP send failed:', err.message);
    return { sent: true, devMode: true };
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = { generateOtp, sendOtpMessage };
