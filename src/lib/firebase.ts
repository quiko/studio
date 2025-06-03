
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from "firebase/app-check";

// This configuration MUST match the one from your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyDxHFkFJGH_igiXW_0RM7S8Na1jt7wyvFg",
  authDomain: "obsession-music-ai-2a20f.firebaseapp.com",
  projectId: "obsession-music-ai-2a20f",
  storageBucket: "obsession-music-ai-2a20f.appspot.com", // Corrected to .appspot.com
  messagingSenderId: "989087866304",
  appId: "1:989087866304:web:3d3138d219d0428947bc25",
  measurementId: "G-N11JX6GGDV"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);

  // Initialize App Check
  if (typeof window !== 'undefined') { // Ensure App Check is initialized only on the client
    let appCheckProvider;

    if (process.env.NODE_ENV === 'production') {
      const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (recaptchaSiteKey) {
        appCheckProvider = new ReCaptchaV3Provider(recaptchaSiteKey);
        initializeAppCheck(app, {
          provider: appCheckProvider,
          isTokenAutoRefreshEnabled: true,
        });
        console.log("App Check initialized with reCAPTCHA v3 provider for production.");
      } else {
        console.warn("App Check: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set. App Check will not be initialized for production.");
      }
    } else { // Development mode
      const debugToken = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;
      if (debugToken) {
        // Make the debug token globally available for Firebase SDK to pick up
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
        console.log("App Check: Using debug token from NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN.");
      }
      
      // Initialize with a reCAPTCHA provider (can be a dummy key if solely relying on debug token,
      // or your actual dev reCAPTCHA key if you've configured localhost)
      // The SDK will automatically use `window.FIREBASE_APPCHECK_DEBUG_TOKEN` if set,
      // overriding the ReCaptchaV3Provider for debugging purposes.
      const devRecaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'dummy-key-for-dev-if-using-debug-token';
      appCheckProvider = new ReCaptchaV3Provider(devRecaptchaSiteKey);
      
      initializeAppCheck(app, {
        provider: appCheckProvider, 
        isTokenAutoRefreshEnabled: true,
      });
      console.log("App Check initialized for development. Set NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN in .env or window.FIREBASE_APPCHECK_DEBUG_TOKEN in browser console for debug token testing.");
    }
  }
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
