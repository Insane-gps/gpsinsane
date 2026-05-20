import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig).filter(([, value]) => !value);

const firebaseConfigSeguro = missing.length === 0
  ? firebaseConfig
  : {
      apiKey: firebaseConfig.apiKey || "placeholder-api-key",
      authDomain: firebaseConfig.authDomain || "placeholder.firebaseapp.com",
      projectId: firebaseConfig.projectId || "placeholder-project",
      storageBucket: firebaseConfig.storageBucket || "placeholder.appspot.com",
      messagingSenderId: firebaseConfig.messagingSenderId || "000000000000",
      appId: firebaseConfig.appId || "1:000000000000:web:placeholder",
    };

if (typeof window !== "undefined" && missing.length > 0) {
  console.warn(
    `NEXT_PUBLIC_FIREBASE_* ausentes: ${missing.map(([key]) => key).join(", ")}`,
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfigSeguro);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
