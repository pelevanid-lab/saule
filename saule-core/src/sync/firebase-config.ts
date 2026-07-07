import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// The user can inject these via .env when they want the real connection
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "dummy-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "saule-core.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "saule-core",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "saule-core.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "903558626633",
  appId: process.env.FIREBASE_APP_ID || "dummy"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app);
