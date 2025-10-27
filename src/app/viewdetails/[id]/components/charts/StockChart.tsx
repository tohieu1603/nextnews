"use client";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  Clock,
  Maximize2,
  Volume2,
  Bot,
  Play,
  Zap,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StockChartProps {
  stockCode: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

export function StockChart({
  stockCode,
  currentPrice,
  change,
  changePercent,
  isPositive,
}: StockChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("");

  // Mock chart data based on timeframe
  const chartData = [
    { time: "09:00", price: 52.1 },
    { time: "10:00", price: 52.3 },
    { time: "11:00", price: 52.8 },
    { time: "12:00", price: 52.5 },
    { time: "13:00", price: 53.2 },
    { time: "14:00", price: 53.7 },
    { time: "15:00", price: parseFloat(currentPrice.replace(",", "")) },
  ];

  // Mock technical data
  const technicalData = {
    rsi: "67.2",
    macd: "0.24",
    support: "52.8",
    resistance: "54.5",
    volume: "1.2M",
    avgVolume: "980K",
  };

  // Mock bot trading history
  const botTradingHistory = [
    {
      id: 1,
      action: "BUY",
      price: "52.3",
      quantity: 100,
      time: "09:15",
      date: "22/01",
      pnl: null,
      status: "filled",
    },
    {
      id: 2,
      action: "SELL",
      price: "53.8",
      quantity: 100,
      time: "10:45",
      date: "22/01",
      pnl: "+150,000",
      status: "filled",
    },
    {
      id: 3,
      action: "BUY",
      price: "53.2",
      quantity: 150,
      time: "13:20",
      date: "22/01",
      pnl: null,
      status: "filled",
    },
    {
      id: 4,
      action: "SELL",
      price: "53.6",
      quantity: 150,
      time: "14:10",
      date: "22/01",
      pnl: "+60,000",
      status: "filled",
    },
    {
      id: 5,
      action: "BUY",
      price: "53.1",
      quantity: 200,
      time: "14:25",
      date: "22/01",
      pnl: null,
      status: "pending",
    },
  ];

  const botPerformance = {
    totalTrades: 8,
    winRate: "75%",
    totalPnL: "+435,000",
    todayPnL: "+210,000",
  };

  const timeframes = [
    {
      id: "short",
      label: "Ngắn hạn",
      description: "1-7 ngày",
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-400/30",
    },
    {
      id: "medium",
      label: "Trung hạn",
      description: "1-4 tuần",
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-500/20 to-indigo-500/20",
      borderColor: "border-blue-400/30",
    },
    {
      id: "long",
      label: "Dài hạn",
      description: "1-6 tháng",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-400/30",
    },
  ];

  return (
    <Card className="bg-slate-800/60 border border-blue-400/30 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Biểu đồ {stockCode}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-cyan-400 border-cyan-400/50 bg-cyan-400/10"
            >
              <Activity className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
            >
              <Maximize2 className="w-4 h-4" /> 
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Cập nhật: 14:32:15</span>
          </div>
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4" />
            <span>Vol: {technicalData.volume}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price Display */}
        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
          <div>
            <div className="text-base text-slate-400 mb-1">Giá hiện tại</div>
            <div className="text-2xl font-bold text-white">{currentPrice}</div>
          </div>
          <div className="text-right">
            <div
              className={`text-lg font-semibold flex items-center gap-2 ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span>
                {change} ({changePercent})
              </span>
            </div>
            <div className="text-sm text-slate-400 mt-1">Phiên hôm nay</div>
          </div>
        </div>
        <div className="relative h-48 bg-slate-700/30 rounded-xl border border-slate-600/50 p-4 overflow-hidden">
          <div className="absolute top-4 bottom-4 left-8 right-8 sm:left-6 sm:right-6 flex items-end justify-around">
            {chartData.map((point, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  index === 0 ? "items-start" : ""
                } ${index === chartData.length - 1 ? "items-end" : ""}`}
              >
                <div
                  className="w-2.5 sm:w-3 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-cyan-400 hover:to-blue-300"
                  style={{ height: `${(point.price - 50) * 4}px` }}
                ></div>
                <span className="text-[10px] sm:text-xs text-slate-500 mt-2 whitespace-nowrap">
                  {point.time}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute top-4 left-4">
            <div className="text-sm text-slate-400">Giá (VNĐ)</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Hỗ trợ</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {technicalData.support}
            </div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Kháng cự</span>
              <Target className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-lg font-bold text-red-400">
              {technicalData.resistance}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <Bot className="w-6 h-6" />
            Chọn khung thời gian giao dịch
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedTimeframe === timeframe.id
                    ? `bg-gradient-to-br ${timeframe.bgColor} ${timeframe.borderColor} shadow-lg`
                    : "bg-slate-700/30 border-slate-600/50 hover:border-slate-500/70"
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-lg font-bold mb-2 ${
                      selectedTimeframe === timeframe.id
                        ? `bg-gradient-to-r ${timeframe.color} bg-clip-text text-transparent`
                        : "text-white"
                    }`}
                  >
                    {timeframe.label}
                  </div>
                  <div className="text-sm text-slate-400">
                    {timeframe.description}
                  </div>
                  {selectedTimeframe === timeframe.id && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-emerald-400 font-medium">
                        Đã chọn
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        {selectedTimeframe && (
          <div className="p-6 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border-2 border-emerald-400/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10 animate-pulse"></div>

            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-white">
                    Bot đang chạy
                  </h4>
                  <Badge className="bg-emerald-500 text-white">
                    <Play className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <p className="text-slate-300 text-sm">
                  Đang phân tích và tối ưu hóa chiến lược giao dịch cho khung
                  thời gian{" "}
                  <span className="text-emerald-400 font-medium">
                    {timeframes
                      .find((t) => t.id === selectedTimeframe)
                      ?.label.toLowerCase()}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div className="text-right">
                  <div className="text-sm text-slate-400">Trạng thái</div>
                  <div className="text-emerald-400 font-bold">Đang xử lý</div>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-slate-600/50 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse w-3/4"></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Phân tích dữ liệu...</span>
              <span>75%</span>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
              <History className="w-6 h-6" />
              Lịch sử giao dịch Bot
            </h4>
            <Badge
              variant="outline"
              className="text-blue-400 border-blue-400/50 bg-blue-400/10"
            >
              Hôm nay
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 text-center">
              <div className="text-sm text-slate-400 mb-1">Tổng lệnh</div>
              <div className="text-base font-bold text-white">
                {botPerformance.totalTrades}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 text-center">
              <div className="text-sm text-slate-400 mb-1">Tỷ lệ thắng</div>
              <div className="text-base font-bold text-emerald-400">
                {botPerformance.winRate}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 text-center">
              <div className="text-sm text-slate-400 mb-1">P&L tổng</div>
              <div className="text-base font-bold text-emerald-400">
                {botPerformance.totalPnL}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 text-center">
              <div className="text-sm text-slate-400 mb-1">P&L hôm nay</div>
              <div className="text-base font-bold text-emerald-400">
                {botPerformance.todayPnL}
              </div>
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-xl border border-slate-600/50 overflow-hidden">
            <div className="p-4 border-b border-slate-600/50">
              <div className="grid grid-cols-6 gap-2 text-base font-medium text-slate-400">
                <div>Lệnh</div>
                <div>Giá</div>
                <div>SL</div>
                <div>Thời gian</div>
                <div>P&L</div>
                <div>Trạng thái</div>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {botTradingHistory.slice(0, 5).map((trade) => (
                <div
                  key={trade.id}
                  className="p-3 border-b border-slate-600/30 last:border-b-0 hover:bg-slate-600/20 transition-colors"
                >
                  <div className="grid grid-cols-6 gap-2 items-center text-base">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          trade.action === "BUY"
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }`}
                      ></div>
                      <span
                        className={`font-medium ${
                          trade.action === "BUY"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {trade.action}
                      </span>
                    </div>

                    <div className="text-white font-medium">{trade.price}</div>

                    <div className="text-slate-300">{trade.quantity}</div>

                    <div className="text-slate-400 text-base">
                      <span>{trade.time}</span> -{" "}
                      <span className="text-slate-500">{trade.date}</span>
                    </div>

                    <div
                      className={`font-medium ${
                        trade.pnl?.startsWith("+")
                          ? "text-emerald-400"
                          : trade.pnl?.startsWith("-")
                          ? "text-red-400"
                          : "text-slate-400"
                      }`}
                    >
                      {trade.pnl || "-"}
                    </div>

                    <div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          trade.status === "filled"
                            ? "text-emerald-400 border-emerald-400/50 bg-emerald-400/10"
                            : "text-yellow-400 border-yellow-400/50 bg-yellow-400/10"
                        }`}
                      >
                        {trade.status === "filled" ? "Đã khớp" : "Chờ khớp"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-600/50 bg-slate-600/20">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-black border-cyan-400/30 hover:bg-cyan-500/20 hover:text-white"
              >
                Xem tất cả giao dịch
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
