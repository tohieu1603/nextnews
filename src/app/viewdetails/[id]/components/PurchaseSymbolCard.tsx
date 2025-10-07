"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Zap, ShoppingCart, Loader2 } from "lucide-react";
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount);
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
              </div>
            </div>

            <Button
              onClick={() => setShowPurchaseDialog(true)}
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
      />
    </>
  );
}
