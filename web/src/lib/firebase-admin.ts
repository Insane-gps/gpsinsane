import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { FieldValue, Firestore, getFirestore } from "firebase-admin/firestore";

const DEFAULT_FIREBASE_PROJECT_ID = "gpsclean-91dec";

type ServiceAccountLike = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

let cachedApp: App | null = null;

function normalizePrivateKey(value: unknown): string {
  let key = String(value || "").trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

function readServiceAccountField(parsed: Record<string, unknown>, camelCase: string, snakeCase: string): string {
  const value = parsed[camelCase] ?? parsed[snakeCase];
  return String(value || "").trim();
}

function parseServiceAccountFromEnv(): ServiceAccountLike | null {
  const raw = String(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "").trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const projectId = readServiceAccountField(parsed, "projectId", "project_id");
      const clientEmail = readServiceAccountField(parsed, "clientEmail", "client_email");
      const privateKey = normalizePrivateKey(parsed.privateKey ?? parsed.private_key);

      if (!projectId || !clientEmail || !privateKey) return null;
      return {
        projectId,
        clientEmail,
        privateKey,
      };
    } catch {
      return null;
    }
  }

  const projectId = String(process.env.FIREBASE_PROJECT_ID || "").trim();
  const clientEmail = String(process.env.FIREBASE_CLIENT_EMAIL || "").trim();
  const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || "").trim();

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: normalizePrivateKey(privateKey),
    };
  }

  return null;
}

function resolveProjectId(serviceAccount: ServiceAccountLike | null): string {
  const fromServiceAccount = String(serviceAccount?.projectId || "").trim();
  if (fromServiceAccount) return fromServiceAccount;

  const fromServerEnv = String(process.env.FIREBASE_PROJECT_ID || "").trim();
  if (fromServerEnv) return fromServerEnv;

  const fromGcloud = String(process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "").trim();
  if (fromGcloud) return fromGcloud;

  const fromPublicEnv = String(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim();
  if (fromPublicEnv) return fromPublicEnv;

  return DEFAULT_FIREBASE_PROJECT_ID;
}

function getAdminApp(): App {
  if (cachedApp) return cachedApp;

  const existing = getApps();
  if (existing.length > 0) {
    cachedApp = existing[0] as App;
    return cachedApp;
  }

  const fromEnv = parseServiceAccountFromEnv();
  const projectId = resolveProjectId(fromEnv);

  if (fromEnv) {
    cachedApp = initializeApp({
      projectId,
      credential: cert({
        projectId: fromEnv.projectId || projectId,
        clientEmail: fromEnv.clientEmail,
        privateKey: fromEnv.privateKey,
      }),
    });
    return cachedApp;
  }

  // Sem chave explícita, ainda fixa o projectId para validar ID token no projeto correto.
  cachedApp = initializeApp({ projectId });
  return cachedApp;
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export const adminServerTimestamp = FieldValue.serverTimestamp;
