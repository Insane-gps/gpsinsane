import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { FieldValue, Firestore, getFirestore } from "firebase-admin/firestore";

type ServiceAccountLike = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

let cachedApp: App | null = null;

function parseServiceAccountFromEnv(): ServiceAccountLike | null {
  const raw = String(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "").trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ServiceAccountLike;
    if (!parsed?.projectId || !parsed?.clientEmail || !parsed?.privateKey) return null;
    return {
      projectId: String(parsed.projectId),
      clientEmail: String(parsed.clientEmail),
      privateKey: String(parsed.privateKey).replace(/\\n/g, "\n"),
    };
  } catch {
    return null;
  }
}

function getAdminApp(): App {
  if (cachedApp) return cachedApp;

  const existing = getApps();
  if (existing.length > 0) {
    cachedApp = existing[0] as App;
    return cachedApp;
  }

  const fromEnv = parseServiceAccountFromEnv();
  if (fromEnv) {
    cachedApp = initializeApp({
      credential: cert({
        projectId: fromEnv.projectId,
        clientEmail: fromEnv.clientEmail,
        privateKey: fromEnv.privateKey,
      }),
    });
    return cachedApp;
  }

  // Fallback para ambientes com credenciais padrão (GCP/Cloud Run).
  cachedApp = initializeApp();
  return cachedApp;
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export const adminServerTimestamp = FieldValue.serverTimestamp;
