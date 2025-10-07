"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EconomicBarChart = dynamic(() => import("./EconomicBarChart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
      Đang tải biểu đồ…
    </div>
  ),
});

interface EconomicEvent {
  id: number;
  date: string;
  time: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  event: string;
  importance: "low" | "medium" | "high";
  forecast: string;
  previous: string;
  actual?: string;
  // category: "economic" | "earnings" | "revenue" | "dividends";
  series?: { label: string; value: number }[];
  description?: string;
  source?: string;
}

export function EconomicCalendar() {
  // const [activeFilter, setActiveFilter] = useState<
  //   "economic" | "earnings" | "revenue" | "dividends"
  // >("economic");
  const [selectedDate, setSelectedDate] = useState("2025-08-23");

  // Mock data for the week - exactly matching the image
  const weekDays = [
    {
      date: "2025-08-23",
      day: "T7 23",
      economic: 4,
      earnings: 10,
      dividends: 1,
    },
    {
      date: "2025-08-24",
      day: "CN 24",
      economic: 3,
      earnings: 4,
      dividends: 2,
    },
    {
      date: "2025-08-25",
      day: "T2 25",
      economic: 31,
      earnings: 25,
      dividends: 319,
    },
    {
      date: "2025-08-26",
      day: "T3 26",
      economic: 30,
      earnings: 477,
      dividends: 499,
    },
    {
      date: "2025-08-27",
      day: "T4 27",
      economic: 40,
      earnings: 1427,
      dividends: 305,
    },
    {
      date: "2025-08-28",
      day: "T5 28",
      economic: 53,
      earnings: 1317,
      dividends: 1030,
    },
    {
      date: "2025-08-29",
      day: "T6 29",
      economic: 104,
      earnings: 276,
      dividends: 2291,
    },
  ];

  // Economic events matching the exact data from the image
  const economicEvents: EconomicEvent[] = [
    // Added sample events for Sat, Aug 23, 2025
    {
      id: 101,
      date: "2025-08-23",
      time: "08:30",
      country: "Japan",
      countryCode: "JP",
      countryFlag: "🇯🇵",
      event: "CPI YoY Flash",
      importance: "medium",
      forecast: "2.7%",
      previous: "2.5%",
      actual: "2.6%",
      // category: "economic",
      description: "Diễn biến chỉ số giá tiêu dùng sớm theo năm.",
      source: "Statistics Bureau",
      series: Array.from({ length: 16 }, (_, i) => ({
        label: new Date(2024, 11 + i, 1).toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        value: 60 + ((i * 7) % 35),
      })),
    },
    {
      id: 102,
      date: "2025-08-23",
      time: "10:00",
      country: "Germany",
      countryCode: "DE",
      countryFlag: "🇩🇪",
      event: "Manufacturing PMI Flash",
      importance: "high",
      forecast: "43.2",
      previous: "42.8",
      actual: "43.0",
      // category: "economic",
      description: "PMI sản xuất sơ bộ phản ánh hoạt động nhà máy.",
      source: "S&P Global",
      series: Array.from({ length: 14 }, (_, i) => ({
        label: new Date(2024, 10 + i, 1).toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        value: 58 + ((i * 5) % 30),
      })),
    },
    {
      id: 103,
      date: "2025-08-23",
      time: "12:00",
      country: "United States",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "Existing Home Sales",
      importance: "medium",
      forecast: "3.95M",
      previous: "3.89M",
      actual: "—",
      // category: "economic",
      description: "Doanh số nhà hiện hữu của Hoa Kỳ theo tháng.",
      source: "NAR",
    },
    {
      id: 104,
      date: "2025-08-23",
      time: "14:00",
      country: "United Kingdom",
      countryCode: "GB",
      countryFlag: "🇬🇧",
      event: "GfK Consumer Confidence",
      importance: "low",
      forecast: "-18",
      previous: "-19",
      actual: "—",
      // category: "economic",
      description: "Niềm tin người tiêu dùng Vương quốc Anh.",
      source: "GfK",
    },
    {
      id: 1,
      date: "2025-08-25",
      time: "07:00",
      country: "United Kingdom",
      countryCode: "GB",
      countryFlag: "🇬🇧",
      event: "Late Summer Bank Holiday",
      importance: "low",
      forecast: "—",
      previous: "—",
      actual: "—",
      // category: "economic",
    },
    {
      id: 2,
      date: "2025-08-25",
      time: "09:30",
      country: "South Korea",
      countryCode: "KR",
      countryFlag: "🇰🇷",
      event: "5-Year KTB Auction",
      importance: "low",
      forecast: "—",
      previous: "2.625%",
      actual: "2.58%",
      // category: "economic",
    },
    {
      id: 3,
      date: "2025-08-25",
      time: "12:00",
      country: "Japan",
      countryCode: "JP",
      countryFlag: "🇯🇵",
      event: "Coincident Index Final",
      importance: "medium",
      forecast: "—",
      previous: "116",
      actual: "116.7",
      // category: "economic",
      description: "Chỉ số trùng hợp kinh tế của Nhật Bản.",
      source: "Cabinet Office",
    },
    {
      id: 4,
      date: "2025-08-25",
      time: "12:00",
      country: "Japan",
      countryCode: "JP",
      countryFlag: "🇯🇵",
      event: "Leading Economic Index Final",
      importance: "medium",
      forecast: "106.1",
      previous: "104.8",
      actual: "105.6",
      // category: "economic",
      description: "Chỉ số dẫn dắt kinh tế Nhật Bản (final).",
      source: "Cabinet Office",
    },
    {
      id: 5,
      date: "2025-08-25",
      time: "13:00",
      country: "Saudi Arabia",
      countryCode: "SA",
      countryFlag: "🇸🇦",
      event: "Balance of Trade",
      importance: "medium",
      forecast: "—",
      previous: "6.7 Bln",
      actual: "22.1 Bln",
      // category: "economic",
      description: "Cán cân thương mại hàng hóa của Ả Rập Xê Út.",
      source: "GASTAT",
    },
    {
      id: 6,
      date: "2025-08-25",
      time: "13:00",
      country: "Saudi Arabia",
      countryCode: "SA",
      countryFlag: "🇸🇦",
      event: "Exports",
      importance: "low",
      forecast: "—",
      previous: "—",
      actual: "92.1 Bln",
      // category: "economic",
      description: "Giá trị xuất khẩu hàng hóa.",
      source: "GASTAT",
    },
    {
      id: 7,
      date: "2025-08-25",
      time: "13:00",
      country: "Saudi Arabia",
      countryCode: "SA",
      countryFlag: "🇸🇦",
      event: "Imports",
      importance: "low",
      forecast: "—",
      previous: "—",
      actual: "70 Bln",
      // category: "economic",
      description: "Giá trị nhập khẩu hàng hóa.",
      source: "GASTAT",
    },
  ];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredEvents = economicEvents.filter(
    (event) => event.date === selectedDate
  );

  // Expandable event details state: allow multiple open
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  // No prefetching needed for placeholder chart

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-cyan-400/30 backdrop-blur-sm shadow-lg">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
            <h3 className="text-3xl font-bold text-white">Lịch</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              Hôm nay
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="text-base text-slate-400 ml-2">
              23–29 Tháng 8, 2025
            </div>
          </div>
        </div>

        {/* Week Days Header */}
        {/* Week selector: show 4 columns on mobile with horizontal scroll; full 7 on md+ */}
        <div className="flex md:grid md:grid-cols-7 overflow-x-auto md:overflow-visible gap-1 mb-6 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg p-2 snap-x snap-mandatory">
          {weekDays.map((day) => (
            <div
              key={day.date}
              className={`flex items-center justify-center p-3 rounded-md text-center text-base cursor-pointer transition-all basis-1/4 shrink-0 md:basis-auto md:shrink snap-start ${
                selectedDate === day.date
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "text-slate-300 hover:bg-slate-600/50"
              }`}
              onClick={() => setSelectedDate(day.date)}
            >
              <div className="font-semibold my-1">{day.day}</div>
              {/* <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span
                    className={
                      selectedDate === day.date
                        ? "text-white"
                        : "text-slate-400"
                    }
                  >
                    Kinh tế
                  </span>
                  <span
                    className={
                      selectedDate === day.date ? "text-white" : "text-cyan-400"
                    }
                  >
                    {day.economic}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={
                      selectedDate === day.date
                        ? "text-white"
                        : "text-slate-400"
                    }
                  >
                    Lợi nhuận
                  </span>
                  <span
                    className={
                      selectedDate === day.date ? "text-white" : "text-cyan-400"
                    }
                  >
                    {day.earnings}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={
                      selectedDate === day.date
                        ? "text-white"
                        : "text-slate-400"
                    }
                  >
                    Cổ tức
                  </span>
                  <span
                    className={
                      selectedDate === day.date ? "text-white" : "text-cyan-400"
                    }
                  >
                    {day.dividends}
                  </span>
                </div>
              </div> */}
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        {/* <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-6 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg p-1">
          {(["economic", "earnings", "revenue", "dividends"] as const).map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 sm:px-4 py-2 rounded-md text-base font-medium transition-all capitalize shrink-0 whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-600/50"
                }`}
              >
                {
                  {
                    economic: "Kinh tế",
                    earnings: "Lợi nhuận",
                    revenue: "Doanh thu",
                    dividends: "Cổ tức",
                  }[filter]
                }
              </button>
            )
          )}
          <div className="w-full md:w-auto md:ml-auto mt-2 md:mt-0 flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-600/50"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-600/50"
            >
              <Filter className="w-4 h-4" />
            </Button>
            <div className="text-base text-slate-400">Tất cả danh mục</div>
          </div>
        </div> */}

        {/* Selected Date Info */}
        <div className="mb-4 text-base text-slate-400">
          {(() => {
            const d = new Date(`${selectedDate}T00:00:00`);
            const days = [
              "Chủ nhật",
              "Thứ Hai",
              "Thứ Ba",
              "Thứ Tư",
              "Thứ Năm",
              "Thứ Sáu",
              "Thứ Bảy",
            ];
            const dow = days[d.getDay()];
            const day = d.getDate();
            const month = d.getMonth() + 1;
            return `${dow}, ${day} Tháng ${month}`;
          })()}
        </div>

        {/* Events Table - Exact format matching the image */}
        <div className="bg-gradient-to-r from-slate-700/20 to-slate-600/20 rounded-lg border border-blue-400/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-400/20 hover:bg-transparent">
                <TableHead className="text-slate-400 text-sm font-medium w-20 text-left pl-4">
                  Thời gian
                </TableHead>
                <TableHead className="text-slate-400 text-sm font-medium w-40 text-left">
                  Quốc gia
                </TableHead>
                <TableHead className="text-slate-400 text-sm font-medium text-left">
                  Sự kiện
                </TableHead>
                <TableHead className="text-slate-400 text-sm font-medium text-center w-20">
                  Thực tế
                </TableHead>
                <TableHead className="text-slate-400 text-sm font-medium text-center w-20">
                  Dự báo
                </TableHead>
                <TableHead className="text-slate-400 text-sm font-medium text-center w-20">
                  Trước đó
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <React.Fragment key={event.id}>
                  <TableRow
                    key={event.id}
                    className="border-b border-blue-400/10 hover:bg-slate-600/20 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(event.id)}
                  >
                    <TableCell className="text-slate-300 text-base py-4 pl-4 align-top">
                      {event.time}
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{event.countryFlag}</span>
                        <span className="text-slate-200 text-sm font-medium">
                          {event.country}
                        </span>
                        <div
                          className={`ml-2 w-2 h-2 rounded-full ${getImportanceColor(
                            event.importance
                          )}`}
                        ></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-200 text-base py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.event}</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform text-slate-500 ${
                            expandedIds.has(event.id)
                              ? "rotate-180"
                              : "rotate-0"
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span
                        className={`text-base ${
                          event.actual && event.actual !== "—"
                            ? "text-white font-medium"
                            : "text-slate-500"
                        }`}
                      >
                        {event.actual}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-base text-slate-400">
                        {event.forecast}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-base text-slate-400">
                        {event.previous}
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b border-blue-400/10">
                    <TableCell colSpan={6} className="p-0">
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-out ${
                          expandedIds.has(event.id)
                            ? "max-h-[28rem] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div
                          className={`p-4 bg-slate-700/30 transform transition-transform duration-300 ${
                            expandedIds.has(event.id)
                              ? "translate-y-0"
                              : "-translate-y-2"
                          }`}
                        >
                          <div className="text-slate-300 text-sm mb-3">
                            {event.description ||
                              "Đánh giá ngắn về bối cảnh sự kiện."}
                          </div>
                          <div className="relative bg-slate-800/40 border border-blue-400/20 rounded-md p-3 h-64">
                            {expandedIds.has(event.id) &&
                              (() => {
                                const series =
                                  event.series && event.series.length > 0
                                    ? event.series
                                    : [
                                        {
                                          label: "thg 1 2025",
                                          actual: 0.01,
                                          forecast: 0.02,
                                        },
                                        {
                                          label: "thg 2 2025",
                                          actual: 0.26,
                                          forecast: 0.18,
                                        },
                                        {
                                          label: "thg 3 2025",
                                          actual: 0.15,
                                          forecast: 0.16,
                                        },
                                        {
                                          label: "thg 4 2025",
                                          actual: 0.28,
                                          forecast: 0.2,
                                        },
                                        {
                                          label: "thg 5 2025",
                                          actual: 0.27,
                                          forecast: 0.19,
                                        },
                                        {
                                          label: "thg 6 2025",
                                          actual: 0.08,
                                          forecast: 0.18,
                                        },
                                        {
                                          label: "thg 7 2025",
                                          actual: 0.19,
                                          forecast: 0.19,
                                        },
                                        {
                                          label: "thg 8 2025",
                                          actual: 0.01,
                                          forecast: 0.12,
                                        },
                                        {
                                          label: "thg 9 2025",
                                          actual: null,
                                          forecast: 0.09,
                                        }, // chỉ dự báo
                                      ];
                                const data = series.slice(
                                  Math.max(0, series.length - 12)
                                );
                                return <EconomicBarChart series={data} />;
                              })()}
                            <div className="absolute right-3 top-3 text-xs text-slate-400">
                              Nguồn: {event.source || "Demo"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="mt-4 text-sm text-slate-500 text-center">
          Tất cả thời gian theo UTC-7 • {filteredEvents.length} sự kiện • Cung
          cấp bởi Economic Calendar API
        </div>
      </CardContent>
    </Card>
  );
}
