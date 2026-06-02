"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validation";
import { createSession, destroySession } from "@/server/auth";

export interface LoginState {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string[]>>;
}

/**
 * Authenticate a user from the login form (React `useActionState`).
 * Uses a generic error message to avoid account enumeration.
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password } = parsed.data;
  const identifier = email.toLowerCase().trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });

  // Always run a comparison-shaped path; respond generically on failure.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }
  if (user.status === "suspended") {
    return { error: "This account has been suspended. Contact an administrator." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date() },
  });

  await createSession(user.id);
  redirect(user.isSuperadmin ? "/admin" : "/dashboard");
}

/**
 * Destroy the current session and return to the login screen.
 */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
