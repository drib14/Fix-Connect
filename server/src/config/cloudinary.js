const crypto = require('crypto');

/**
 * Uploads a base64 image string directly to Cloudinary using their REST API.
 * @param {string} base64Data - The image data (e.g. data:image/png;base64,...)
 * @param {string} folder - The destination folder in Cloudinary
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = async (base64Data, folder = 'fixconnect') => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables are not configured');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  // Generate signature
  // Cloudinary signature requires sorting the parameters alphabetically, 
  // joining with '&' and appending the API secret.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  const bodyData = {
    file: base64Data,
    api_key: apiKey,
    timestamp: timestamp.toString(),
    folder: folder,
    signature: signature,
  };

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

  const result = await response.json();

  if (!response.ok || result.error) {
    console.error('Cloudinary upload error:', result.error);
    throw new Error(result.error ? result.error.message : 'Failed to upload to Cloudinary');
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

module.exports = {
  uploadToCloudinary,
};
