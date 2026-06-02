"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/components/providers/session-provider";

/**
 * Back-office chrome for platform superadmins. A focused top-bar layout
 * (no client FX ticker) with quick access back to the operator's own
 * dashboard.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const user = useSession();

  return (
    <div className="min-h-screen app-backdrop">
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Brand />
          </Link>
          <Badge variant="warning" className="gap-1.5">
            <ShieldCheck className="size-3.5" />
            Back office
          </Badge>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <LayoutDashboard className="size-4" />
              My dashboard
            </Link>
            <ThemeToggle />
            <span className="hidden items-center gap-2 sm:flex">
              <Avatar initials={user.initials} seed={user.id} />
              <span className="text-sm font-medium">{user.name}</span>
            </span>
            <div className="w-28">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
