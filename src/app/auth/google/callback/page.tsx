"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function GoogleCallback() {
  const router = useRouter();
  const q = useSearchParams();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  useEffect(() => {
    const code = q.get("code");
    if (!code) {
      router.replace("/login");
      return;
    }

    (async () => {
      const ok = await loginWithGoogle(code);
      router.replace(ok ? "/" : "/login");
    })();
  }, [q, loginWithGoogle, router]);

  return <p>🔄 Đang xử lý đăng nhập Google...</p>;
}
