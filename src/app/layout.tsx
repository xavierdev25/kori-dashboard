import type { Metadata } from "next";
import { ToastProvider } from "@/shared/components/Toast";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kori Dashboard",
  description: "Administracion de notas de Kori",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es">
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
