"use client";
import { useState } from "react";
import { useSymbolStore } from "@/store/symbol.store";
import Link from "next/link";
import {
  Zap,
  TrendingUp,
  Target,
  ArrowRight,
  BarChart3,
  Sparkles,
  Lightbulb,
  Brain,
  Rocket,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Simplified bot suggestions
const botSuggestions = [
  {
    id: "momentum-hunter",
    name: "Momentum Hunter Bot",
    icon: <Rocket className="w-6 h-6" />,
    description: "Săn lùng cổ phiếu có momentum mạnh",
    picks: ["HPG", "TCB", "YTC"],
    performance: "+18.4%",
    confidence: 89,
    timeframe: "1-2 tuần",
    strategy: "Theo đuổi xu hướng tăng mạnh với volume cao",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "value-seeker",
    name: "Value Seeker Bot",
    icon: <Target className="w-6 h-6" />,
    description: "Tìm kiếm cổ phiếu được định giá thấp",
    picks: ["GAS", "VIC", "MSN"],
    performance: "+12.7%",
    confidence: 85,
    timeframe: "2-3 tháng",
    strategy: "Đầu tư giá trị dài hạn với P/E thấp",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "dividend-collector",
    name: "Dividend Collector Bot",
    icon: <BarChart3 className="w-6 h-6" />,
    description: "Thu thập cổ tức ổn định cao",
    picks: ["GAS", "YTC", "TCB"],
    performance: "+9.8%",
    confidence: 92,
    timeframe: "3-6 tháng",
    strategy: "Tập trung cổ phiếu cổ tức cao >8%",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "breakout-trader",
    name: "Breakout Trader Bot",
    icon: <TrendingUp className="w-6 h-6" />,
    description: "Giao dịch đột phá kỹ thuật",
    picks: ["HPG", "POW", "TCB"],
    performance: "+22.1%",
    confidence: 87,
    timeframe: "1-4 tuần",
    strategy: "Breakout các mức kháng cự quan trọng",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "sector-rotation",
    name: "Sector Rotation Bot",
    icon: <Brain className="w-6 h-6" />,
    description: "Luân chuyển ngành theo chu kỳ",
    picks: ["Banking", "Steel", "Energy"],
    performance: "+15.3%",
    confidence: 83,
    timeframe: "1-2 tháng",
    strategy: "Theo dõi luân chuyển vốn giữa các ngành",
    color: "from-indigo-500 to-purple-500",
  },
];

const stockOptions = [
  { code: "YTC", name: "Vietcombank", sector: "Banking" },
  { code: "TCB", name: "Techcombank", sector: "Banking" },
  { code: "HPG", name: "Hoa Phat Group", sector: "Steel" },
  { code: "MSN", name: "Masan Group", sector: "Consumer" },
  { code: "VHM", name: "Vinhomes", sector: "Real Estate" },
  { code: "VIC", name: "Vingroup", sector: "Conglomerate" },
  { code: "GAS", name: "PetroVietnam Gas", sector: "Energy" },
  { code: "POW", name: "PetroVietnam Power", sector: "Energy" },
];

export function TogogoTradingBotCompact() {
  const [selectedBot, setSelectedBot] = useState(0);
  const [selectedStock, setSelectedStock] = useState("YTC");
  const { symbolMap } = useSymbolStore();

  // Helper function to get ID from stock name
  const getStockId = (stockCode: string) => {
    if (!symbolMap) return stockCode;
    const stockId = symbolMap[stockCode];
    return stockId || stockCode;
  };

  const currentBot = botSuggestions[selectedBot];

  return (
    <div className="space-y-6">
      {/* Bot Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {botSuggestions.map((bot, index) => (
          <Card
            key={bot.id}
            className={`cursor-pointer transition-all duration-300 border-2 ${
              selectedBot === index
                ? "ring-2 ring-cyan-400 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-cyan-400/50"
                : "hover:bg-gradient-to-br hover:from-slate-700/50 hover:to-slate-600/50 bg-gradient-to-br from-slate-800/40 to-slate-700/40 border-blue-400/20 hover:border-blue-400/40"
            }`}
            onClick={() => setSelectedBot(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-14 h-14 rounded-lg flex items-center justify-center bg-gradient-to-br ${bot.color} shadow-lg`}
                >
                  {bot.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-base mb-1">
                    {bot.name}
                  </h4>
                  <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                    {bot.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge
                      className={`bg-gradient-to-r ${bot.color} text-white text-sm px-2 py-1`}
                    >
                      {bot.performance}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-400">
                        {bot.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Bot Details */}
      <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${currentBot.color} shadow-xl`}
            >
              {currentBot.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-white">
                  {currentBot.name}
                </span>
                <Badge
                  className={`bg-gradient-to-r ${currentBot.color} text-white px-3 py-1`}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI v2.1
                </Badge>
              </div>
              <p className="text-slate-400 text-base mt-1">
                {currentBot.description}
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bot Performance */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-xl border border-blue-400/20 min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 truncate">
                {currentBot.performance}
              </div>
              <div className="text-sm text-slate-400">Hiệu suất</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-xl border border-blue-400/20 min-w-0">
              <div className="flex items-center justify-center gap-2">
                <div className="text-xl sm:text-2xl font-bold text-cyan-400">
                  {currentBot.confidence}%
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-sm text-slate-400">Độ tin cậy</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-xl border border-blue-400/20 min-w-0">
              <div className="text-lg sm:text-xl font-bold text-white">
                {currentBot.timeframe}
              </div>
              <div className="text-sm text-slate-400">Thời gian</div>
            </div>
          </div>

          {/* Strategy Description */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-slate-300">Chiến lược:</span>
            </div>
            <p className="text-slate-300 text-base leading-relaxed">
              {currentBot.strategy}
            </p>
          </div>

          {/* Current Picks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-blue-400" />
              <span className="font-medium text-lg text-slate-300">
                Gợi ý hiện tại:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {currentBot.picks.map((pick, index) => (
                <Link
                  key={index}
                  className="p-3 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg border border-blue-400/20 cursor-pointer hover:border-cyan-400/40 transition-all"
                  href={`/viewdetails/${getStockId('YTC')}`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-cyan-400">{pick}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {pick.length === 3
                        ? stockOptions.find((s) => s.code === pick)?.sector
                        : pick}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Stock Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-6 h-6 text-teal-400" />
              <span className="font-medium text-lg text-slate-300">
                Phân tích cổ phiếu cụ thể:
              </span>
            </div>
            <Select value={selectedStock} onValueChange={setSelectedStock}>
              <SelectTrigger className="bg-gradient-to-r from-slate-700/40 to-slate-600/40 border-blue-400/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-blue-400/30">
                {stockOptions.map((stock) => (
                  <SelectItem
                    key={stock.code}
                    value={stock.code}
                    className="text-white hover:bg-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-cyan-400">
                        {stock.code}
                      </span>
                      <span className="text-slate-400">-</span>
                      <span className="text-sm text-slate-300">
                        {stock.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs ml-auto text-blue-300 border-blue-400/50 bg-blue-500/20"
                      >
                        {stock.sector}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href={`/viewdetails/${getStockId(selectedStock)}`}>
              <Button className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white shadow-lg">
                <Target className="w-4 h-4 mr-2" />
                Xem gợi ý bot cho {selectedStock}
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <Button
                variant="outline"
                className="border-blue-400/30 text-slate-800 hover:bg-blue-500/20 hover:text-white hover:border-blue-400/50"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Bot khác
              </Button>
              <Button
                variant="outline"
                className="border-teal-400/30 text-slate-800 hover:bg-teal-500/20 hover:text-white hover:border-teal-400/50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Kích hoạt bot
              </Button>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-400/20">
            <div className="grid grid-cols-2 gap-4 text-base">
              <div className="flex justify-between">
                <span className="text-slate-400">Win rate 30 ngày:</span>
                <span className="font-bold text-emerald-400">78.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số giao dịch:</span>
                <span className="font-bold text-white">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lợi nhuận TB:</span>
                <span className="font-bold text-cyan-400">+4.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max drawdown:</span>
                <span className="font-bold text-amber-400">-3.1%</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-3 border border-amber-400/20">
            <p className="text-base text-amber-300 leading-relaxed">
              ⚠️ <strong>Lưu ý:</strong> Bot trading là công cụ hỗ trợ, không
              phải lời khuyên đầu tư. Bạn cần hiểu rõ rủi ro và chịu trách nhiệm
              với quyết định của mình.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
