/**
 * OTP Generator for booking verification codes.
 * Generates a 4-digit numeric code for provider arrival verification.
 */
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

module.exports = { generateOTP };
