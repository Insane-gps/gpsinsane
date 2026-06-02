import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseConfigPadrao = {
  apiKey: "AIzaSyDQks8dGYuVubpPmKh7cfo9AWdfNZVaZfI",
  authDomain: "gpsclean-91dec.firebaseapp.com",
  projectId: "gpsclean-91dec",
  storageBucket: "gpsclean-91dec.firebasestorage.app",
  messagingSenderId: "331367909461",
  appId: "1:331367909461:web:b6346d1d68d21c586aacdc",
};

const missing = Object.entries(firebaseConfig).filter(([, value]) => !value);

const firebaseConfigSeguro = missing.length === 0
  ? firebaseConfig
  : {
      apiKey: firebaseConfig.apiKey || firebaseConfigPadrao.apiKey,
      authDomain: firebaseConfig.authDomain || firebaseConfigPadrao.authDomain,
      projectId: firebaseConfig.projectId || firebaseConfigPadrao.projectId,
      storageBucket: firebaseConfig.storageBucket || firebaseConfigPadrao.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId || firebaseConfigPadrao.messagingSenderId,
      appId: firebaseConfig.appId || firebaseConfigPadrao.appId,
    };

if (typeof window !== "undefined" && missing.length > 0) {
  console.warn(
    `NEXT_PUBLIC_FIREBASE_* ausentes: ${missing.map(([key]) => key).join(", ")}`,
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfigSeguro);

if (typeof window !== "undefined") {
  setLogLevel("silent");
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
