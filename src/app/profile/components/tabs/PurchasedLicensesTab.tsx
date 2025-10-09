"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/components/ui/utils";
import { Switch } from "@/components/ui/switch";
import {
  ShoppingBag,
  Calendar,
  CreditCard,
  Infinity,
  RotateCw,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { PurchasedLicense, AutoRenewSubscription } from "@/types";

type PendingAutoRenewAction = "enabling" | "disabling";

interface PurchasedLicensesTabProps {
  licenses: PurchasedLicense[];
  onToggleAutoRenew: (licenseId: string, currentValue: boolean) => Promise<void> | void;
  onEnableAutoRenew: (license: PurchasedLicense) => Promise<void> | void;
  loading?: boolean;
}

export default function PurchasedLicensesTab({
  licenses,
  onToggleAutoRenew,
  onEnableAutoRenew,
  loading = false,
}: PurchasedLicensesTabProps) {
  const [pendingAutoRenew, setPendingAutoRenew] = useState<
    Record<string, PendingAutoRenewAction>
  >({});
  const [enablingAutoRenew, setEnablingAutoRenew] = useState<Record<string, boolean>>({});

  const setPendingAction = (licenseId: string, action: PendingAutoRenewAction) => {
    setPendingAutoRenew((prev) => ({
      ...prev,
      [licenseId]: action,
    }));
  };

  const clearPendingAction = (licenseId: string) => {
    setPendingAutoRenew((prev) => {
      if (!(licenseId in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[licenseId];
      return next;
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "0 VNĐ";
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (license: PurchasedLicense) => {
    if (license.is_lifetime) {
      return (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30">
          <Infinity className="w-3 h-3 mr-1" />
          Vĩnh viễn
        </Badge>
      );
    }

    if (!license.is_active || license.status === "expired") {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
          Hết hạn
        </Badge>
      );
    }

    const daysRemaining = getDaysRemaining(license.end_at);
    if (daysRemaining !== null && daysRemaining <= 7) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          {daysRemaining} ngày còn lại
        </Badge>
      );
    }

    return (
      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30">
        Hoạt động
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "wallet":
        return "Ví";
      case "sepay_transfer":
        return "SePay";
      default:
        return method;
    }
  };

  const getSubscriptionStatusLabel = (
    status: AutoRenewSubscription["status"] | undefined | null,
  ) => {
    if (!status) return "Không xác định";
    switch (status) {
      case "pending_activation":
        return "Đang chờ kích hoạt";
      case "active":
        return "Đang hoạt động";
      case "paused":
        return "Tạm dừng";
      case "suspended":
        return "Bị tạm ngưng";
      case "cancelled":
        return "Đã hủy";
      case "completed":
        return "Đã hoàn tất";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <TabsContent
        value="licenses"
        className="p-8 pt-12 space-y-6 bg-slate-900/40"
      >
        <div className="flex items-center justify-center py-12">
          <RotateCw className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="ml-3 text-slate-400">Đang tải...</span>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent
      value="licenses"
      className="p-4 sm:p-6 lg:p-8 pt-8 sm:pt-10 lg:pt-12 space-y-4 sm:space-y-6 bg-slate-900/40"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">
          Các mã đã mua
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Quản lý các mã trading bot và dịch vụ đã mua
        </p>
      </div>

      {licenses.length === 0 ? (
        <Card className="max-w-7xl mx-auto bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-slate-400/20 backdrop-blur-sm">
          <CardContent className="p-8 sm:p-12 text-center">
            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-slate-300 mb-1.5 sm:mb-2">
              Chưa có mã nào
            </h3>
            <p className="text-sm sm:text-base text-slate-400">
              Bạn chưa mua bất kỳ mã trading bot nào
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
          {licenses.map((license) => {
            const subscription = license.subscription;
            const subscriptionStatus = subscription?.status ?? null;
            const subscriptionId =
              subscription?.subscription_id ?? license.subscription_id ?? null;
            const isSubscriptionTerminated =
              subscriptionStatus === "cancelled" ||
              subscriptionStatus === "completed";
            const hasSubscriptionRecord = Boolean(subscriptionId);
            const canManageExistingSubscription =
              hasSubscriptionRecord && !isSubscriptionTerminated;
            const needsSubscriptionCreation =
              !hasSubscriptionRecord || isSubscriptionTerminated;
            const isAutoRenewActive = Boolean(
              subscription &&
                ((subscription.is_active ?? false) ||
                  subscriptionStatus === "active"),
            );

            const pendingAction = pendingAutoRenew[license.license_id];
            const switchPending = pendingAction !== undefined;
            const isEnabling = Boolean(enablingAutoRenew[license.license_id]);
            const switchChecked = switchPending
              ? pendingAction === "enabling"
              : isAutoRenewActive;
            const showAutoRenewControls =
              !license.is_lifetime &&
              license.is_active &&
              license.status === "active";

            const renewalPrice =
              subscription?.price ??
              license.auto_renew_price ??
              license.purchase_price ??
              0;
            const defaultCycleDays =
              license.license_days && license.license_days > 0
                ? license.license_days
                : 30;

            const handleAutoRenewChange = async (checked: boolean) => {
              if (switchPending || needsSubscriptionCreation) {
                return;
              }

              if (checked) {
                if (!isAutoRenewActive) {
                  setPendingAction(license.license_id, "enabling");
                  try {
                    await onToggleAutoRenew(
                      license.license_id,
                      isAutoRenewActive,
                    );
                  } finally {
                    clearPendingAction(license.license_id);
                  }
                }
              } else if (canManageExistingSubscription && isAutoRenewActive) {
                setPendingAction(license.license_id, "disabling");
                try {
                  await onToggleAutoRenew(license.license_id, isAutoRenewActive);
                } finally {
                  clearPendingAction(license.license_id);
                }
              }
            };

            return (
              <Card
                key={license.license_id}
                className={cn(
                  "bg-gradient-to-br from-slate-800/40 to-slate-700/40 border backdrop-blur-sm transition-all",
                  license.is_active && license.status === "active"
                    ? "border-blue-400/20 hover:border-blue-400/40"
                    : "border-slate-400/20 hover:border-slate-400/30 opacity-75",
                )}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                          license.is_active && license.status === "active"
                            ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30"
                            : "bg-gradient-to-br from-slate-500/20 to-gray-500/20 border border-slate-400/30",
                        )}
                      >
                        <ShoppingBag
                          className={cn(
                            "w-5 h-5 sm:w-6 sm:h-6",
                            license.is_active && license.status === "active"
                              ? "text-emerald-400"
                              : "text-slate-400",
                          )}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-base sm:text-lg truncate">
                          {license.symbol_name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 truncate">
                          Mã license: {license.license_id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(license)}
                  </div>
                  <div className="p-2.5 sm:p-3 bg-slate-700/20 rounded-lg">
                    <p className="text-xs sm:text-sm text-slate-400 mb-1">Thanh toán</p>
                    <p className="text-xs sm:text-sm font-medium text-white truncate">
                      {getPaymentMethodLabel(license.payment_method)}
                    </p>
                  </div>
                </div>

                {/* Auto-renew toggle - only show for non-lifetime active licenses with subscription */}
                {!license.is_lifetime &&
                 license.is_active &&
                 license.status === "active" &&
                 license.subscription && (
                  <div className="mt-3 pt-3 border-t border-slate-600/30">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          license.subscription?.is_active || license.subscription?.status === "active"
                            ? "bg-emerald-500/20"
                            : "bg-slate-600/30"
                        )}>
                          <RotateCw className={cn(
                            "w-4 h-4",
                            license.subscription?.is_active || license.subscription?.status === "active"
                              ? "text-emerald-400"
                              : "text-slate-400"
                          )} />
=======
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div className="p-2.5 sm:p-3 bg-slate-700/20 rounded-lg">
                      <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        Ngày mua
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-white truncate">
                        {formatDate(license.created_at)}
                      </p>
                    </div>

                    {!license.is_lifetime && (
                      <>
                        <div className="p-2.5 sm:p-3 bg-slate-700/20 rounded-lg">
                          <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            Ngày bắt đầu
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-white truncate">
                            {formatDate(license.start_at)}
                          </p>
                        </div>
                        <div className="p-2.5 sm:p-3 bg-slate-700/20 rounded-lg">
                          <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            Hết hạn
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-white truncate">
                            {formatDate(license.end_at)}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={license.subscription?.is_active || license.subscription?.status === "active"}
                        onCheckedChange={(checked) =>
                          onToggleAutoRenew(license.license_id, license.subscription?.is_active || license.subscription?.status === "active")
                        }
                        className="data-[state=checked]:bg-emerald-500 flex-shrink-0 ml-2"
                      />
                    </div>
                    {(license.subscription?.is_active || license.subscription?.status === "active") && (
                      <div className="mt-2 p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-400/20">
                        <p className="text-xs text-emerald-300 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Đảm bảo ví có đủ tiền để tự động gia hạn</span>
                        </p>
                      </div>
                        <div className="p-2.5 sm:p-3 bg-slate-700/20 rounded-lg">
                          <p className="text-xs sm:text-sm text-slate-400 mb-1">
                            Thời hạn
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-white truncate">
                            {license.license_days} ngày
                          </p>
                        </div>
                      </>
                    )}

                    <div className="p-2.5 sm:p-3 bg-slate-700/20 rounded-lg">
                      <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1 mb-1">
                        <CreditCard className="w-3 h-3 flex-shrink-0" />
                        Giá mua
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-white truncate">
                        {formatCurrency(license.purchase_price)}
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 bg-slate-700/20 rounded-lg">
                      <p className="text-xs sm:text-sm text-slate-400 mb-1">Thanh toán</p>
                      <p className="text-xs sm:text-sm font-medium text-white truncate">
                        {getPaymentMethodLabel(license.payment_method)}
                      </p>
                    </div>
                  </div>

                  {showAutoRenewControls && (
                    <div className="mt-3 pt-3 border-t border-slate-600/30">
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                              switchChecked
                                ? "bg-emerald-500/20"
                                : "bg-slate-600/30",
                            )}
                          >
                            <RotateCw
                              className={cn(
                                "w-4 h-4",
                                switchChecked
                                  ? "text-emerald-400"
                                  : "text-slate-400",
                              )}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white">
                              Tự động gia hạn
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              Gia hạn trước khi hết hạn 12 giờ
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={switchChecked}
                          disabled={switchPending || needsSubscriptionCreation}
                          onCheckedChange={(checked) =>
                            void handleAutoRenewChange(checked)
                          }
                          className="data-[state=checked]:bg-emerald-500 flex-shrink-0 ml-2"
                        />
                      </div>

                      {switchPending && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-300" />
                          {pendingAction === "enabling"
                            ? "Đang bật tự động gia hạn..."
                            : "Đang tắt tự động gia hạn..."}
                        </div>
                      )}

                      {needsSubscriptionCreation ? (
                        <div className="mt-2 space-y-3">
                          <div className="p-2.5 bg-slate-700/40 rounded-lg border border-slate-600/40">
                            <p className="text-xs text-slate-300 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>
                                License này chưa đăng ký tự động gia hạn. Bạn có thể bật ngay tại đây.
                              </span>
                            </p>
                          </div>
                          <Button
                            onClick={async () => {
                              if (isEnabling) return;
                              setEnablingAutoRenew((prev) => ({
                                ...prev,
                                [license.license_id]: true,
                              }));
                              try {
                                await onEnableAutoRenew(license);
                              } finally {
                                setEnablingAutoRenew((prev) => {
                                  const next = { ...prev };
                                  delete next[license.license_id];
                                  return next;
                                });
                              }
                            }}
                            disabled={isEnabling}
                            className="bg-emerald-500 hover:bg-emerald-500/90 text-slate-900 font-semibold"
                          >
                            {isEnabling ? (
                              <span className="flex items-center gap-2 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" /> Đang bật tự động gia hạn...
                              </span>
                            ) : (
                              "Bật tự động gia hạn"
                            )}
                          </Button>
                          <p className="text-[11px] text-slate-400">
                            Hệ thống sẽ dùng giá {formatCurrency(renewalPrice)} mỗi {defaultCycleDays} ngày và trừ ví trước hạn 12 giờ.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-3">
                          {switchChecked && (
                            <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-400/20">
                              <p className="text-xs text-emerald-300 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>
                                  Đảm bảo ví có đủ tiền để tự động gia hạn
                                </span>
                              </p>
                              <p className="mt-1 text-[11px] text-emerald-200">
                                Khi gia hạn thành công, thời hạn license hiện tại được kéo dài thêm chu kỳ mới.
                              </p>
                            </div>
                          )}

                          {subscription && (
                            <div className="grid gap-2 sm:grid-cols-2">
                              {typeof subscription.price === "number" && (
                                <div className="rounded-lg border border-slate-600/30 bg-slate-700/30 p-2.5">
                                  <p className="text-xs text-slate-400 mb-1">Giá gia hạn</p>
                                  <p className="text-sm font-medium text-white">
                                    {formatCurrency(subscription.price)}
                                  </p>
                                </div>
                              )}
                              {typeof subscription.cycle_days === "number" && (
                                <div className="rounded-lg border border-slate-600/30 bg-slate-700/30 p-2.5">
                                  <p className="text-xs text-slate-400 mb-1">Chu kỳ gia hạn</p>
                                  <p className="text-sm font-medium text-white">
                                    {subscription.cycle_days} ngày
                                  </p>
                                </div>
                              )}
                              {subscription.next_billing_at && (
                                <div className="rounded-lg border border-slate-600/30 bg-slate-700/30 p-2.5">
                                  <p className="text-xs text-slate-400 mb-1">Lần gia hạn tiếp theo</p>
                                  <p className="text-sm font-medium text-white">
                                    {formatDateTime(subscription.next_billing_at)}
                                  </p>
                                </div>
                              )}
                              {subscription.last_success_at && (
                                <div className="rounded-lg border border-slate-600/30 bg-slate-700/30 p-2.5">
                                  <p className="text-xs text-slate-400 mb-1">Gia hạn gần nhất</p>
                                  <p className="text-sm font-medium text-white">
                                    {formatDateTime(subscription.last_success_at)}
                                  </p>
                                </div>
                              )}
                              <div className="rounded-lg border border-slate-600/30 bg-slate-700/30 p-2.5 sm:col-span-2">
                                <p className="text-xs text-slate-400 mb-1">Trạng thái</p>
                                <p className="text-sm font-medium text-white">
                                  {getSubscriptionStatusLabel(subscription.status)}
                                </p>
                              </div>
                              {typeof subscription.consecutive_failures === "number" &&
                                subscription.consecutive_failures > 0 && (
                                  <div className="rounded-lg border border-amber-600/40 bg-amber-500/10 p-2.5 sm:col-span-2">
                                    <p className="text-xs text-amber-200 mb-1">Cảnh báo</p>
                                    <p className="text-sm text-amber-100">
                                      Có {subscription.consecutive_failures} lần gia hạn thất bại liên tiếp. Vui lòng kiểm tra số dư ví.
                                    </p>
                                  </div>
                                )}
                            </div>
                          )}

                          {!switchChecked && (
                            <div className="p-2.5 bg-slate-700/40 rounded-lg border border-slate-600/40">
                              <p className="text-xs text-slate-300">
                                Tự động gia hạn đang tắt. Bật lại để hệ thống tiếp tục gia hạn khi license sắp hết hạn.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </TabsContent>
  );
}
