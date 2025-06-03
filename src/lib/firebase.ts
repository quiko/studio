
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// This configuration MUST match the one from your Firebase project settings.
// Specifically, the apiKey needs to be correct for the project "obsession-music-ai-2a20f".
const firebaseConfig = {
  apiKey: "AIzaSyDxHFkFJGH_igiXW_0RM7S8Na1jt7wyvFg",
  authDomain: "obsession-music-ai-2a20f.firebaseapp.com",
  projectId: "obsession-music-ai-2a20f",
  storageBucket: "obsession-music-ai-2a20f.firebasestorage.app",
  messagingSenderId: "989087866304",
  appId: "1:989087866304:web:3d3138d219d0428947bc25",
  measurementId: "G-N11JX6GGDV"
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
