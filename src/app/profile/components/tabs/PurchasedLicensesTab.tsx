"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertCircle
} from "lucide-react";
import { PurchasedLicense } from "@/types";

interface PurchasedLicensesTabProps {
  licenses: PurchasedLicense[];
  onToggleAutoRenew: (licenseId: string, currentValue: boolean) => void;
  loading?: boolean;
}

export default function PurchasedLicensesTab({
  licenses,
  onToggleAutoRenew,
  loading = false,
}: PurchasedLicensesTabProps) {
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

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
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
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">Các mã đã mua</h2>
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
          {licenses.map((license) => (
            <Card
              key={license.license_id}
              className={cn(
                "bg-gradient-to-br from-slate-800/40 to-slate-700/40 border backdrop-blur-sm transition-all",
                license.is_active && license.status === "active"
                  ? "border-blue-400/20 hover:border-blue-400/40"
                  : "border-slate-400/20 hover:border-slate-400/30 opacity-75"
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
                          : "bg-gradient-to-br from-slate-500/20 to-gray-500/20 border border-slate-400/30"
                      )}
                    >
                      <ShoppingBag
                        className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6",
                          license.is_active && license.status === "active"
                            ? "text-emerald-400"
                            : "text-slate-400"
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
                      <div className="p-2.5 sm:p-3 bg-slate-700/20 rounded-lg">
                        <p className="text-xs sm:text-sm text-slate-400 mb-1">Thời hạn</p>
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
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white">
                            Tự động gia hạn
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            Tự động gia hạn khi sắp hết hạn (12 giờ trước)
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
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </TabsContent>
  );
}
