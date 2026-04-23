import * as FirebaseAuthRN from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const getReactNativePersistence = (FirebaseAuthRN as any)?.getReactNativePersistence;

const ENV = ((globalThis as any)?.process?.env || {}) as Record<string, string | undefined>;
const APP_ENV = String(ENV.EXPO_PUBLIC_APP_ENV || "development").trim().toLowerCase();

const firebaseConfigPadrao = {
  apiKey: "AIzaSyDQks8dGYuVubpPmKh7cfo9AWdfNZVaZfI",
  authDomain: "gpsclean-91dec.firebaseapp.com",
  projectId: "gpsclean-91dec",
  storageBucket: "gpsclean-91dec.firebasestorage.app",
  messagingSenderId: "331367909461",
  appId: "1:331367909461:web:b6346d1d68d21c586aacdc"
};

const firebaseConfigEnv = {
  apiKey: String(ENV.EXPO_PUBLIC_FIREBASE_API_KEY || "").trim(),
  authDomain: String(ENV.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "").trim(),
  projectId: String(ENV.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "").trim(),
  storageBucket: String(ENV.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "").trim(),
  messagingSenderId: String(ENV.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
  appId: String(ENV.EXPO_PUBLIC_FIREBASE_APP_ID || "").trim()
};

const firebaseConfigEnvCompleto = Object.values(firebaseConfigEnv).every((v) => !!v);

if (APP_ENV === "production" && !firebaseConfigEnvCompleto) {
  console.warn("[firebase] EXPO_PUBLIC_FIREBASE_* incompleto no modo production; usando fallback local.");
}

const firebaseConfig = firebaseConfigEnvCompleto ? firebaseConfigEnv : firebaseConfigPadrao;

const app = initializeApp(firebaseConfig);

let authInstance;

try {
  if (typeof getReactNativePersistence === "function") {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    authInstance = getAuth(app);
  }
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);
export const storage = getStorage(app);