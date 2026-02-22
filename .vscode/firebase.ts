import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDQks8dGYuVubpPmKh7cfo9AWdfNZVaZfI",
  authDomain: "gpsclean-91dec.firebaseapp.com",
  projectId: "gpsclean-91dec",
  storageBucket: "gpsclean-91dec.firebasestorage.app",
  messagingSenderId: "331367909461",
  appId: "1:331367909461:web:b6346d1d68d21c586aacdc"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
