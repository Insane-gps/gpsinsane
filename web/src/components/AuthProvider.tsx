"use client";

import { auth, db, googleProvider } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  loginGoogle: () => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<void>;
  cadastrarEmail: (email: string, password: string, nome: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (nextUser) {
        setDoc(doc(db, "usuarios", nextUser.uid), {
          uid: nextUser.uid,
          email: String(nextUser.email || "").trim() || null,
          nome: String(nextUser.displayName || "").trim(),
          foto: String(nextUser.photoURL || "").trim(),
          atualizadoEm: serverTimestamp(),
          atualizadoEmCliente: Date.now(),
        }, { merge: true }).catch(() => {});
      }
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    loginGoogle: async () => {
      await signInWithPopup(auth, googleProvider);
    },
    loginEmail: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    cadastrarEmail: async (email, password, nome) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (nome.trim()) {
        await updateProfile(cred.user, { displayName: nome.trim() });
      }
    },
    logout: async () => {
      await signOut(auth);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return ctx;
}
