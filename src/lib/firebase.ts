
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from "firebase/app-check";

// This configuration MUST match the one from your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyBExL4Z4DG4kROgtnoeRV3ACgWGpxMxzA0",
  authDomain: "maestroai-byliq.firebaseapp.com",
  projectId: "maestroai-byliq",
  storageBucket: "maestroai-byliq.firebasestorage.app",
  messagingSenderId: "116231535273",
  appId: "1:116231535273:web:b1d80afe2fecabf14087b8",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let appCheckInstance: AppCheck | undefined;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize App Check on the client side
if (typeof window !== 'undefined') {
  try {
    const recaptchaSiteKey = "6LcMZFMrAAAAAPch6lMWFxSvQgjzp_50PsEUXxJA";
    const debugTokenFromEnv = "BC875472-F16B-4071-AFE1-66676AC98D79"
    if (process.env.NODE_ENV !== 'production') {
      if (debugTokenFromEnv) {
        console.log("Firebase App Check (Dev): Found NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN. Assigning to window.FIREBASE_APPCHECK_DEBUG_TOKEN. Ensure this token is registered in your Firebase project's App Check settings for the web app:", debugTokenFromEnv);
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
      console.log("Firebase App Check: Initialized with reCAPTCHA v3 provider. Ensure your domain (and localhost if testing) is whitelisted for this reCAPTCHA key.");
    } else {
      if (process.env.NODE_ENV === 'production') {
        console.error("Firebase App Check (Production): NEXT_PUBLIC_RECAPTCHA_SITE_KEY is NOT set. App Check will likely fail in production without a reCAPTCHA key or other configured provider if App Check is enforced.");
      } else {
        // In development, if no reCAPTCHA key is provided, we still initialize AppCheck.
        // This allows `window.FIREBASE_APPCHECK_DEBUG_TOKEN` (set by env var or manually in console) to be picked up.
        // Using a dummy key here if no specific dev key, as the debug token overrides it.
        try {
            appCheckInstance = initializeAppCheck(app, {
              provider: new ReCaptchaV3Provider('dummy-dev-key-will-be-overridden-by-debug-token'),
              isTokenAutoRefreshEnabled: true,
            });
            console.log("Firebase App Check (Dev): Initialized with a dummy reCAPTCHA provider. This allows a debug token (if set via env or console, and registered in Firebase) to be used.");
        } catch (e: any) {
            if (e.name === 'FirebaseError' && e.code.includes('already-initialized')) {
                // This can happen with HMR, usually not an issue.
                // console.warn("Firebase App Check: Already initialized on this app instance.");
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

export { app, auth, db, appCheckInstance };
