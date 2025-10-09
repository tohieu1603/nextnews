"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Tabs as UiTabs,
  TabsContent as UiTabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Bell, MessageCircle, RefreshCw, Shield } from "lucide-react";
import { TradingBot, WalletBalance } from "../../types";
import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import type {
  CreateNotificationEndpointPayload,
  NotificationChannel,
  NotificationEndpoint,
  PurchasedLicense,
} from "@/types";

interface SettingsTabProps {
  tradingBots: TradingBot[];
  walletBalance: WalletBalance;
  setWalletBalance: React.Dispatch<React.SetStateAction<WalletBalance>>;
  formatCurrency: (amount: number) => string;
  purchasedLicenses: PurchasedLicense[];
}

const extractErrorFromPayload = (payload: unknown): string | undefined => {
  if (!payload) {
    return undefined;
  }
  if (typeof payload === "string") {
    return payload;
  }
  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["error", "detail", "message"]) {
      const value = record[key];
      if (typeof value === "string") {
        return value;
      }
    }
  }
  return undefined;
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: { data?: unknown };
      message?: string;
    };

    return (
      extractErrorFromPayload(err.response?.data) ||
      (typeof err.message === "string" ? err.message : undefined) ||
      "Đã xảy ra lỗi không xác định"
    );
  }
  if (typeof error === "string" && error.length > 0) {
    return error;
  }
  return "Đã xảy ra lỗi không xác định";
};

const readDetailString = (
  details: Record<string, unknown> | null,
  key: string
): string | undefined => {
  const value = details?.[key];
  return typeof value === "string" ? value : undefined;
};

const readDetailArray = (
  details: Record<string, unknown> | null,
  key: string
): string[] => {
  const value = details?.[key];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const isNotificationEndpointResponse = (
  data: unknown
): data is NotificationEndpoint => {
  return Boolean(data && typeof data === "object" && "endpoint_id" in data);
};

const formatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remaining = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
};

export default function SettingsTab({
  tradingBots,
  walletBalance,
  setWalletBalance,
  formatCurrency,
  purchasedLicenses,
}: SettingsTabProps) {
  const [notificationChannel, setNotificationChannel] =
    useState<NotificationChannel>("telegram");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [zaloNumber, setZaloNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [symbolCodes, setSymbolCodes] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [emailVerification, setEmailVerification] = useState<{
    open: boolean;
    endpoint: NotificationEndpoint | null;
  }>({
    open: false,
    endpoint: null,
  });
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerifyError, setEmailVerifyError] = useState<string | null>(null);
  const [emailVerifySuccess, setEmailVerifySuccess] =
    useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const accessToken = useAuthStore((state) => state.access_token);

  const endpoints = useNotificationStore((state) => state.endpoints);
  const isFetching = useNotificationStore((state) => state.isFetching);
  const isMutating = useNotificationStore((state) => state.isMutating);
  const notificationError = useNotificationStore((state) => state.error);

  const fetchEndpoints = useNotificationStore((state) => state.fetchEndpoints);
  const registerEndpoint = useNotificationStore(
    (state) => state.registerEndpoint
  );
  const editEndpoint = useNotificationStore((state) => state.editEndpoint);
  const removeEndpoint = useNotificationStore((state) => state.removeEndpoint);
  const triggerVerify = useNotificationStore((state) => state.triggerVerify);
  const clearNotificationError = useNotificationStore(
    (state) => state.clearError
  );
  const resetNotificationState = useNotificationStore((state) => state.reset);

  const isTelegram = notificationChannel === "telegram";
  const isZalo = notificationChannel === "zalo";
  const isEmail = notificationChannel === "email";
  const canResendOtp = resendCooldown <= 0;
  const countdownLabel = formatCountdown(resendCooldown);

  const availableSymbolCodes = useMemo(() => {
    const codes = purchasedLicenses
      .map((license) =>
        (license.symbol_name || license.symbol_id?.toString() || "")
          .toString()
          .toUpperCase()
      )
      .filter((code) => code.length > 0);
    return Array.from(new Set(codes));
  }, [purchasedLicenses]);

  useEffect(() => {
    if (!emailVerification.open) {
      setEmailOtp("");
      setEmailVerifyError(null);
      setEmailVerifySuccess(null);
      setResendCooldown(0);
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
        resendTimerRef.current = null;
      }
      return;
    }

    setEmailOtp("");
    setEmailVerifyError(null);
    setEmailVerifySuccess(null);
    setResendCooldown(120);

    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
    }

    resendTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (resendTimerRef.current) {
            clearInterval(resendTimerRef.current);
            resendTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
        resendTimerRef.current = null;
      }
    };
  }, [emailVerification.open]);

  useEffect(() => {
    if (!accessToken) {
      resetNotificationState();
      return;
    }
    fetchEndpoints(accessToken).catch(() => {
      // errors are handled in store state
    });
  }, [accessToken, fetchEndpoints, resetNotificationState]);

  useEffect(() => {
    if (notificationError) {
      setFormError(notificationError);
    }
  }, [notificationError]);

  const symbolsFromInput = (input: string) =>
    input
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter((item) => item.length > 0);

  const openEmailVerificationModal = (endpoint: NotificationEndpoint) => {
    setEmailVerification({ open: true, endpoint });
    setFormError(null);
    clearNotificationError();
  };

  const closeEmailVerificationModal = () => {
    setEmailVerification({ open: false, endpoint: null });
  };

  const handleResendEmailOtp = async () => {
    if (!accessToken) {
      setEmailVerifyError("Vui lòng đăng nhập để gửi lại mã xác thực.");
      return;
    }
    if (!emailVerification.endpoint) {
      setEmailVerifyError("Không tìm thấy endpoint email cần xác thực.");
      return;
    }
    if (resendCooldown > 0) {
      return;
    }

    setEmailVerifyError(null);
    setEmailVerifySuccess(null);
    try {
      const response = await triggerVerify(
        accessToken,
        emailVerification.endpoint.endpoint_id,
        { auto_verify: false }
      );

      if (
        response &&
        typeof response === "object" &&
        "detail" in response &&
        typeof (response as { detail?: unknown }).detail === "string"
      ) {
        setEmailVerifySuccess(
          "Đã gửi lại mã OTP tới " + emailVerification.endpoint.address
        );
      } else {
        setEmailVerifySuccess(
          "Đã gửi lại mã OTP tới " + emailVerification.endpoint.address
        );
      }
      setResendCooldown(120);
    } catch (error) {
      setEmailVerifyError(getErrorMessage(error));
    }
  };

  const handleSubmitEmailVerification = async () => {
    if (!accessToken) {
      setEmailVerifyError("Vui lòng đăng nhập để xác thực email.");
      return;
    }
    if (!emailVerification.endpoint) {
      setEmailVerifyError("Không tìm thấy endpoint email cần xác thực.");
      return;
    }
    if (emailOtp.trim().length !== 6) {
      setEmailVerifyError("Mã OTP phải gồm 6 chữ số.");
      return;
    }

    setEmailVerifyError(null);
    setEmailVerifySuccess(null);

    try {
      const result = await triggerVerify(
        accessToken,
        emailVerification.endpoint.endpoint_id,
        {
          auto_verify: false,
          verification_code: emailOtp.trim(),
        }
      );

      if (isNotificationEndpointResponse(result)) {
        setEmailVerifySuccess("Xác thực email thành công!");
        setFormSuccess("Email đã được xác thực thành công.");
        setFormError(null);
        setTimeout(() => {
          closeEmailVerificationModal();
        }, 1000);
      } else {
        setEmailVerifySuccess(
          "Mã đã được xử lý. Vui lòng kiểm tra trạng thái endpoint."
        );
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setEmailVerifyError(message);
    }
  };

  const handleRegisterNotification = async () => {
    setFormError(null);
    setFormSuccess(null);
    clearNotificationError();

    if (!accessToken) {
      setFormError("Vui lòng đăng nhập để đăng ký nhận thông báo.");
      return;
    }

    let address = "";
    const details: Record<string, unknown> = {
      source: "web_app",
    };

    if (isTelegram) {
      if (!telegramChatId.trim()) {
        setFormError("Vui lòng nhập Telegram chat ID.");
        return;
      }
      address = telegramChatId.trim();
      if (telegramHandle.trim()) {
        details.username = telegramHandle.trim();
      }
    } else if (isZalo) {
      if (!zaloNumber.trim()) {
        setFormError("Vui lòng nhập số Zalo để nhận thông báo.");
        return;
      }
      address = zaloNumber.trim();
    } else if (isEmail) {
      if (!emailAddress.trim()) {
        setFormError("Vui lòng nhập email để nhận thông báo.");
        return;
      }
      const email = emailAddress.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFormError("Địa chỉ email không hợp lệ.");
        return;
      }
      address = email;
    }

    const symbols = symbolsFromInput(symbolCodes);
    if (symbols.length > 0) {
      details.symbols = symbols;
    }

    const payload = {
      channel: notificationChannel,
      address,
      is_primary: isPrimary,
      details: Object.keys(details).length ? details : undefined,
    } satisfies CreateNotificationEndpointPayload;

    try {
      const createdEndpoint = await registerEndpoint(accessToken, payload);

      if (notificationChannel === "email") {
        setFormSuccess(
          "Đã đăng ký email. Vui lòng kiểm tra hộp thư để lấy mã OTP trong 2 phút."
        );
        openEmailVerificationModal(createdEndpoint);
      } else {
        setFormSuccess("Đăng ký nhận thông báo thành công.");
      }

      if (symbols.length === 0) {
        setSymbolCodes("");
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  const handleSetPrimary = async (endpointId: string) => {
    setFormError(null);
    setFormSuccess(null);
    clearNotificationError();

    if (!accessToken) {
      setFormError("Vui lòng đăng nhập để cập nhật kênh thông báo.");
      return;
    }

    try {
      await editEndpoint(accessToken, endpointId, { is_primary: true });
      setFormSuccess("Đã đặt kênh nhận thông báo mặc định.");
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  const handleVerifyEndpoint = async (endpoint: NotificationEndpoint) => {
    setFormError(null);
    setFormSuccess(null);
    clearNotificationError();

    if (!accessToken) {
      setFormError("Vui lòng đăng nhập để xác thực kênh thông báo.");
      return;
    }

    try {
      if (endpoint.channel === "telegram") {
        await triggerVerify(accessToken, endpoint.endpoint_id, {
          auto_verify: true,
        });
        setFormSuccess("Đã cập nhật trạng thái xác thực kênh thông báo.");
      } else if (endpoint.channel === "email") {
        openEmailVerificationModal(endpoint);
        setFormSuccess(
          `Nhập mã OTP đã gửi tới ${endpoint.address} để hoàn tất xác thực.`
        );
        return;
      } else {
        await editEndpoint(accessToken, endpoint.endpoint_id, {
          verified: true,
        });
        setFormSuccess("Đã cập nhật trạng thái xác thực kênh thông báo.");
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  const handleDeleteEndpoint = async (endpointId: string) => {
    setFormError(null);
    setFormSuccess(null);
    clearNotificationError();

    if (!accessToken) {
      setFormError("Vui lòng đăng nhập để xóa kênh thông báo.");
      return;
    }

    try {
      await removeEndpoint(accessToken, endpointId);
      setFormSuccess("Đã xóa kênh nhận thông báo.");
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  const getRecommendedMinBalance = (): number => {
    const activeBotsTotal = tradingBots
      .filter((bot) => bot.status === "active")
      .reduce((sum, bot) => sum + bot.monthlyFee, 0);

    // Recommend 3 months worth of active bot fees, minimum 200K
    return Math.max(200000, activeBotsTotal * 3);
  };

  const handleAutoRenewalToggle = (
    setting: keyof WalletBalance["autoRenewal"],
    value: boolean | number
  ) => {
    if (setting === "minBalance") {
      const recommendedMinBalance = getRecommendedMinBalance();
      setWalletBalance((prev) => ({
        ...prev,
        autoRenewal: {
          ...prev.autoRenewal,
          minBalance: recommendedMinBalance,
        },
      }));
    } else {
      setWalletBalance((prev) => ({
        ...prev,
        autoRenewal: {
          ...prev.autoRenewal,
          [setting]: value,
          minBalance: getRecommendedMinBalance(),
        },
      }));
    }
  };

  return (
    <UiTabsContent
      value="settings"
      className="p-8 pt-12 bg-slate-900/40"
    >
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Cài đặt</h2>
          <p className="text-slate-400">
            Cấu hình các tùy chọn tự động và cài đặt hệ thống
          </p>
        </div>

        <UiTabs
          defaultValue="autoRenewal"
          className="flex flex-col gap-4"
        >
          <TabsList className="w-full justify-start gap-2 rounded-2xl border border-slate-800/60 bg-slate-800/40 p-1.5 ">
            <TabsTrigger value="autoRenewal" className="gap-2 px-4 py-2">
              <RefreshCw className="h-4 w-4 text-orange-400" />
              Gia hạn
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 px-4 py-2">
              <Bell className="h-4 w-4 text-purple-400" />
              Thông báo
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 px-4 py-2">
              <Shield className="h-4 w-4 text-red-400" />
              Bảo mật
            </TabsTrigger>
          </TabsList>

          <UiTabsContent
            value="autoRenewal"
            className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-800/40 to-slate-700/40 p-6"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between rounded-lg border border-slate-600/30 bg-slate-700/30 p-4">
                <div>
                  <Label className="text-base text-slate-300">
                    Bật tự động gia hạn
                  </Label>
                  <p className="mt-1 text-sm text-slate-400">
                    Tự động gia hạn các dịch vụ khi hết hạn
                  </p>
                </div>
                <Switch
                  checked={walletBalance.autoRenewal.enabled}
                  onCheckedChange={(checked) =>
                    handleAutoRenewalToggle("enabled", checked)
                  }
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>

              {walletBalance.autoRenewal.enabled && (
                <div className="ml-4 space-y-4 border-l-2 border-orange-400/30 pl-4">
                  <div className="flex items-center justify-between rounded-lg bg-slate-700/20 p-3">
                    <div>
                      <Label className="text-slate-300">
                        Gia hạn tín hiệu trading
                      </Label>
                      <p className="text-xs text-slate-400">
                        Tự động gia hạn gói tín hiệu khi hết hạn
                      </p>
                    </div>
                    <Switch
                      checked={walletBalance.autoRenewal.signalPackages}
                      onCheckedChange={(checked) =>
                        handleAutoRenewalToggle("signalPackages", checked)
                      }
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-slate-700/20 p-3">
                    <div>
                      <Label className="text-slate-300">
                        Gia hạn bot trading
                      </Label>
                      <p className="text-xs text-slate-400">
                        Gia hạn các bot trading tự động
                      </p>
                    </div>
                    <Switch
                      checked={walletBalance.autoRenewal.botSubscriptions}
                      onCheckedChange={(checked) =>
                        handleAutoRenewalToggle("botSubscriptions", checked)
                      }
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>

                  <div className="rounded-lg bg-slate-700/20 p-3">
                    <Label className="mb-2 block text-slate-300">
                      Số dư tối thiểu để gia hạn
                    </Label>
                    <Input
                      type="text"
                      value={formatCurrency(getRecommendedMinBalance())}
                      readOnly
                      className="cursor-not-allowed border-slate-600/50 bg-slate-600/30 text-slate-300"
                      placeholder="500,000"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Tự động tính toán: {formatCurrency(getRecommendedMinBalance())} VNĐ (3 tháng phí bot hiện tại)
                    </p>
                    <p className="mt-1 text-xs text-cyan-400">
                      Mức này được tính tự động dựa trên tổng phí của các bot
                      đang hoạt động
                    </p>
                  </div>
                </div>
              )}
            </div>
          </UiTabsContent>

          <UiTabsContent
            value="notifications"
            className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-800/40 to-slate-700/40 p-6"
          >
            <div className="flex flex-col gap-5">
              <div className="rounded-lg border border-slate-700/30 bg-slate-700/30 p-4">
                <Label className="mb-3 flex items-center gap-2 text-base text-slate-200">
                  <MessageCircle className="h-4 w-4 text-purple-300" />
                  Chọn kênh nhận tín hiệu
                </Label>
                <RadioGroup
                  value={notificationChannel}
                  onValueChange={(value) => {
                    setNotificationChannel(value as NotificationChannel);
                    setFormError(null);
                    setFormSuccess(null);
                    clearNotificationError();
                  }}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  <div className="flex items-center gap-3 rounded-lg border border-slate-600/40 bg-slate-800/40 px-3 py-2">
                    <RadioGroupItem value="telegram" id="notify-telegram" />
                    <Label htmlFor="notify-telegram" className="text-sm text-slate-200">
                      Telegram
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-600/40 bg-slate-800/40 px-3 py-2">
                    <RadioGroupItem value="zalo" id="notify-zalo" />
                    <Label htmlFor="notify-zalo" className="text-sm text-slate-200">
                      Zalo
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-600/40 bg-slate-800/40 px-3 py-2">
                    <RadioGroupItem value="email" id="notify-email" />
                    <Label htmlFor="notify-email" className="text-sm text-slate-200">
                      Email
                    </Label>
                  </div>
                </RadioGroup>
                <p className="mt-3 text-xs text-slate-400">
                  Điền thông tin liên hệ tương ứng để bot có thể gửi thông báo chính xác.
                </p>

                {(isTelegram || isZalo || isEmail) && (
                  <div className="mt-4 space-y-4 rounded-lg border border-slate-700/40 bg-slate-800/30 p-4">
                    <p className="text-xs text-slate-400">
                      Nhập dữ liệu bắt buộc cho kênh đã chọn. Nếu bỏ trống bot sẽ không thể gửi tin.
                    </p>

                    {isTelegram && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="telegram-username" className="text-sm text-slate-200">
                            Telegram username
                          </Label>
                          <Input
                            id="telegram-username"
                            placeholder="@your_username"
                            value={telegramHandle}
                            onChange={(event) => setTelegramHandle(event.target.value)}
                          />
                          <p className="text-xs text-slate-500">
                            Username hoặc link Telegram dùng để bot nhận dạng bạn.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telegram-chat-id" className="text-sm text-slate-200">
                            Telegram chat ID
                          </Label>
                          <Input
                            id="telegram-chat-id"
                            placeholder="123456789"
                            value={telegramChatId}
                            onChange={(event) => setTelegramChatId(event.target.value)}
                          />
                          <p className="text-xs text-slate-500">
                            Chat ID giúp bot gửi tin nhắn đến đúng cuộc trò chuyện.
                          </p>
                        </div>
                      </div>
                    )}

                    {isZalo && (
                      <div className="space-y-2">
                        <Label htmlFor="zalo-number" className="text-sm text-slate-200">
                          Số điện thoại Zalo
                        </Label>
                        <Input
                          id="zalo-number"
                          placeholder="0xxxxxxxxx"
                          value={zaloNumber}
                          onChange={(event) => setZaloNumber(event.target.value)}
                        />
                        <p className="text-xs text-slate-500">
                          Sử dụng số đăng ký Zalo hoặc OA ID để bot kết nối khi gửi tín hiệu.
                        </p>
                      </div>
                    )}

                    {isEmail && (
                      <div className="space-y-2">
                        <Label htmlFor="notify-email-field" className="text-sm text-slate-200">
                          Địa chỉ email nhận thông báo
                        </Label>
                        <Input
                          id="notify-email-field"
                          type="email"
                          placeholder="user@domain.com"
                          value={emailAddress}
                          onChange={(event) => setEmailAddress(event.target.value)}
                        />
                        <p className="text-xs text-slate-500">
                          Đảm bảo email khớp với tài khoản bạn đang sử dụng.
                        </p>
                        <p className="text-xs text-purple-300">
                          Sau khi đăng ký, một mã OTP 6 chữ số sẽ được gửi tới email này. Mã chỉ hiệu lực 2 phút.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 space-y-4 rounded-lg border border-slate-700/30 bg-slate-800/40 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="notify-symbols" className="text-sm text-slate-200">
                      Mã cổ phiếu muốn nhận thông báo
                    </Label>
                    <Input
                      id="notify-symbols"
                      placeholder="VD: VNM, FPT"
                      value={symbolCodes}
                      onChange={(event) => setSymbolCodes(event.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Tách từng mã bằng dấu phẩy. Khi để trống, hệ thống áp dụng cho toàn bộ mã thuộc license của bạn.
                    </p>
                    {availableSymbolCodes.length > 0 && (
                      <p className="text-xs text-cyan-400">
                        Bạn đang sở hữu: {availableSymbolCodes.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-slate-900/40 p-3">
                    <div>
                      <Label className="text-sm text-slate-200">
                        Đặt làm kênh mặc định
                      </Label>
                      <p className="text-xs text-slate-500">
                        Sử dụng kênh này cho tín hiệu TradingView và cảnh báo quan trọng.
                      </p>
                    </div>
                    <Switch
                      checked={isPrimary}
                      onCheckedChange={(checked) => setIsPrimary(checked)}
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>

                  {formError && (
                    <p className="text-sm text-red-400">{formError}</p>
                  )}

                  {formSuccess && (
                    <p className="text-sm text-emerald-400">{formSuccess}</p>
                  )}

                  <Button
                    onClick={handleRegisterNotification}
                    disabled={isMutating || !accessToken}
                    className="w-full bg-purple-600 text-white hover:bg-purple-500"
                  >
                    {isMutating ? "Đang xử lý..." : "Đăng ký nhận thông báo"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-slate-700/30 bg-slate-700/30 p-4">
                <Label className="flex items-center gap-2 text-base text-slate-200">
                  <Bell className="h-4 w-4 text-purple-300" />
                  Kênh đã đăng ký
                </Label>

                {isFetching ? (
                  <p className="text-sm text-slate-400">Đang tải danh sách kênh…</p>
                ) : endpoints.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Bạn chưa đăng ký kênh nhận thông báo nào.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {endpoints.map((endpoint) => {
                      const symbols = readDetailArray(endpoint.details, "symbols");
                      const username = readDetailString(
                        endpoint.details,
                        "username"
                      );

                      return (
                        <div
                          key={endpoint.endpoint_id}
                          className="flex flex-col gap-3 rounded-lg border border-slate-600/40 bg-slate-800/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-purple-500/20 text-purple-200 uppercase">
                                {endpoint.channel}
                              </Badge>
                              {endpoint.is_primary && (
                                <Badge className="bg-emerald-500/20 text-emerald-200">
                                  Mặc định
                                </Badge>
                              )}
                              <Badge
                                className={
                                  endpoint.verified
                                    ? "bg-emerald-500/20 text-emerald-200"
                                    : "bg-red-500/20 text-red-200"
                                }
                              >
                                {endpoint.verified ? "Đã xác thực" : "Chưa xác thực"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-200">
                              Địa chỉ:{" "}
                              <span className="font-semibold text-white">
                                {endpoint.address}
                              </span>
                            </p>
                            {username && (
                              <p className="text-xs text-slate-400">
                                Username: {username}
                              </p>
                            )}
                            {symbols.length > 0 && (
                              <p className="text-xs text-slate-400">
                                Mã đăng ký: {symbols.join(", ")}
                              </p>
                            )}
                            <p className="text-xs text-slate-500">
                              Tạo lúc: {new Date(endpoint.created_at).toLocaleString("vi-VN")}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {!endpoint.is_primary && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isMutating}
                                onClick={() => handleSetPrimary(endpoint.endpoint_id)}
                              >
                                Đặt mặc định
                              </Button>
                            )}
                            {!endpoint.verified && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isMutating}
                                onClick={() => handleVerifyEndpoint(endpoint)}
                              >
                                Xác thực
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isMutating}
                              onClick={() => handleDeleteEndpoint(endpoint.endpoint_id)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-700/30 p-3">
                  <div>
                    <Label className="text-slate-300">Thông báo gia hạn</Label>
                    <p className="text-xs text-slate-400">
                      Nhận thông báo khi dịch vụ sắp hết hạn
                    </p>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple-500" />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-700/30 p-3">
                  <div>
                    <Label className="text-slate-300">Thông báo giao dịch</Label>
                    <p className="text-xs text-slate-400">
                      Nhận thông báo khi bot thực hiện giao dịch
                    </p>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple-500" />
                </div>

                <div className="flex items-center   justify-between rounded-lg border border-slate-700/30 bg-slate-700/30 p-3">
                  <div>
                    <Label className="text-slate-300">Thông báo nạp tiền</Label>
                    <p className="text-xs text-slate-400">
                      Cập nhật trạng thái nạp rút tài khoản
                    </p>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple-500" />
                </div>
              </div>
            </div>
          </UiTabsContent>

          <UiTabsContent
            value="security"
            className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-800/40 to-slate-700/40 p-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-700/30 p-3">
                <div>
                  <Label className="text-slate-300">Xác thực 2 yếu tố</Label>
                  <p className="text-xs text-slate-400">
                    Bảo vệ tài khoản bằng OTP
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                >
                  Kích hoạt
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-700/30 p-3">
                <div>
                  <Label className="text-slate-300">Đổi mật khẩu</Label>
                  <p className="text-xs text-slate-400">
                    Cập nhật mật khẩu đăng nhập
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-400/30 text-slate-400 hover:bg-slate-700/30"
                >
                  Thay đổi
                </Button>
              </div>
            </div>
          </UiTabsContent>
        </UiTabs>
        <Dialog
          open={emailVerification.open}
          onOpenChange={(open) => {
            if (!open) {
              closeEmailVerificationModal();
            }
          }}
        >
          <DialogContent className="bg-slate-900 border border-slate-700 text-white sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Xác thực email</DialogTitle>
              <DialogDescription className="text-slate-400">
                Nhập mã OTP 6 chữ số được gửi tới{" "}
                <span className="font-semibold text-slate-200">
                  {emailVerification.endpoint?.address}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="text-center">
                <p className="text-sm text-slate-300">
                  Mã sẽ hết hạn sau{" "}
                  <span className="font-semibold text-purple-300">
                    {countdownLabel}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  Nếu chưa nhận được email, hãy kiểm tra hộp thư rác hoặc gửi lại mã.
                </p>
              </div>

              <InputOTP
                value={emailOtp}
                onChange={(value) =>
                  setEmailOtp(value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                maxLength={6}
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={`otp-slot-${index}`}
                      index={index}
                      className="h-12 w-12 rounded-lg border border-slate-600/60 bg-slate-800/80 text-xl font-semibold text-white shadow-inner shadow-purple-500/10 data-[active=true]:border-purple-400 data-[active=true]:ring-2 data-[active=true]:ring-purple-500/40"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <div className="flex flex-col gap-2 text-center">
                {emailVerifyError && (
                  <p className="text-sm text-red-400">{emailVerifyError}</p>
                )}
                {emailVerifySuccess && (
                  <p className="text-sm text-emerald-400">
                    {emailVerifySuccess}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="w-full border-purple-400/50 text-purple-200 hover:bg-purple-500/10 sm:w-auto"
                onClick={handleResendEmailOtp}
                disabled={!canResendOtp || isMutating}
              >
                {canResendOtp
                  ? "Gửi lại mã"
                  : `Gửi lại sau ${countdownLabel}`}
              </Button>
              <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600/60 text-slate-300 hover:bg-slate-700/60"
                  onClick={closeEmailVerificationModal}
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  className="bg-purple-600 text-white hover:bg-purple-500"
                  disabled={emailOtp.trim().length !== 6 || isMutating}
                  onClick={handleSubmitEmailVerification}
                >
                  Xác thực
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UiTabsContent>
  );
}
