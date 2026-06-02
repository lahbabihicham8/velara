"use client";

import { Palette, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/**
 * Theme preference selector (light / dark / system).
 */
export function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-4 text-chart-3" /> Appearance
        </CardTitle>
        <CardDescription>Personalise how VelaraPay looks.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = mounted && theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
