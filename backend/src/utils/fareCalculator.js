/**
 * Fare Calculation Engine for FixConnect
 * Models pricing similar to ride-hailing with base fare + distance + platform fee.
 */

const PLATFORM_FEE_PERCENTAGE = 0.15; // 15% platform commission
const DISTANCE_RATE_PER_KM = 15; // PHP 15 per km beyond 2km radius
const FREE_DISTANCE_KM = 2;
const MINIMUM_FARE = 150; // PHP 150 minimum

/**
 * Calculate fare breakdown for a booking.
 * @param {number} baseRate - Service base rate from Service model
 * @param {number} distanceKm - Distance between user and nearest provider cluster (approx)
 * @returns {{ baseFare, distanceFee, platformFee, totalAmount }}
 */
function calculateFare(baseRate, distanceKm = 0) {
  const baseFare = Math.max(baseRate, MINIMUM_FARE);

  // Distance surcharge only applies beyond the free radius
  const chargeableDistance = Math.max(0, distanceKm - FREE_DISTANCE_KM);
  const distanceFee = Math.round(chargeableDistance * DISTANCE_RATE_PER_KM);

  const subtotal = baseFare + distanceFee;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENTAGE);
  const totalAmount = subtotal + platformFee;

  return {
    baseFare,
    distanceFee,
    platformFee,
    totalAmount,
  };
}

module.exports = { calculateFare };
