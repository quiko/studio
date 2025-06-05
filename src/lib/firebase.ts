
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage"; // Added
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from "firebase/app-check";

// This configuration MUST match the one from your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyBExL4Z4DG4kROgtnoeRV3ACgWGpxMxzA0",
  authDomain: "maestroai-byliq.firebaseapp.com",
  projectId: "maestroai-byliq",
  storageBucket: "maestroai-byliq.appspot.com", // Corrected to .appspot.com for storage
  messagingSenderId: "116231535273",
  appId: "1:116231535273:web:b1d80afe2fecabf14087b8",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage; // Added
let appCheckInstance: AppCheck | undefined;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize App Check on the client side
if (typeof window !== 'undefined') {
  try {
    // Ensure you have these in your .env or .env.local file
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const debugTokenFromEnv = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;

    // Log the values for easier debugging during setup
    // console.log("Firebase Init: NEXT_PUBLIC_RECAPTCHA_SITE_KEY:", recaptchaSiteKey);
    // console.log("Firebase Init: NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN:", debugTokenFromEnv);

    if (process.env.NODE_ENV !== 'production') {
      if (debugTokenFromEnv) {
        console.log("Firebase App Check (Dev): Assigning window.FIREBASE_APPCHECK_DEBUG_TOKEN from NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN. Ensure this token is registered in your Firebase project's App Check settings for the web app.");
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugTokenFromEnv;
      } else {
        console.warn("Firebase App Check (Dev): NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN is not set in .env. If you intend to use a debug token, ensure it's set in .env OR set window.FIREBASE_APPCHECK_DEBUG_TOKEN directly in your browser's console. The token MUST be registered in the Firebase Console for App Check for your web app.");
      }
    }

    if (recaptchaSiteKey) {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
      // console.log("Firebase App Check: Initialized with reCAPTCHA v3 provider. Ensure your domain (and localhost if testing) is whitelisted for this reCAPTCHA key.");
    } else {
      if (process.env.NODE_ENV === 'production') {
        console.error("Firebase App Check (Production): NEXT_PUBLIC_RECAPTCHA_SITE_KEY is NOT set. App Check will likely fail in production without a reCAPTCHA key or other configured provider if App Check is enforced.");
      } else {
        try {
            appCheckInstance = initializeAppCheck(app, {
              provider: new ReCaptchaV3Provider('dummy-dev-key-will-be-overridden-by-debug-token'), // Dummy key for dev if debug token is used
              isTokenAutoRefreshEnabled: true,
            });
            // console.log("Firebase App Check (Dev): Initialized with a dummy reCAPTCHA provider. This allows a debug token (if set via env or console, and registered in Firebase) to be used.");
        } catch (e: any) {
            if (e.name === 'FirebaseError' && e.code.includes('already-initialized')) {
                // console.warn("Firebase App Check: Already initialized on this app instance (likely HMR).");
            } else {
                console.error("Firebase App Check (Dev): Error initializing with dummy provider:", e);
            }
        }
      }
    }
  } catch (error) {
    console.error("Firebase App Check: Failed to initialize App Check.", error);
  }
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app); // Initialize storage

export { app, auth, db, storage, appCheckInstance }; // Export storage
