"use client";

import { useRouter } from "next/navigation";
import { Auth } from "@repo/ui";
import { authAction } from "../actions/action";

export default function AuthForm() {
  const router = useRouter();

  async function handleSubmit(username: string, password: string) {
    await authAction(username, password);   // server action called from same app ✅
    router.refresh();
  }

  return <Auth onSubmit={handleSubmit} />;
}
