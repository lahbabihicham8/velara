import type { TeamMember } from "@/types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();

/**
 * Company team members with assigned RBAC roles.
 */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "usr_001",
    name: "Layla Al-Rashid",
    email: "layla@velarapay.io",
    role: "owner",
    initials: "LA",
    status: "active",
    lastActive: now - 4 * 60_000,
    twoFactor: true,
  },
  {
    id: "usr_002",
    name: "Marcus Bennett",
    email: "marcus@velarapay.io",
    role: "admin",
    initials: "MB",
    status: "active",
    lastActive: now - 38 * 60_000,
    twoFactor: true,
  },
  {
    id: "usr_003",
    name: "Sofia Romano",
    email: "sofia@velarapay.io",
    role: "treasurer",
    initials: "SR",
    status: "active",
    lastActive: now - 2 * HOUR,
    twoFactor: true,
  },
  {
    id: "usr_004",
    name: "Omar Haddad",
    email: "omar@velarapay.io",
    role: "treasurer",
    initials: "OH",
    status: "active",
    lastActive: now - 5 * HOUR,
    twoFactor: false,
  },
  {
    id: "usr_005",
    name: "Yuki Tanaka",
    email: "yuki@velarapay.io",
    role: "analyst",
    initials: "YT",
    status: "active",
    lastActive: now - 1 * DAY,
    twoFactor: true,
  },
  {
    id: "usr_006",
    name: "Priya Nair",
    email: "priya@velarapay.io",
    role: "analyst",
    initials: "PN",
    status: "invited",
    lastActive: now - 3 * DAY,
    twoFactor: false,
  },
  {
    id: "usr_007",
    name: "Daniel Schmidt",
    email: "daniel@partner.io",
    role: "viewer",
    initials: "DS",
    status: "active",
    lastActive: now - 6 * DAY,
    twoFactor: false,
  },
  {
    id: "usr_008",
    name: "Aisha Kareem",
    email: "aisha@velarapay.io",
    role: "viewer",
    initials: "AK",
    status: "suspended",
    lastActive: now - 14 * DAY,
    twoFactor: true,
  },
];
