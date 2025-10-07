"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  QrCode,
  Clock,
  Copy,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/components/ui/utils";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbolId: number;
  symbolName: string;
  price: number;
  licenseDays: number;
}

type PurchaseStep =
  | "confirm"
  | "processing"
  | "insufficient_balance"
  | "payment_qr"
  | "success"
  | "error";

export default function PurchaseDialog({
  open,
  onOpenChange,
  symbolId,
  symbolName,
  price,
  licenseDays,
}: PurchaseDialogProps) {
  const { wallet, fetchWallet, purchaseSymbol, paySymbolOrderWithSepay, paySymbolOrderWithTopup, checkPaymentIntentStatus } = useAuthStore();
  const [step, setStep] = useState<PurchaseStep>("confirm");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [shortage, setShortage] = useState(0);
  const [qrData, setQrData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 20; // Max ~100 seconds of polling

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Reset when dialog closes
  const handleClose = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setStep("confirm");
    setOrderId(null);
    setIntentId(null);
    setShortage(0);
    setQrData(null);
    setError(null);
    setRetryCount(0);
    onOpenChange(false);
  };

  // Handle purchase with wallet
  const handlePurchase = async () => {
    setStep("processing");
    setError(null);

    try {
      const result = await purchaseSymbol({
        symbolId,
        price,
        licenseDays,
        paymentMethod: "wallet",
        description: `Mua mã ${symbolName} - ${licenseDays} ngày`,
      });

      if (!result) {
        throw new Error("Không thể tạo đơn hàng");
      }

      setOrderId(result.order_id);

      if (result.insufficient_balance) {
        // Thiếu tiền
        setShortage(result.shortage || 0);
        setStep("insufficient_balance");
      } else if (result.status === "paid") {
        // Thành công
        setStep("success");
        await fetchWallet(); // Refresh wallet
      } else {
        // Pending payment
        setStep("error");
        setError(result.message || "Đơn hàng đang chờ thanh toán");
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      setStep("error");
      setError(err.message || "Có lỗi xảy ra khi mua mã");
    }
  };

  // Handle pay with SePay (when insufficient balance)
  const handlePayWithSepay = async () => {
    if (!orderId) return;

    setStep("processing");
    setError(null);

    try {
      // Try pay-sepay first (full amount payment)
      let result = await paySymbolOrderWithSepay(orderId);

      // If failed, try alternative topup-sepay (shortage amount only)
      if (!result) {
        console.warn("⚠️ pay-sepay failed, trying topup-sepay alternative...");
        result = await paySymbolOrderWithTopup(orderId);
      }

      if (!result) {
        throw new Error("Không thể tạo thanh toán SePay. Backend có thể chưa implement endpoint này.");
      }

      setQrData(result);
      setIntentId(result.intent_id);
      setStep("payment_qr");
      startPollingIntentStatus(result.intent_id);
    } catch (err: any) {
      console.error("SePay payment error:", err);
      setStep("error");
      setError(err.message || "Có lỗi xảy ra khi tạo thanh toán. Vui lòng liên hệ admin.");
    }
  };

  // Poll payment intent status
  const startPollingIntentStatus = (intentIdToCheck: string) => {
    // Clear existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Reset retry count
    setRetryCount(0);

    // Poll every 5 seconds
    const interval = setInterval(async () => {
      setRetryCount((prev) => {
        const newCount = prev + 1;

        // Stop polling after MAX_RETRIES
        if (newCount > MAX_RETRIES) {
          console.warn(`⚠️ Stopped polling after ${MAX_RETRIES} attempts`);
          clearInterval(interval);
          setPollingInterval(null);
          setStep("error");
          setError("Đã hết thời gian chờ thanh toán. Vui lòng kiểm tra lại lịch sử giao dịch.");
          return newCount;
        }

        return newCount;
      });

      const status = await checkPaymentIntentStatus(intentIdToCheck);

      // If backend returns null (404/500 error), continue polling
      if (!status) {
        console.warn("⚠️ Payment status check returned null, will retry...");
        return;
      }

      // Check if payment succeeded
      if (status.status === "succeeded" || status.status === "paid") {
        setStep("success");
        clearInterval(interval);
        setPollingInterval(null);
        setRetryCount(0);
        await fetchWallet();
      } else if (status.status === "failed" || status.status === "cancelled") {
        setStep("error");
        setError(status.message || "Thanh toán thất bại");
        clearInterval(interval);
        setPollingInterval(null);
        setRetryCount(0);
      }
    }, 5000);

    setPollingInterval(interval);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-md">
        {/* CONFIRM STEP */}
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Xác nhận mua mã
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Bạn đang mua mã nhận tín hiệu cho {symbolName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã:</span>
                  <span className="text-white font-semibold">{symbolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời hạn:</span>
                  <span className="text-white">{licenseDays} ngày</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-600 pt-3">
                  <span className="text-white">Tổng cộng:</span>
                  <span className="text-emerald-400">{formatCurrency(price)} đ</span>
                </div>
              </div>

              {wallet && (
                <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-400/30">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Số dư ví:</span>
                    <span className={cn(
                      "font-bold",
                      wallet.balance >= price ? "text-emerald-400" : "text-red-400"
                    )}>
                      {formatCurrency(wallet.balance)} đ
                    </span>
                  </div>
                  {wallet.balance < price && (
                    <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Số dư không đủ, bạn sẽ được chuyển sang thanh toán SePay
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Hủy
              </Button>
              <Button
                onClick={handlePurchase}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Xác nhận mua
              </Button>
            </DialogFooter>
          </>
        )}

        {/* PROCESSING STEP */}
        {step === "processing" && (
          <>
            <DialogHeader>
              <DialogTitle>Đang xử lý...</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
              <p className="text-slate-400 mt-4">Vui lòng đợi...</p>
            </div>
          </>
        )}

        {/* INSUFFICIENT BALANCE STEP */}
        {step === "insufficient_balance" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Số dư không đủ
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Ví của bạn không đủ để hoàn tất giao dịch
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-400/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Số dư hiện tại:</span>
                  <span className="text-white">{formatCurrency(wallet?.balance || 0)} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cần thanh toán:</span>
                  <span className="text-white">{formatCurrency(price)} đ</span>
                </div>
                <div className="flex justify-between font-bold border-t border-red-400/30 pt-2">
                  <span className="text-red-400">Thiếu:</span>
                  <span className="text-red-400">{formatCurrency(shortage)} đ</span>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
                <p className="text-sm text-slate-300">
                  Bạn có thể thanh toán toàn bộ {formatCurrency(price)} đ qua SePay bằng QR code
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Hủy
              </Button>
              <Button
                onClick={handlePayWithSepay}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Thanh toán ngay
              </Button>
            </DialogFooter>
          </>
        )}

        {/* PAYMENT QR STEP */}
        {step === "payment_qr" && qrData && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-400" />
                Quét mã QR để thanh toán
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Quét mã QR bên dưới để thanh toán {formatCurrency(qrData.amount)} đ
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-white rounded-lg p-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrData.qr_code_url}
                    alt="QR Code thanh toán"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mã đơn hàng:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-xs">{qrData.order_code}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyText(qrData.order_code)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-600 pt-2">
                  <span className="text-white">Số tiền:</span>
                  <span className="text-emerald-400">{formatCurrency(qrData.amount)} đ</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Hết hạn lúc:</span>
                  <span className="text-amber-400">
                    {new Date(qrData.expires_at).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="text-center p-4 bg-slate-700/20 rounded-lg">
                <div className="flex flex-col items-center gap-2 text-blue-400">
                  <Clock className="w-6 h-6 animate-pulse" />
                  <span className="font-semibold">Đang chờ thanh toán...</span>
                  <span className="text-xs text-slate-400">
                    Hệ thống sẽ tự động kiểm tra khi bạn chuyển khoản
                  </span>
                  {retryCount > 0 && (
                    <span className="text-xs text-slate-500 mt-1">
                      Đang kiểm tra... ({retryCount}/{MAX_RETRIES})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}

        {/* SUCCESS STEP */}
        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Mua mã thành công!
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </div>
              <p className="text-white text-lg font-semibold mb-2">
                Đã kích hoạt mã {symbolName}
              </p>
              <p className="text-slate-400 text-sm text-center">
                Bạn đã có thể nhận tín hiệu bot cho mã này
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={handleClose}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Hoàn tất
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ERROR STEP */}
        {step === "error" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Có lỗi xảy ra
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
              <p className="text-red-400 text-center">
                {error || "Không thể hoàn tất giao dịch"}
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Đóng
              </Button>
              <Button
                onClick={() => setStep("confirm")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Thử lại
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
