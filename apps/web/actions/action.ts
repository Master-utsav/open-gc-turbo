/* eslint-disable turbo/no-undeclared-env-vars */
"use server";

import { cookies } from "next/headers";

export async function authAction(username: string, password: string) {
  const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_HTTP_URL;
  const res = await fetch(`${baseUrl}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Authentication failed");
  }

  const { token, username: confirmedUsername } = await res.json();

  const cookieStore = await cookies();
  cookieStore.set("chat_token", token, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  cookieStore.set("chat_username", confirmedUsername, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}