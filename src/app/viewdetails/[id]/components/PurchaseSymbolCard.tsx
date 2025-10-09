"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bot, Zap, ShoppingCart, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { SymbolAccessCheckResponse } from "@/types";
import PurchaseDialog from "./PurchaseDialog";

interface PurchaseSymbolCardProps {
  symbolId: number;
  symbolName: string;
  price?: number;
}

export default function PurchaseSymbolCard({
  symbolId,
  symbolName,
  price = 200000,
}: PurchaseSymbolCardProps) {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [accessInfo, setAccessInfo] = useState<SymbolAccessCheckResponse | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [showOwnedConfirm, setShowOwnedConfirm] = useState(false);

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const checkSymbolAccess = useAuthStore((state) => state.checkSymbolAccess);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDateTime = (isoDate?: string | null): string | null => {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  const fetchAccessInfo = useCallback(async () => {
    if (!isLoggedIn) {
      setAccessInfo(null);
      setAccessError(null);
      return;
    }

    setLoadingAccess(true);
    setAccessError(null);
    try {
      const response = await checkSymbolAccess(symbolId);
      if (!response) {
        setAccessInfo(null);
        setAccessError("Không kiểm tra được quyền truy cập. Vui lòng thử lại sau.");
        return;
      }
      setAccessInfo(response);
    } catch (error) {
      console.error("Failed to fetch symbol access info:", error);
      setAccessInfo(null);
      setAccessError("Không tải được thông tin quyền truy cập.");
    } finally {
      setLoadingAccess(false);
    }
  }, [checkSymbolAccess, isLoggedIn, symbolId]);

  useEffect(() => {
    fetchAccessInfo();
  }, [fetchAccessInfo]);

  const handlePurchaseClick = () => {
    if (accessInfo?.has_access) {
      setShowOwnedConfirm(true);
      return;
    }

    setShowPurchaseDialog(true);
  };

  const renderAccessStatus = () => {
    if (!isLoggedIn) {
      return (
        <div className="mt-3 text-xs text-amber-300">
          Đăng nhập để mua và kiểm tra quyền truy cập bot.
        </div>
      );
    }

    if (loadingAccess) {
      return (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
          Đang kiểm tra quyền truy cập của bạn...
        </div>
      );
    }

    if (accessError) {
      return (
        <div className="mt-3 p-3 rounded-lg border border-red-400/30 bg-red-500/10 text-xs text-red-300">
          {accessError}
        </div>
      );
    }

    if (accessInfo?.has_access) {
      const endLabel = accessInfo.is_lifetime
        ? "Trọn đời"
        : formatDateTime(accessInfo.end_at);
      const startLabel = formatDateTime(accessInfo.start_at);
      const wrapperClasses = accessInfo.expires_soon
        ? "border-amber-400/40 bg-amber-500/10"
        : "border-emerald-400/40 bg-emerald-500/10";
      const statusLabel = accessInfo.is_lifetime
        ? "Quyền truy cập trọn đời đang hoạt động."
        : accessInfo.expires_soon
          ? "Quyền truy cập sắp hết hạn, bạn có thể gia hạn để tránh gián đoạn."
          : "Quyền truy cập đang hoạt động.";

      return (
        <div className={`mt-3 p-4 rounded-lg border ${wrapperClasses}`}>
          <div className="text-sm font-semibold text-white">
            Bạn đã mua mã này.
          </div>
          <div className="mt-1 text-xs text-slate-200 space-y-1">
            {startLabel && (
              <div>Bắt đầu từ: <span className="text-emerald-200">{startLabel}</span></div>
            )}
            <div>
              Hết hạn:{" "}
              <span className={accessInfo.expires_soon ? "text-amber-300 font-semibold" : "text-emerald-200"}>
                {endLabel ?? "Chưa xác định"}
              </span>
            </div>
            <div className="text-slate-300">{statusLabel}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-3 text-xs text-slate-300">
        Bạn chưa mua mã này. Nhấn Mua ngay để kích hoạt tín hiệu bot.
      </div>
    );
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-400/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Mã nhận tín hiệu Bot - {symbolName}
                </h3>
                <p className="text-slate-300 text-sm mt-1">
                  Nhận tín hiệu giao dịch tự động từ AI cho mã {symbolName}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-emerald-400 font-bold text-lg">
                    {formatCurrency(price)} đ
                  </span>
                  <span className="text-slate-400 text-sm">/ 30 ngày</span>
                </div>
                {renderAccessStatus()}
              </div>
            </div>

            <Button
              onClick={handlePurchaseClick}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Mua ngay
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-emerald-400/20">
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-lg">24/7</div>
              <div className="text-slate-400 text-xs">Hoạt động liên tục</div>
            </div>
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-lg">AI</div>
              <div className="text-slate-400 text-xs">Phân tích thông minh</div>
            </div>
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-lg">Real-time</div>
              <div className="text-slate-400 text-xs">Tín hiệu tức thời</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Dialog */}
      <PurchaseDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
        symbolId={symbolId}
        symbolName={symbolName}
        price={price}
        licenseDays={30}
        existingAccess={accessInfo}
        onPurchaseSuccess={fetchAccessInfo}
      />

      {accessInfo?.has_access && (
        <AlertDialog open={showOwnedConfirm} onOpenChange={setShowOwnedConfirm}>
          <AlertDialogContent className="bg-slate-800 border border-emerald-400/30 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Gia hạn mã {symbolName}?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300 space-y-1">
                <p>Bạn đã sở hữu quyền truy cập cho mã này.</p>
                {accessInfo.is_lifetime ? (
                  <p>Gói hiện tại là trọn đời. Bạn vẫn muốn mua thêm gói 30 ngày?</p>
                ) : (
                  <>
                    <p>
                      Thời gian hết hạn hiện tại:{" "}
                      <span className={accessInfo.expires_soon ? "text-amber-300 font-semibold" : "text-emerald-200"}>
                        {formatDateTime(accessInfo.end_at) ?? "chưa xác định"}
                      </span>
                    </p>
                    <p>Mua thêm sẽ gia hạn thêm 30 ngày kể từ thời điểm hệ thống kích hoạt.</p>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-slate-300 border-slate-600 hover:bg-slate-700">
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowOwnedConfirm(false);
                  setShowPurchaseDialog(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                Tiếp tục mua
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
