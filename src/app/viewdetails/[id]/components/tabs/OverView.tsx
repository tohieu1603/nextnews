import React from "react";
import { Building2, PieChart, Globe, FileBarChart, ChevronRight, Clock, TrendingUp, Users, DollarSign, Briefcase, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StockChart } from "../charts/StockChart";
import { Calendar } from "lucide-react";
import style from "styled-jsx/style";
import PurchaseSymbolCard from "../PurchaseSymbolCard";


interface OverviewTabProps {
  stock: any;
  data: any;
  isPositive: boolean;
}

export default function OverviewTab({
  stock,
  data,
  isPositive,
}: OverviewTabProps) {
  function formatDate(timestamp: number) {
    // timestamp từ JSON thường tính bằng giây → nhân 1000
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh", // giờ VN
    });
  }
  function formatPct(value: number) {
    if (value == null) return "-";
    const pct = (value * 100).toFixed(2); // giữ 2 chữ số thập phân
    return `${value > 0 ? "+" : ""}${pct}%`;
  }
  function formatDatee(dateStr?: string) {
    if (!dateStr) return "Chưa có";

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      // nếu parse lỗi thì fallback
      return "Ngày không hợp lệ";
    }

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh", // đảm bảo theo giờ VN
    });
  }

  function formatDateTimee(dateStr?: string): string {
    if (!dateStr) return "Chưa có";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Ngày không hợp lệ";

    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  }
  const newsData = data?.company?.news || [];
  const sortedNews = [...newsData].sort((a, b) => b.public_date - a.public_date);

  return (

    <div className="space-y-6 mt-0">
      {/* Stock Chart - Full Width */}
      {stock && (
        <StockChart
          stockCode={stock.symbol}
          currentPrice={stock.currentPrice}
          change={stock.change}
          changePercent={stock.changePercent}
          isPositive={isPositive}
        />
      )}

      {/* Purchase Symbol Card */}
      {data?.symbolData?.id && data?.symbolData?.name && (
        <PurchaseSymbolCard
          symbolId={data.symbolData.id}
          symbolName={data.symbolData.name}
          price={200000}
        />
      )}

      {/* Company Overview - Full Width */}
      <Card className="bg-slate-800/60 border border-blue-400/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Thông tin doanh nghiệp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-xs text-slate-400">Tên đầy đủ</div>
                <div className="text-white">
                  {data?.symbolData?.company?.company_name ?? "Undefined"}
                </div>
              </div>

              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-xs text-slate-400">Hồ sơ doanh nghiệp</div>
                <div className="text-white text-sm leading-relaxed">
                  {data?.symbolData?.company?.company_profile ?? "Undefined"}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {/* <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-xs text-slate-400">Ngành</div>
                <div className="text-white">
                  {data?.symbolData.company?.industry}
                </div>
              </div> */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-slate-400">Thành lập</div>
                  <div className="text-white">
                    {data?.symbolData?.company?.history
                      ? data.symbolData?.company.history.match(/\d{4}/)?.[0] // lấy năm đầu tiên trong chuỗi
                      : "Undifined"}
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-slate-400">Website</div>
                  <div className="text-cyan-400 text-xs">
                    {data?.symbolData?.company?.website ?? "Undefined"}
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-slate-400">Nhân viên</div>
                  <div className="text-white">
                    {data?.symbolData?.company?.no_employees ?? "Undefined"}
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-slate-400">Sàn giao dịch</div>
                  <div className="text-cyan-400 text-xs">
                    {data?.symbolData?.exchange ?? "Undefined"}
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-slate-400">
                    Tổng số cổ phần phát hành
                  </div>
                  <div className="text-white">
                    {data?.symbolData?.company?.financial_ratio_issue_share
                      ? `${Number(
                        data?.symbolData?.company?.financial_ratio_issue_share
                      ).toLocaleString("vi-VN")} cổ phiếu`
                      : "Undefined"}
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-slate-400">Vốn điều lệ</div>
                  <div className="text-white">
                    {data?.symbolData?.company?.charter_capital
                      ? Number(
                        data?.symbolData?.company?.charter_capital
                      ).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })
                      : "Undefined"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Segments - Full Width */}
      <Card className="bg-slate-800/60 border border-blue-400/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Phân khúc kinh doanh
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {Array.isArray(data?.symbolData?.industries) &&
              data.symbolData.industries.map(
                (industries: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">
                        {industries.name}
                      </h4>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                        {formatDateTimee(industries.updated_at)}
                      </Badge>
                    </div>
                  </div>
                )
              )}
          </div>
        </CardContent>
      </Card>

      {/* Corporate Events - Full Width */}
      <Card className="bg-slate-800/60 border border-blue-400/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Sự kiện doanh nghiệp
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {data?.symbolData?.company?.events?.length ? (
              data.symbolData?.company.events.map(
                (events: any, index: number) => (
                  <div
                    key={index}
                    className="p-5 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-indigo-400/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-bold text-white mb-1">
                          {events.event_title}
                        </h5>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>
                          Công bố: <span className="font-medium text-white">
                            {formatDatee(events?.public_date)}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4 text-green-400" />
                        <span>
                          Hiệu lực: <span className="font-medium text-white">
                            {formatDatee(events?.issue_date)}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-400/30 text-xs"
                        onClick={() =>
                          window.open(events?.source_url, "_blank")
                        }
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="col-span-2 text-center text-slate-400">
                Không có sự kiện nào
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/60 border border-blue-400/30">
        <CardContent className="p-6 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-400/10 via-blue-400/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/8 to-transparent rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2 h-6 bg-gradient-to-b from-cyan-400 via-blue-400 to-indigo-500 rounded-full shadow-lg"></div>
                  <div className="absolute inset-0 w-2 h-6 bg-gradient-to-b from-cyan-400 via-blue-400 to-indigo-500 rounded-full blur-sm opacity-60"></div>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Tin tức doanh nghiệp
                </h3>
                <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300 px-3 py-1 text-xs backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                  Live Updates
                </Badge>
              </div>
              <div className="text-xs text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-full border border-slate-600/30 backdrop-blur-sm">
                <Clock className="w-3 h-3 inline mr-1" />
                Cập nhật 2 phút trước
              </div>
            </div>

            {(() => {
              // Company news data from JSON source


              // Enhanced styling themes for different news types
              const newsTypeStyles = {
                meeting: {
                  gradient: "from-purple-500/20 via-blue-500/15 to-indigo-500/20",
                  border: "border-purple-400/30 hover:border-purple-400/50",
                  badge: "bg-purple-500/20 text-purple-300 border-purple-400/40",
                  icon: Calendar,
                  glow: "group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                },

                financial: {
                  gradient: "from-emerald-500/20 via-green-500/15 to-teal-500/20",
                  border: "border-emerald-400/30 hover:border-emerald-400/50",
                  badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
                  icon: DollarSign,
                  glow: "group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                },
                personnel: {
                  gradient: "from-orange-500/20 via-amber-500/15 to-yellow-500/20",
                  border: "border-orange-400/30 hover:border-orange-400/50",
                  badge: "bg-orange-500/20 text-orange-300 border-orange-400/40",
                  icon: Users,
                  glow: "group-hover:drop-shadow-[0_0_12px_rgba(251,146,60,0.3)]"
                },
                stock: {
                  gradient: "from-cyan-500/20 via-blue-500/15 to-sky-500/20",
                  border: "border-cyan-400/30 hover:border-cyan-400/50",
                  badge: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
                  icon: TrendingUp,
                  glow: "group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                },
                business: {
                  gradient: "from-blue-500/20 via-indigo-500/15 to-purple-500/20",
                  border: "border-blue-400/30 hover:border-blue-400/50",
                  badge: "bg-blue-500/20 text-blue-300 border-blue-400/40",
                  icon: Briefcase,
                  glow: "group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                }
              };

              const priorityIndicators = {
                high: { color: "bg-red-400", pulse: "animate-pulse" },
                medium: { color: "bg-yellow-400", pulse: "" },
                low: { color: "bg-green-400", pulse: "" }
              };

              return (
                <div className="grid grid-cols-2 gap-5">
                  {data?.symbolData?.company?.news?.length ? (
                    data.symbolData?.company.news.map((news: any, index: number) => {
                      const style = newsTypeStyles[news.type as keyof typeof newsTypeStyles];
                      const priority = priorityIndicators[news.priority as keyof typeof priorityIndicators];
                      const IconComponent = style?.icon;

                      return (
                        <div
                          key={index}
                          className={`relative p-6 bg-gradient-to-br ${style?.gradient} backdrop-blur-sm rounded-2xl border ${style?.border} transition-all duration-500 group cursor-pointer overflow-hidden hover:scale-[1.02] hover:shadow-2xl ${style?.glow}`}
                          onClick={() => window.open(news.news_source_link, "_blank")}
                        >
                          {/* Priority indicator */}
                          <div className={`absolute top-3 right-3 w-2 h-2 ${priority?.color} rounded-full ${priority?.pulse}`}></div>

                          {/* Animated background pattern */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-transparent via-white/20 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 group-hover:bg-white/15 transition-colors">
                                  {/* <IconComponent className="w-4 h-4 text-white" /> */}
                                </div>
                                <Badge className={`${style?.badge} px-2 py-1 text-xs font-medium backdrop-blur-sm`}>
                                  {news.category}
                                </Badge>
                              </div>
                            </div>
                            <h5 className="font-bold text-white mb-3 leading-tight group-hover:text-blue-100 transition-colors duration-300 text-sm">
                              {news.title}
                            </h5>
                            <div className="space-y-3 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-300">
                                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                  <Clock className="w-3 h-3" />
                                  <span className="font-medium">Công bố: {formatDate(news.public_date)}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-300">
                                  {/* Chấm màu trạng thái */}
                                  <div
                                    className={`w-1 h-1 rounded-full ${news.price_change_pct > 0
                                      ? "bg-green-400"
                                      : news.price_change_pct < 0
                                        ? "bg-red-400"
                                        : "bg-gray-400"
                                      }`}
                                  ></div>

                                  <Calendar className="w-3 h-3" />

                                  {/* Giá trị phần trăm */}
                                  <span
                                    className={`flex items-center gap-1 ${news.price_change_pct > 0
                                      ? "text-green-400"
                                      : news.price_change_pct < 0
                                        ? "text-red-400"
                                        : "text-gray-400"
                                      } font-medium`}
                                  >
                                    {news.price_change_pct > 0 && <ArrowUpRight className="w-3 h-3" />}
                                    {news.price_change_pct < 0 && <ArrowDownRight className="w-3 h-3" />}
                                    {news.price_change_pct === 0 && <Minus className="w-3 h-3" />}
                                    {formatPct(news.price_change_pct)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <Button
                                size="sm"
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 text-xs transition-all duration-300 backdrop-blur-sm group-hover:shadow-lg"
                              >
                                <Globe className="w-3 h-3 mr-1.5" />
                                Xem chi tiết
                                <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                              </Button>
                              <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                HSX
                              </div>
                            </div>
                          </div>

                          {/* Hover shine effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center text-slate-400 py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <FileBarChart className="w-16 h-16 text-slate-500" />
                          <div className="absolute inset-0 w-16 h-16 bg-slate-500/20 rounded-full blur-xl"></div>
                        </div>
                        <div className="space-y-1">
                          <span className="block font-medium">Không có tin tức doanh nghiệp</span>
                          <span className="text-xs text-slate-500">Thông tin sẽ được cập nhật khi có sự kiện mới</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
