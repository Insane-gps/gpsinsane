import {
    addDoc as fbAddDoc,
    deleteDoc as fbDeleteDoc,
    getDoc as fbGetDoc,
    getDocs as fbGetDocs,
    onSnapshot as fbOnSnapshot,
    setDoc as fbSetDoc,
    updateDoc as fbUpdateDoc,
} from "firebase/firestore";
import { auth } from "../firebase";

let debugUid = "";

export function setFirestoreDebugUid(uid: string) {
  debugUid = String(uid || "").trim();
}

function uidAtual() {
  const authUid = String(auth?.currentUser?.uid || "").trim();
  return debugUid || authUid || "uid_indisponivel";
}

function pathFromContainer(container: any): string {
  if (!container) return "";
  try {
    if (typeof container === "string") return container;
    if (typeof container.canonicalString === "function") {
      return String(container.canonicalString() || "");
    }
    if (Array.isArray(container.segments)) {
      return container.segments.map((s: any) => String(s)).join("/");
    }
    if (typeof container.toArray === "function") {
      return container.toArray().map((s: any) => String(s)).join("/");
    }
  } catch {}
  return "";
}

function resolverMeta(refOrQuery: any): { path: string; collection: string } {
  let path = "";
  let collection = "";

  try {
    if (typeof refOrQuery?.path === "string") {
      path = String(refOrQuery.path || "");
    }

    if (!path && typeof refOrQuery?._delegate?.path === "string") {
      path = String(refOrQuery._delegate.path || "");
    }

    if (!path) path = pathFromContainer(refOrQuery?._path);
    if (!path) path = pathFromContainer(refOrQuery?._key?.path);
    if (!path) path = pathFromContainer(refOrQuery?._query?.path);

    if (!path && refOrQuery?.parent?.path && refOrQuery?.id) {
      path = `${String(refOrQuery.parent.path)}/${String(refOrQuery.id)}`;
    }

    const collectionGroup = String(refOrQuery?._query?.collectionGroup || "").trim();
    if (!collection && collectionGroup) {
      collection = collectionGroup;
      if (!path) path = `collectionGroup/${collectionGroup}`;
    }

    if (!collection) {
      const pathLimpo = String(path || "").replace(/^\/+|\/+$/g, "");
      const segmentos = pathLimpo ? pathLimpo.split("/").filter(Boolean) : [];
      if (segmentos.length > 0) {
        collection = segmentos.length % 2 === 0
          ? String(segmentos[segmentos.length - 2] || "")
          : String(segmentos[segmentos.length - 1] || "");
      }
    }

    if (!collection && refOrQuery?.parent?.id) {
      collection = String(refOrQuery.parent.id || "");
    }

    if (!collection && refOrQuery?.id && !refOrQuery?.parent?.id) {
      collection = String(refOrQuery.id || "");
    }

  } catch {}

  return {
    path: String(path || "path_indisponivel"),
    collection: String(collection || "colecao_indisponivel"),
  };
}

function logAcesso(funcao: string, meta: { path: string; collection: string }) {
  console.log(`[firestore-debug] func=${funcao} path=${meta.path} collection=${meta.collection} uid=${uidAtual()}`);
}

function logErro(funcao: string, meta: { path: string; collection: string }, error: any) {
  const code = String(error?.code || "");
  const message = String(error?.message || error || "erro_desconhecido");
  console.log(`[firestore-debug] func=${funcao} path=${meta.path} collection=${meta.collection} uid=${uidAtual()} error.code=${code} error.message=${message}`);

  if (code.includes("permission-denied") || message.toLowerCase().includes("permission")) {
    console.log("[firestore-debug] permission-denied detalhe:", error);
    try {
      console.log("[firestore-debug] permission-denied json:", JSON.stringify(error, Object.getOwnPropertyNames(error || {})));
    } catch {}
  }
}

export async function getDocWithLog(ref: any) {
  const meta = resolverMeta(ref);
  logAcesso("getDoc", meta);
  try {
    return await fbGetDoc(ref);
  } catch (error) {
    logErro("getDoc", meta, error);
    throw error;
  }
}

export async function getDocsWithLog(refOrQuery: any) {
  const meta = resolverMeta(refOrQuery);
  logAcesso("getDocs", meta);
  try {
    return await fbGetDocs(refOrQuery);
  } catch (error) {
    logErro("getDocs", meta, error);
    throw error;
  }
}

export async function addDocWithLog(collectionRef: any, data: any) {
  const meta = resolverMeta(collectionRef);
  logAcesso("addDoc", meta);
  try {
    return await fbAddDoc(collectionRef, data);
  } catch (error) {
    logErro("addDoc", meta, error);
    throw error;
  }
}

export async function setDocWithLog(docRef: any, data: any, options?: any) {
  const meta = resolverMeta(docRef);
  logAcesso("setDoc", meta);
  try {
    if (typeof options !== "undefined") {
      return await fbSetDoc(docRef, data, options);
    }
    return await fbSetDoc(docRef, data);
  } catch (error) {
    logErro("setDoc", meta, error);
    throw error;
  }
}

export async function updateDocWithLog(docRef: any, data: any) {
  const meta = resolverMeta(docRef);
  logAcesso("updateDoc", meta);
  try {
    return await fbUpdateDoc(docRef, data);
  } catch (error) {
    logErro("updateDoc", meta, error);
    throw error;
  }
}

export async function deleteDocWithLog(docRef: any) {
  const meta = resolverMeta(docRef);
  logAcesso("deleteDoc", meta);
  try {
    return await fbDeleteDoc(docRef);
  } catch (error) {
    logErro("deleteDoc", meta, error);
    throw error;
  }
}

export function onSnapshotWithLog(reference: any, ...rest: any[]) {
  const meta = resolverMeta(reference);
  logAcesso("onSnapshot", meta);

  if (typeof rest[0] === "function") {
    const next = rest[0];
    const userError = typeof rest[1] === "function" ? rest[1] : undefined;
    const complete = typeof rest[2] === "function" ? rest[2] : undefined;

    const wrappedError = (error: any) => {
      logErro("onSnapshot", meta, error);
      if (userError) userError(error);
    };

    return fbOnSnapshot(reference, next, wrappedError, complete as any);
  }

  if (rest[0] && typeof rest[0] === "object" && typeof rest[1] === "function") {
    const options = rest[0];
    const next = rest[1];
    const userError = typeof rest[2] === "function" ? rest[2] : undefined;
    const complete = typeof rest[3] === "function" ? rest[3] : undefined;

    const wrappedError = (error: any) => {
      logErro("onSnapshot", meta, error);
      if (userError) userError(error);
    };

    return (fbOnSnapshot as any)(reference, options, next, wrappedError, complete);
  }

  if (rest[0] && typeof rest[0] === "object") {
    const optionsOrObserver = rest[0];
    const maybeObserver = rest[1];

    if (maybeObserver && typeof maybeObserver === "object") {
      const wrappedObserver = {
        ...maybeObserver,
        error: (error: any) => {
          logErro("onSnapshot", meta, error);
          if (typeof maybeObserver.error === "function") maybeObserver.error(error);
        },
      };
      return (fbOnSnapshot as any)(reference, optionsOrObserver, wrappedObserver);
    }

    const observer = optionsOrObserver;
    const wrappedObserver = {
      ...observer,
      error: (error: any) => {
        logErro("onSnapshot", meta, error);
        if (typeof observer.error === "function") observer.error(error);
      },
    };
    return fbOnSnapshot(reference, wrappedObserver as any);
  }

  return (fbOnSnapshot as any)(reference, ...rest);
}
