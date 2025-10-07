"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/components/ui/utils";
import { Activity, Bot, CreditCard, Settings, X } from "lucide-react";

import { TradingBot } from "../../types";

interface BotManagementTabProps {
  tradingBots: TradingBot[];
  onBotSettings: (botId: string) => void;
  onBotRenew: (botId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

export default function BotManagementTab({
  tradingBots,
  onBotSettings,
  onBotRenew,
  onCancelOrder,
}: BotManagementTabProps) {
  return (
    <TabsContent
      value="bots"
      className="p-8 pt-12 space-y-6 bg-slate-900/40"
    >
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Quản lý Bot</h2>
        <p className="text-slate-400">
          Theo dõi và quản lý các bot trading của bạn
        </p>
      </div>

      <div className="space-y-4">
        {tradingBots.map((bot) => (
          <Card
            key={bot.id}
            className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20 backdrop-blur-sm"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      bot.status === "active"
                        ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30"
                        : "bg-gradient-to-br from-slate-500/20 to-gray-500/20 border border-slate-400/30"
                    )}
                  >
                    <Bot
                      className={cn(
                        "w-6 h-6",
                        bot.status === "active"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{bot.name}</h3>
                    <p className="text-base text-slate-400">{bot.type}</p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    bot.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30"
                      : "bg-slate-500/20 text-slate-400 border-slate-400/30"
                  )}
                >
                  {bot.status === "active" ? "Hoạt động" : "Tạm dừng"}
                </Badge>
              </div>

              <p className="text-slate-300 text-base mb-4">{bot.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-base text-slate-400">Ngày đăng ký</p>
                  <p className="text-sm text-white">
                    {new Date(bot.subscribedDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-base text-slate-400">Hết hạn</p>
                  <p className="text-sm text-white">
                    {new Date(bot.expiryDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-base text-slate-400">Phí hàng tháng</p>
                  <p className="text-sm text-white">
                    {bot.monthlyFee.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
              </div>

              {bot.openOrders && bot.openOrders.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-white mb-2">
                    Lệnh đang mở ({bot.openOrders.length})
                  </h4>
                  <div className="space-y-2">
                    {bot.openOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            className={cn(
                              "text-xs",
                              order.side === "BUY"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30"
                                : "bg-red-500/20 text-red-400 border-red-400/30"
                            )}
                          >
                            {order.side}
                          </Badge>
                          <span className="text-white font-mono">
                            {order.stockCode}
                          </span>
                          <span className="text-slate-400 text-sm">
                            {order.quantity} @{" "}
                            {order.price.toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={cn(
                              "text-xs",
                              order.status === "PENDING"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                                : order.status === "PARTIAL"
                                ? "bg-blue-500/20 text-blue-400 border-blue-400/30"
                                : "bg-emerald-500/20 text-emerald-400 border-emerald-400/30"
                            )}
                          >
                            {order.status === "PENDING"
                              ? "Chờ"
                              : order.status === "PARTIAL"
                              ? "Khớp 1 phần"
                              : "Đã khớp"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onCancelOrder(order.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => onBotSettings(bot.id)}
                  variant="outline"
                  size="sm"
                  className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:text-blue"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Cài đặt
                </Button>
                <Button
                  onClick={() => onBotRenew(bot.id)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  size="sm"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gia hạn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-400/30 text-slate-700 hover:bg-slate-700/30 hover:text-white"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Thống kê
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  );
}
