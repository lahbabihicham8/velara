import {
  LayoutDashboard,
  Wallet,
  Bitcoin,
  ArrowLeftRight,
  Contact,
  FileUp,
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
    label: "Crypto",
    href: "/dashboard/crypto",
    icon: Bitcoin,
    permission: "crypto.view",
  },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
    permission: "transactions.view",
  },
  {
    label: "Beneficiaries",
    href: "/dashboard/beneficiaries",
    icon: Contact,
    permission: "beneficiaries.view",
  },
  {
    label: "Bulk Payments",
    href: "/dashboard/payments",
    icon: FileUp,
    permission: "payments.bulk",
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
