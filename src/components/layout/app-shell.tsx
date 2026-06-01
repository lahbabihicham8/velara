"use client";

import { useState, type ReactNode } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { NavLinks } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { FxTicker } from "@/components/layout/fx-ticker";
import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRbac } from "@/hooks/use-rbac";
import { useSession } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

function SidebarBody() {
  const user = useSession();
  const { definition } = useRbac();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        <NavLinks />
      </div>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar initials={user.initials} seed={user.id} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.company}</p>
          </div>
        </div>
        <div className="mt-1 px-2">
          <Badge variant="primary" className="capitalize">
            {definition.label}
          </Badge>
        </div>
        <div className="mt-2">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

/**
 * Application chrome: fixed sidebar (desktop), slide-over drawer (mobile),
 * sticky topbar, live FX ticker and the scrollable content region.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const user = useSession();

  return (
    <div className="min-h-screen app-backdrop">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card/70 backdrop-blur-xl lg:block">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-72 border-r border-border bg-card shadow-2xl transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-4 grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
          <SidebarBody />
        </aside>
      </div>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid size-10 place-items-center rounded-lg border border-border text-muted-foreground lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <div className="relative hidden flex-1 max-w-md sm:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search transactions, wallets, people…"
                className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-card"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <Bell className="size-4" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-negative ring-2 ring-background" />
              </button>
              <ThemeToggle />
              <span className="hidden sm:block">
                <Avatar initials={user.initials} seed={user.id} />
              </span>
            </div>
          </div>
          <FxTicker />
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
