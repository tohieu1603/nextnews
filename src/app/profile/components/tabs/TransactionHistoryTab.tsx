"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import {
  CreditCard,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { PaymentHistory } from "@/types";

export default function TransactionHistoryTab() {
  const { fetchPaymentHistory } = useAuthStore();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const loadPayments = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const data = await fetchPaymentHistory(currentPage, pageSize);
      if (data) {
        setPayments(data.results);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments(page);
  }, [page]);

  const handleRefresh = () => {
    loadPayments(page);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(total / pageSize);
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const getPurposeLabel = (purpose: string): string => {
    switch (purpose) {
      case "wallet_topup":
        return "Nạp tiền ví";
      case "symbol_purchase":
        return "Mua Symbol/Bot";
      case "order_payment":
        return "Thanh toán đơn hàng";
      default:
        return purpose;
    }
  };

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case "wallet_topup":
        return <Wallet className="w-5 h-5" />;
      case "symbol_purchase":
      case "order_payment":
        return <ShoppingBag className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPurposeColor = (purpose: string): string => {
    switch (purpose) {
      case "wallet_topup":
        return "border-emerald-400/30 text-emerald-400 bg-emerald-400/10";
      case "symbol_purchase":
      case "order_payment":
        return "border-blue-400/30 text-blue-400 bg-blue-400/10";
      default:
        return "border-slate-400/30 text-slate-400 bg-slate-400/10";
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <TabsContent
      value="history"
      className="p-8 pt-12 space-y-6 bg-slate-900/40"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Lịch sử giao dịch
          </h2>
          <p className="text-slate-400">
            Theo dõi lịch sử giao dịch và thanh toán của bạn
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
        >
          <RefreshCw
            className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
          />
          Làm mới
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-purple-400/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="w-6 h-6 text-purple-400" />
            Lịch sử thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && payments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-slate-400 text-lg">
                Chưa có giao dịch nào
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Lịch sử giao dịch của bạn sẽ hiển thị tại đây
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0",
                          getPurposeColor(payment.purpose)
                        )}
                      >
                        {getPurposeIcon(payment.purpose)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-base font-medium">
                          {getPurposeLabel(payment.purpose)}
                        </p>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <span>
                            {new Date(payment.created_at).toLocaleString(
                              "vi-VN"
                            )}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-xs truncate">
                            {payment.order_code}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-white font-semibold whitespace-nowrap">
                        {formatCurrency(payment.amount)} đ
                      </span>
                      <Badge
                        className={cn(
                          "text-xs",
                          payment.status === "succeeded"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30"
                            : payment.status === "processing"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                            : "bg-red-500/20 text-red-400 border-red-400/30"
                        )}
                      >
                        {payment.status === "succeeded"
                          ? "Thành công"
                          : payment.status === "processing"
                          ? "Đang xử lý"
                          : "Thất bại"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-600/30">
                  <div className="text-sm text-slate-400">
                    Hiển thị {(page - 1) * pageSize + 1} -{" "}
                    {Math.min(page * pageSize, total)} trong tổng số {total}{" "}
                    giao dịch
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handlePrevPage}
                      disabled={page === 1 || isLoading}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Trước
                    </Button>
                    <span className="text-sm text-slate-400">
                      Trang {page} / {totalPages}
                    </span>
                    <Button
                      onClick={handleNextPage}
                      disabled={page >= totalPages || isLoading}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                    >
                      Sau
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
