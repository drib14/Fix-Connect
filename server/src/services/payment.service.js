const getPaymongoAuthHeader = () => {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Paymongo Secret Key is not configured in environment variables');
  }
  // Paymongo requires basic auth with the secret key as username and empty password
  return 'Basic ' + Buffer.from(secretKey + ':').toString('base64');
};

/**
 * Creates a Payment Intent with Paymongo
 * @param {number} amount - Amount in pesos
 * @param {string} description - Description of the charge
 * @returns {Promise<object>} - Paymongo Payment Intent object
 */
const createPaymentIntent = async (amount, description = 'Fix-Connect Service Booking') => {
  const url = 'https://api.paymongo.com/v1/payment_intents';
  const authHeader = getPaymongoAuthHeader();
  
  // Convert amount from Pesos to Centavos (PHP requires amount in cents)
  const amountInCentavos = Math.round(amount * 100);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amountInCentavos,
          payment_method_allowed: ['gcash', 'paymaya', 'card'],
          currency: 'PHP',
          description,
        },
      },
    }),
  });

  const result = await response.json();

  if (!response.ok || result.errors) {
    console.error('Paymongo create intent error:', result.errors);
    throw new Error(result.errors ? result.errors[0].detail : 'Failed to create payment intent');
  }

  return result.data;
};

/**
 * Creates a Payment Method with Paymongo
 * @param {string} type - 'gcash', 'paymaya', or 'card'
 * @param {object} details - Card details or other parameters if needed
 * @returns {Promise<object>} - Paymongo Payment Method object
 */
const createPaymentMethod = async (type, details = {}) => {
  const url = 'https://api.paymongo.com/v1/payment_methods';
  const authHeader = getPaymongoAuthHeader();

  const attributes = { type };
  if (type === 'card' && details.card) {
    attributes.details = {
      card_number: details.card.cardNumber,
      exp_month: parseInt(details.card.expMonth, 10),
      exp_year: parseInt(details.card.expYear, 10),
      cvc: details.card.cvc,
    };
  }

  if (details.billing) {
    attributes.billing = {
      name: details.billing.name,
      email: details.billing.email,
      phone: details.billing.phone,
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({
      data: {
        attributes,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok || result.errors) {
    console.error('Paymongo create method error:', result.errors);
    throw new Error(result.errors ? result.errors[0].detail : 'Failed to create payment method');
  }

  return result.data;
};

/**
 * Attaches a Payment Method to a Payment Intent
 * @param {string} intentId - Payment Intent ID
 * @param {string} methodId - Payment Method ID
 * @param {string} clientKey - Client Key from Payment Intent
 * @returns {Promise<object>} - Updated Payment Intent object with next steps
 */
const attachPaymentMethod = async (intentId, methodId, clientKey) => {
  const url = `https://api.paymongo.com/v1/payment_intents/${intentId}/attach`;
  const authHeader = getPaymongoAuthHeader();
  
  // Custom return URL redirects user after e-wallet auth
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const returnUrl = `${clientUrl}/bookings`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          payment_method: methodId,
          client_key: clientKey,
          return_url: returnUrl,
        },
      },
    }),
  });

  const result = await response.json();

  if (!response.ok || result.errors) {
    console.error('Paymongo attach payment error:', result.errors);
    throw new Error(result.errors ? result.errors[0].detail : 'Failed to attach payment method');
  }

  return result.data;
};

/**
 * Retreive details of a Payment Intent
 * @param {string} intentId - Payment Intent ID
 * @returns {Promise<object>} - Paymongo Payment Intent object
 */
const getPaymentIntent = async (intentId) => {
  const url = `https://api.paymongo.com/v1/payment_intents/${intentId}`;
  const authHeader = getPaymongoAuthHeader();

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
    },
  });

  const result = await response.json();

  if (!response.ok || result.errors) {
    throw new Error(result.errors ? result.errors[0].detail : 'Failed to retrieve payment intent');
  }

  return result.data;
};

module.exports = {
  createPaymentIntent,
  createPaymentMethod,
  attachPaymentMethod,
  getPaymentIntent,
};
