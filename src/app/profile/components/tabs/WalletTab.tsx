"use client";

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  QrCode,
  Wallet,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/components/ui/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth.store";
import { TopUpIntent } from "@/types";

export default function WalletTab() {
  const { wallet, fetchWallet, createTopUp, checkTopUpStatus } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);

  // QR Payment States
  const [paymentStatus, setPaymentStatus] = useState<
    "waiting" | "processing" | "success" | "failed" | "expired"
  >("waiting");
  const [topUpData, setTopUpData] = useState<TopUpIntent | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(500000);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Load wallet on mount
  useEffect(() => {
    if (!wallet) {
      fetchWallet();
    }
  }, [wallet, fetchWallet]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Validation function for top-up amounts
  const validateTopUpAmount = (amount: number): string | null => {
    const minTopUp = 5000;
    const maxTopUp = 50000000; // 50 million VND max per transaction

    if (amount < minTopUp) {
      return `Số tiền nạp tối thiểu là ${formatCurrency(minTopUp)} VNĐ`;
    }
    if (amount > maxTopUp) {
      return `Số tiền nạp tối đa là ${formatCurrency(maxTopUp)} VNĐ`;
    }
    if (amount % 1000 !== 0) {
      return "Số tiền nạp phải là bội số của 1,000 VNĐ";
    }
    return null;
  };

  const handleTopUpAmountChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    if (numericValue === "") {
      setTopUpAmount(0);
    } else {
      setTopUpAmount(Number(numericValue));
    }
    setValidationErrors((prev) => ({ ...prev, topUpAmount: "" }));
  };

  const handleTopUp = async () => {
    // Validate the top-up amount before proceeding
    const validationError = validateTopUpAmount(topUpAmount);
    if (validationError) {
      setValidationErrors((prev) => ({
        ...prev,
        topUpAmount: validationError,
      }));
      return;
    }

    // Clear any previous validation errors
    setValidationErrors((prev) => ({ ...prev, topUpAmount: "" }));
    setIsLoading(true);

    try {
      const data = await createTopUp(topUpAmount);
      if (data) {
        setTopUpData(data);
        setShowTopUpDialog(true);
        setPaymentStatus("waiting");
        startPollingStatus(data.intent_id);
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          topUpAmount: "Không thể tạo yêu cầu nạp tiền. Vui lòng thử lại.",
        }));
      }
    } catch (error) {
      console.error("Error creating top-up:", error);
      setValidationErrors((prev) => ({
        ...prev,
        topUpAmount: "Có lỗi xảy ra. Vui lòng thử lại.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const startPollingStatus = (intentId: string) => {
    // Clear existing interval if any
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Poll every 5 seconds
    const interval = setInterval(async () => {
      const status = await checkTopUpStatus(intentId);
      if (!status) return;

      if (status.status === "succeeded") {
        setPaymentStatus("success");
        clearInterval(interval);
        setPollingInterval(null);
        // Refresh wallet balance
        await fetchWallet();
      } else if (status.status === "failed") {
        setPaymentStatus("failed");
        clearInterval(interval);
        setPollingInterval(null);
      } else if (status.is_expired) {
        setPaymentStatus("expired");
        clearInterval(interval);
        setPollingInterval(null);
      } else {
        setPaymentStatus("processing");
      }
    }, 5000);

    setPollingInterval(interval);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCloseDialog = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setShowTopUpDialog(false);
    setPaymentStatus("waiting");
    setTopUpData(null);
  };

  const handleRefreshWallet = async () => {
    setIsLoading(true);
    await fetchWallet();
    setIsLoading(false);
  };

  return (
    <div>
      <TabsContent
        value="wallet"
        className="p-8 pt-12 space-y-6 bg-slate-900/40"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Ví & Nạp tiền
            </h2>
            <p className="text-slate-400">
              Quản lý ví và nạp tiền vào tài khoản
            </p>
          </div>
          <Button
            onClick={handleRefreshWallet}
            disabled={isLoading}
            variant="outline"
            className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
          >
            <RefreshCw
              className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
            />
            Làm mới
          </Button>
        </div>

        {/* Wallet Balance */}
        <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-emerald-400/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              Số dư ví
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-400/30">
              <div className="text-3xl font-bold text-white mb-2">
                {wallet ? formatCurrency(wallet.balance) : "0"} VNĐ
              </div>
              <p className="text-emerald-400 text-sm">Số dư hiện tại</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-sm">Trạng thái</p>
                <p
                  className={cn(
                    "font-semibold",
                    wallet?.status === "active"
                      ? "text-emerald-400"
                      : "text-red-400"
                  )}
                >
                  {wallet?.status === "active" ? "Hoạt động" : "Bị khóa"}
                </p>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-sm">Loại tiền tệ</p>
                <p className="text-white font-semibold">
                  {wallet?.currency || "VND"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Up Section */}
        <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-400" />
              Nạp tiền qua QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">
                Nhập số tiền muốn nạp
              </Label>
              <Input
                type="text"
                value={topUpAmount ? formatCurrency(topUpAmount) : ""}
                onChange={(e) => handleTopUpAmountChange(e.target.value)}
                className={cn(
                  "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 text-lg",
                  validationErrors.topUpAmount && "border-red-400"
                )}
                placeholder="0"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-400">
                  Số tiền tối thiểu: 5,000 VNĐ
                </p>
                {validationErrors.topUpAmount && (
                  <p className="text-red-400 text-xs">
                    {validationErrors.topUpAmount}
                  </p>
                )}
              </div>
            </div>

            {/* Quick amount buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[100000, 500000, 1000000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setTopUpAmount(amount)}
                  className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:text-white font-bold text-base py-5"
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleTopUp}
              disabled={topUpAmount < 5000 || isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white disabled:opacity-50 font-bold py-5 text-base"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <QrCode className="w-6 h-6 mr-2" />
                  Tạo mã QR nạp tiền
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-cyan-400/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              Hướng dẫn nạp tiền
            </h4>
            <div className="text-sm text-slate-400 space-y-1">
              <p>1. Nhập số tiền muốn nạp (tối thiểu 5,000 VNĐ)</p>
              <p>2. Nhấn &quot;Tạo mã QR nạp tiền&quot;</p>
              <p>3. Sử dụng app ngân hàng quét mã QR để thanh toán</p>
              <p>4. Tiền sẽ được cộng vào ví sau 1-5 phút</p>
              <p className="text-amber-400 font-semibold mt-2">
                💡 Hệ thống sẽ tự động kiểm tra và cập nhật số dư khi bạn
                chuyển khoản thành công
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Top-up QR Dialog */}
      <Dialog open={showTopUpDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              Nạp tiền vào ví qua QR Code
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {topUpData
                ? `Quét mã QR bên dưới để nạp ${formatCurrency(topUpData.amount)} VNĐ vào ví`
                : "Đang tạo mã QR..."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* QR Code Display */}
            <div className="flex justify-center">
              {topUpData?.qr_code_url ? (
                <div className="w-64 h-64 bg-white rounded-lg p-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={topUpData.qr_code_url}
                    alt="QR Code nạp tiền"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-12 h-12 text-slate-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Payment Details */}
            {topUpData && (
              <div className="space-y-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="text-white font-semibold">
                    {topUpData.bank_code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-sm">
                      {topUpData.account_number}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleCopyText(topUpData.account_number)
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="text-white text-sm">
                    {topUpData.account_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nội dung CK:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-sm">
                      {topUpData.transfer_content}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleCopyText(topUpData.transfer_content)
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-600 pt-2">
                  <span className="text-white">Số tiền nạp:</span>
                  <span className="text-emerald-400">
                    {formatCurrency(topUpData.amount)} VNĐ
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Hết hạn lúc:</span>
                  <span className="text-amber-400">
                    {new Date(topUpData.expires_at).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className="text-center p-4 bg-slate-700/20 rounded-lg">
              {paymentStatus === "waiting" && (
                <div className="flex flex-col items-center gap-2 text-yellow-400">
                  <Clock className="w-6 h-6 animate-pulse" />
                  <span className="font-semibold">
                    Đang chờ thanh toán...
                  </span>
                  <span className="text-xs text-slate-400">
                    Vui lòng quét mã QR hoặc chuyển khoản theo thông tin trên
                  </span>
                </div>
              )}
              {paymentStatus === "processing" && (
                <div className="flex flex-col items-center gap-2 text-blue-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="font-semibold">Đang xử lý thanh toán...</span>
                  <span className="text-xs text-slate-400">
                    Hệ thống đang kiểm tra giao dịch của bạn
                  </span>
                </div>
              )}
              {paymentStatus === "success" && (
                <div className="flex flex-col items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">
                    Nạp tiền thành công!
                  </span>
                  <span className="text-xs text-slate-400">
                    Số dư đã được cập nhật vào ví của bạn
                  </span>
                </div>
              )}
              {paymentStatus === "failed" && (
                <div className="flex flex-col items-center gap-2 text-red-400">
                  <XCircle className="w-6 h-6" />
                  <span className="font-semibold">Thanh toán thất bại</span>
                  <span className="text-xs text-slate-400">
                    Vui lòng thử lại hoặc liên hệ hỗ trợ
                  </span>
                </div>
              )}
              {paymentStatus === "expired" && (
                <div className="flex flex-col items-center gap-2 text-orange-400">
                  <AlertCircle className="w-6 h-6" />
                  <span className="font-semibold">Đã hết hạn</span>
                  <span className="text-xs text-slate-400">
                    Mã QR đã hết hạn, vui lòng tạo mã mới
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {paymentStatus === "success" ? (
              <Button
                onClick={handleCloseDialog}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Hoàn tất
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Đóng
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
