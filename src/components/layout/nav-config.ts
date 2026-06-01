import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  LineChart,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Permission required to see this item. */
  permission: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },
  {
    label: "Wallets",
    href: "/dashboard/wallets",
    icon: Wallet,
    permission: "wallets.view",
  },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
    permission: "transactions.view",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: LineChart,
    permission: "analytics.view",
  },
  {
    label: "Team & Roles",
    href: "/dashboard/team",
    icon: Users,
    permission: "team.view",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    permission: "settings.manage",
  },
];
