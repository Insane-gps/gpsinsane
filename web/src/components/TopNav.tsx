"use client";

import { useAuth } from "@/components/AuthProvider";
import { useWebI18n } from "@/components/WebI18nProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const ADMIN_EMAILS = [
  "ocimar0102@gmail.com",
  "creatinglab1@gmail.com",
].map((item) => item.toLowerCase());

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t, lang, setLang, options } = useWebI18n();
  const emailAtual = String(user?.email || "").trim().toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(emailAtual);

  const links = [
    { href: "/procurar", label: t.procurar, active: pathname === "/procurar" || pathname === "/ofertas" || pathname === "/" },
    { href: "/oferecer", label: t.oferecer, active: pathname === "/oferecer" || pathname === "/criar-oferta" },
    { href: "/viagens", label: t.viagens, active: pathname === "/viagens" },
    { href: "/mensagens", label: t.mensagens, active: pathname === "/mensagens" },
    { href: "/perfil", label: t.perfil, active: pathname === "/perfil" },
  ];

  useEffect(() => {
    links.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  return (
    <header className="topNav">
      <div className="brand">
        <span className="brandGlow" />
        <strong>{t.brand}</strong>
      </div>

      <nav className="topLinks">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className={item.active ? "active" : ""}>{item.label}</Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin/comissoes"
            className={pathname === "/admin/comissoes" ? "active" : ""}
          >
            {t.painelFinanceiro}
          </Link>
        )}
      </nav>

      <div className="topActions">
        <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} className="langSelect" aria-label="Idioma">
          {options.map((item) => (
            <option key={item.id} value={item.id}>{item.short}</option>
          ))}
        </select>
        {user ? (
          <>
            <span className="chip">{user.displayName || user.email || user.uid}</span>
            <button className="ghost" onClick={() => void logout()}>{t.logout}</button>
          </>
        ) : (
          <Link href="/login" className="ghost">{t.login}</Link>
        )}
      </div>
    </header>
  );
}
