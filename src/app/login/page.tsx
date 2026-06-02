import { redirect } from "next/navigation";
import { ShieldCheck, Zap, Globe2 } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/server/auth";

export const metadata = { title: "Sign in" };

const HIGHLIGHTS = [
  { icon: Globe2, title: "Multi-currency treasury", desc: "7 currencies, real-time FX, instant conversion." },
  { icon: Zap, title: "Live market data", desc: "Streaming rates and cash-flow intelligence." },
  { icon: ShieldCheck, title: "Bank-grade security", desc: "RBAC, hashed credentials, revocable sessions." },
];

export default async function LoginPage() {
  // Already signed in → straight to the dashboard.
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      {/* Brand / marketing panel */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary/15 via-card to-background p-12 lg:flex lg:flex-col lg:justify-between app-backdrop">
        <Brand />
        <div className="space-y-8">
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
            The global treasury platform for modern companies.
          </h1>
          <ul className="space-y-5">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <li key={h.title} className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{h.title}</p>
                    <p className="text-sm text-muted-foreground">{h.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} VelaraPay · Meridian Holdings
        </p>
      </section>

      {/* Auth panel */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your treasury workspace.
            </p>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
