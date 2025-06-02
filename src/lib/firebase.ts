
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:"AIzaSyBExL4Z4DG4kROgtnoeRV3ACgWGpxMxzA0",
  authDomain:"maestroai-byliq.firebaseapp.com",
  projectId:"maestroai-byliq",
  storageBucket:"maestroai-byliq.firebasestorage.app",
  messagingSenderId:"116231535273",
  appId:"1:116231535273:web:50ff97addec4d2be4087b8",
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
