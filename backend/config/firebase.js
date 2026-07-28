const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let firebaseApp = null;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    // Priority 1: JSON string in environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      );
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("[Firebase Admin]: Initialized from env JSON");
      return firebaseApp;
    }

    // Priority 2: Service account key file path
    const keyPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.join(__dirname, "../firebase-service-account.json");

    if (fs.existsSync(keyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log(`[Firebase Admin]: Initialized from file ${keyPath}`);
      return firebaseApp;
    }

    console.warn(
      "[Firebase Admin]: No credentials found. Set FIREBASE_SERVICE_ACCOUNT_JSON env var or place firebase-service-account.json in project root."
    );
    return null;
  } catch (error) {
    console.error(`[Firebase Admin Error]: ${error.message}`);
    return null;
  }
};

// Initialize on module load
initFirebase();

module.exports = admin;
