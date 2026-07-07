/**
 * OTP Generator for booking verification codes.
 * Generates a 4-digit numeric code for provider arrival verification.
 */
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generate6DigitOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { generateOTP, generate6DigitOTP };
