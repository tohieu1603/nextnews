"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { useNotificationCenterStore } from "@/store/notification-center.store";

const loadingMessage = "Processing Google login...";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const addNotification = useNotificationCenterStore((state) => state.addNotification);
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      router.replace("/login");
      return;
    }

    const authenticate = async () => {
      const ok = await loginWithGoogle(code);
      if (ok) {
        addNotification({
          type: "success",
          title: "Đăng nhập thành công",
          message: "Bạn đã đăng nhập bằng Google.",
        });
      }
      router.replace(ok ? "/" : "/login");
    };

    void authenticate();
  }, [code, loginWithGoogle, router, addNotification]);

  return <p>{loadingMessage}</p>;
}

export default function GoogleCallback() {
  return (
    <Suspense fallback={<p>{loadingMessage}</p>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
