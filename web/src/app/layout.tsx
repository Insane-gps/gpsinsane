import { AuthProvider } from "@/components/AuthProvider";
import { TopNav } from "@/components/TopNav";
import { WebI18nProvider } from "@/components/WebI18nProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INSANE GPS Web",
  description: "Modulo web de caronas e entregas do INSANE GPS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <WebI18nProvider>
            <div className="appBg" />
            <TopNav />
            <main className="container">{children}</main>
          </WebI18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
