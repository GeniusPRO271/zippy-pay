import { NextResponse } from "next/server";
import { getSession, encrypt } from "@/app/lib/session";
import { postRefreshToken } from "@/lib/api/auth/login";
import { cookies } from "next/headers";

export async function POST() {
  const session = await getSession();

  if (!session?.refreshToken) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  try {
    const data = await postRefreshToken({
      refreshToken: session.refreshToken,
    });

    const newExpiresAt = new Date(Date.now() + data.expiresIn * 1000);

    const encrypted = await encrypt({
      accessToken: data.accessToken,
      refreshToken: session.refreshToken,
      email: data.email,
      role: data.role,
      expiresAt: newExpiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: newExpiresAt,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 401 }
    );
  }
}
