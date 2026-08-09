"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  LogOut,
  Mail,
  Receipt,
  Settings,
  Shirt,
  StickyNote,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/components/Button";
import { Spinner } from "@/shared/components/Spinner";
import { cn } from "@/shared/utils/cn";

const navItems = [
  { href: "/dashboard", icon: BarChart3, label: "Resumen" },
  { href: "/dashboard/products", icon: Shirt, label: "Productos" },
  // Las ventas son solo para ADMIN, igual que en el backend.
  { adminOnly: true, href: "/dashboard/sales", icon: Receipt, label: "Ventas" },
  { href: "/dashboard/notes", icon: StickyNote, label: "Notas" },
  { href: "/dashboard/subscribers", icon: Mail, label: "Correos" },
  { href: "/dashboard/settings", icon: Settings, label: "Ajustes" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isChecking, logout, status, user } = useAuth();

  useEffect(() => {
    if (status === "guest") {
      router.replace("/login");
    }
  }, [router, status]);

  if (isChecking || status === "guest") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Spinner label="Verificando sesion" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Kori
            </p>
            <h1 className="text-lg font-semibold tracking-tight">Dashboard administrativo</h1>
            {user ? (
              <p className="mt-0.5 text-xs text-neutral-500">
                {user.email} · {user.role}
              </p>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            {/* overflow-x-auto + snap: en movil se desliza en vez de que
                los ultimos elementos queden fuera de pantalla sin aviso.
                La barra de scroll se oculta con .nav-scroll en globals.css. */}
            <nav
              aria-label="Navegacion principal"
              className="nav-scroll -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1"
            >
              {navItems
                .filter((item) => !item.adminOnly || isAdmin)
                .map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      className={cn(
                        "inline-flex h-10 shrink-0 snap-start items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                        active
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100",
                      )}
                      href={item.href}
                      key={item.href}
                    >
                      <Icon aria-hidden className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </nav>
            <Button
              leftIcon={<LogOut aria-hidden className="h-4 w-4" />}
              onClick={() => void logout()}
              variant="secondary"
            >
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
