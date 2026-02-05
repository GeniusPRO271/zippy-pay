"use server";

import { redirect } from "next/navigation";
import { createSession, decrypt, deleteSession, encrypt } from "../lib/session";
import { postLogin, postRefreshToken } from "@/lib/api/auth/login";
import { cookies } from "next/headers";

export async function logout() {
  await deleteSession();
  redirect("/auth/login");
}

export async function loginAction(
  prevState: { error: string | null },
  formData: FormData
) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Invalid credentials" };
  }

  try {
    const result = await postLogin({ email, password });


    await createSession({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      email: result.email,
    });
  } catch (error) {

    if (error instanceof Error) {
      return { error: error.message };
    }

    if (typeof error === 'object' && error !== null && 'message' in error) {
      return { error: String(error.message) };
    }

    return { error: "Login failed. Please check your credentials." };
  }

  redirect("/");
}

export async function verifySession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")?.value
  const payload = await decrypt(sessionCookie)

  if (!payload) {
    logout()
    return
  }

  if (Date.now() > payload.expiresAt) {
    logout()
    return
  }

  try {
    const data = await postRefreshToken({
      refreshToken: payload.refreshToken,
    })


    const newExpiresAt = Date.now() + data.expiresIn * 1000

    const encrypted = await encrypt({
      accessToken: data.accessToken,
      refreshToken: payload.refreshToken,
      email: data.email,
      expiresAt: new Date(newExpiresAt),
    })

    cookieStore.set("session", encrypted, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(newExpiresAt),
    })


    return
  } catch {
    logout()
    return
  }
}
