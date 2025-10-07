import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  BarChart3,
  Activity,
  Mailbox,
} from "lucide-react";

interface NewsSidebarProps {
  onViewDetails: (code: string) => void;
}

const trendingTopics = [
  { topic: "Cổ phiếu ngân hàng", count: 24, trend: "up" },
  { topic: "IPO MEATLife", count: 15, trend: "up" },
  { topic: "Chính sách BĐS", count: 12, trend: "neutral" },
  { topic: "AI Trading", count: 18, trend: "up" },
  { topic: "Crypto Vietnam", count: 9, trend: "down" },
];

const marketMovers = [
  { code: "HPG", change: "+5.13%", isPositive: true, volume: "12.3M" },
  { code: "MSN", change: "+4.83%", isPositive: true, volume: "5.7M" },
  { code: "TCB", change: "+3.08%", isPositive: true, volume: "8.5M" },
  { code: "VHM", change: "-1.74%", isPositive: false, volume: "2.9M" },
  { code: "VIC", change: "-0.48%", isPositive: false, volume: "1.8M" },
];

const economicCalendar = [
  { event: "GDP Q4 2024", date: "28/08", time: "09:00", importance: "high" },
  { event: "PMI sản xuất", date: "30/08", time: "10:00", importance: "medium" },
  { event: "Lãi suất SBV", date: "05/09", time: "14:00", importance: "high" },
  { event: "CPI tháng 8", date: "10/09", time: "08:30", importance: "medium" },
];

const getImportanceColor = (importance: string) => {
  switch (importance) {
    case "high":
      return "text-red-300 border-red-400/50 bg-red-500/20";
    case "medium":
      return "text-amber-300 border-amber-400/50 bg-amber-500/20";
    case "low":
      return "text-slate-300 border-slate-400/50 bg-slate-500/20";
    default:
      return "text-slate-300 border-slate-400/50 bg-slate-500/20";
  }
};

export function NewsSidebar({ onViewDetails }: NewsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Trading Signal Signup */}
      <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-400">
            <Mailbox className="w-5 h-5" />
            <span className="font-bold">Trading Signal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-emerald-300 mb-6">
            Nhận tin tức và phân tích hàng ngày từ chuyên gia
          </p>
          <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
            <span className="font-bold">Đăng ký miễn phí</span>
          </Button>
          <p className="text-sm text-emerald-400 mt-2 text-center">
            2.3K+ người đã đăng ký
          </p>
        </CardContent>
      </Card>

      {/* Market Status */}
      <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <span className="text-white">Trạng thái thị trường</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-base">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Phiên giao dịch:</span>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse mr-1"></div>
                Mở cửa
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Thời gian:</span>
              <span className="font-medium text-white">14:32 (GMT+7)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Phiên tiếp theo:</span>
              <span className="text-cyan-400">ATC 14:45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Đóng cửa:</span>
              <span className="text-slate-400">15:00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
