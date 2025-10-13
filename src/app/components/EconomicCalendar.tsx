"use client";
import React, { useEffect, useMemo, useState } from "react";
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
import {
  getEconomicCalendar,
  EconomicCalendarApiEvent,
} from "@/services/api";

const EconomicBarChart = dynamic(() => import("./EconomicBarChart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
      Đang tải biểu đồ...
    </div>
  ),
});

type Importance = "low" | "medium" | "high";

interface EconomicEvent {
  id: string;
  date: string;
  time: string | null;
  displayTime: string;
  sortValue: number;
  country: string;
  currency?: string;
  importance: Importance;
  title: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  sourceUrl?: string | null;
  allDay: boolean;
}

interface WeekDay {
  date: string;
  label: string;
  eventCount: number;
}

const weekdayShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const weekdayFull = [
  "Chủ nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

const importanceColors: Record<Importance, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

const importanceText: Record<Importance, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};

const formatDateISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseISODate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getStartOfWeek = (date: Date): Date => {
  const start = new Date(date);
  const day = start.getDay();
  const distance = (day + 6) % 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - distance);
  return start;
};

const formatWeekdayLabel = (dateStr: string): string => {
  const date = parseISODate(dateStr);
  const short = weekdayShort[date.getDay()];
  return `${short} ${String(date.getDate()).padStart(2, "0")}`;
};

const formatLongDayLabel = (dateStr: string): string => {
  const date = parseISODate(dateStr);
  const dow = weekdayFull[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${dow}, ${day} Tháng ${month}, ${year}`;
};

const formatRangeLabel = (startISO: string, endISO: string): string => {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return `${start.getDate()}-${end.getDate()} Tháng ${start.getMonth() + 1
      }, ${start.getFullYear()}`;
  }
  const startLabel = `${String(start.getDate()).padStart(2, "0")}/${String(
    start.getMonth() + 1
  ).padStart(2, "0")}/${start.getFullYear()}`;
  const endLabel = `${String(end.getDate()).padStart(2, "0")}/${String(
    end.getMonth() + 1
  ).padStart(2, "0")}/${end.getFullYear()}`;
  return `${startLabel} - ${endLabel}`;
};

const mapImportance = (value: number | string | null | undefined): Importance => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    if (value >= 3) return "high";
    if (value === 2) return "medium";
    return "low";
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "high" || normalized === "medium" || normalized === "low") {
      return normalized as Importance;
    }
    const numeric = Number.parseInt(normalized, 10);
    if (!Number.isNaN(numeric)) {
      return mapImportance(numeric);
    }
  }
  return "low";
};

const toSortValue = (
  dateStr: string,
  time: string | null,
  allDay: boolean
): number => {
  const date = parseISODate(dateStr);
  if (allDay) {
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }
  if (!time) {
    date.setHours(23, 59, 59, 0);
    return date.getTime();
  }
  const [hour, minute] = time.split(":").map(Number);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
};

const sanitizeDateString = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes("T")) {
    return sanitizeDateString(trimmed.split("T")[0]);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{8}$/.test(trimmed)) {
    const year = trimmed.slice(0, 4);
    const month = trimmed.slice(4, 6);
    const day = trimmed.slice(6, 8);
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return formatDateISO(parsed);
  }
  return null;
};

const sanitizeTimeString = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim().replace(/Z$/, "");
  if (!trimmed) return null;
  const match = trimmed.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const [, hour, minute] = match;
  return `${hour.padStart(2, "0")}:${minute}`;
};

const buildEventId = (
  event: EconomicCalendarApiEvent,
  date: string,
  time: string | null
): string => {
  if (event.event_id && event.event_id.trim().length > 0) {
    return event.event_id;
  }
  const extras = [
    event.country_code ?? "",
    event.title ?? "",
    time ?? (event.all_day ? "all-day" : ""),
  ]
    .filter(Boolean)
    .join("-")
    .replace(/\s+/g, "-");
  return `${date}-${extras}` || `${date}-${Math.random().toString(36).slice(2)}`;
};

const normalizeEvent = (
  item: EconomicCalendarApiEvent
): EconomicEvent | null => {
  const eventDateTimeParts = item.event_datetime
    ? item.event_datetime.split("T")
    : [];
  const dateFromDateTime = eventDateTimeParts[0];
  const timeFromDateTime = eventDateTimeParts[1];

  const date =
    sanitizeDateString(item.date) ??
    sanitizeDateString(dateFromDateTime ?? null);

  if (!date) {
    return null;
  }

  const rawTime = item.all_day
    ? null
    : sanitizeTimeString(item.time) ??
        sanitizeTimeString(timeFromDateTime ?? null);

  const displayTime = item.all_day ? "Ca ngay" : rawTime ?? "--";
  const sortValue = toSortValue(date, rawTime, item.all_day);
  const id = buildEventId(item, date, rawTime);

  return {
    id,
    date,
    time: rawTime,
    displayTime,
    sortValue,
    country: item.country || item.country_code || "Dang cap nhat",
    currency: item.currency || undefined,
    importance: mapImportance(item.importance),
    title: item.title,
    actual: item.actual,
    forecast: item.forecast,
    previous: item.previous,
    sourceUrl: item.source_url,
    allDay: item.all_day,
  };
};

const formatCellValue = (value: string | null | undefined): string =>
  value && value.trim().length > 0 ? value : "--";

const fallbackSeries = [
  { label: "T1", actual: 0.2, forecast: 0.24 },
  { label: "T2", actual: 0.27, forecast: 0.25 },
  { label: "T3", actual: 0.22, forecast: 0.23 },
  { label: "T4", actual: 0.3, forecast: 0.28 },
  { label: "T5", actual: 0.26, forecast: 0.27 },
  { label: "T6", actual: 0.21, forecast: 0.22 },
  { label: "T7", actual: 0.18, forecast: 0.2 },
  { label: "T8", actual: 0.25, forecast: 0.26 },
  { label: "T9", actual: 0.24, forecast: 0.25 },
  { label: "T10", actual: 0.23, forecast: 0.24 },
  { label: "T11", actual: 0.21, forecast: 0.23 },
  { label: "T12", actual: 0.2, forecast: 0.22 },
];

export function EconomicCalendar() {
  const [rangeStartISO, setRangeStartISO] = useState<string>(() => {
    const today = new Date();
    return formatDateISO(getStartOfWeek(today));
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return formatDateISO(today);
  });
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState<number>(0);

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      setError(null);

      const startDate = parseISODate(rangeStartISO);
      const endDate = addDays(startDate, 6);
      const response = await getEconomicCalendar(
        formatDateISO(startDate),
        formatDateISO(endDate)
      );

      if ("message" in response) {
        setEvents([]);
        setTotalEvents(0);
        setError(response.message ?? "Unknown error");
        setLoading(false);
        return;
      }

      const mapped = response.events
        .map(normalizeEvent)
        .filter((event): event is EconomicEvent => event !== null)
        .sort((a, b) => a.sortValue - b.sortValue);

      setEvents(mapped);
      setTotalEvents(response.total);
      setError(null);
      setLoading(false);
    };

    fetchCalendar();
  }, [rangeStartISO]);

  const weekDays = useMemo<WeekDay[]>(() => {
    const startDate = parseISODate(rangeStartISO);
    const counts = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.date] = (acc[event.date] ?? 0) + 1;
      return acc;
    }, {});
    return Array.from({ length: 7 }, (_, index) => {
      const current = addDays(startDate, index);
      const dateStr = formatDateISO(current);
      return {
        date: dateStr,
        label: formatWeekdayLabel(dateStr),
        eventCount: counts[dateStr] ?? 0,
      };
    });
  }, [rangeStartISO, events]);

  const rangeLabel = useMemo(() => {
    const start = rangeStartISO;
    const end = formatDateISO(addDays(parseISODate(rangeStartISO), 6));
    return formatRangeLabel(start, end);
  }, [rangeStartISO]);

  const filteredEvents = useMemo(
    () => events.filter((event) => event.date === selectedDate),
    [events, selectedDate]
  );

  const updateRange = (startDate: Date, selected?: Date) => {
    const startISO = formatDateISO(startDate);
    const selectedISO = formatDateISO(selected ?? startDate);
    setRangeStartISO(startISO);
    setSelectedDate(selectedISO);
    setExpandedIds(new Set());
  };

  const handlePrevWeek = () => {
    const current = parseISODate(rangeStartISO);
    updateRange(addDays(current, -7));
  };

  const handleNextWeek = () => {
    const current = parseISODate(rangeStartISO);
    updateRange(addDays(current, 7));
  };

  const handleToday = () => {
    const now = new Date();
    updateRange(getStartOfWeek(now), now);
  };

  const getImportanceColor = (importance: Importance) =>
    importanceColors[importance];

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedDayLabel = selectedDate
    ? formatLongDayLabel(selectedDate)
    : "Chua chon ngay";

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-cyan-400/30 backdrop-blur-sm shadow-lg">
      <CardContent className="p-6">
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
              onClick={handlePrevWeek}
              aria-label="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              onClick={handleToday}
            >
              Khoảng thời gian
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              onClick={handleNextWeek}
              aria-label="Tuần tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="text-base text-slate-400 ml-2">{rangeLabel}</div>
          </div>
        </div>

        <div className="flex md:grid md:grid-cols-7 overflow-x-auto md:overflow-visible gap-1 mb-6 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg p-2 snap-x snap-mandatory">
          {weekDays.map((day) => {
            const isSelected = selectedDate === day.date;
            return (
              <div
                key={day.date}
                className={`flex flex-col items-center justify-center p-3 rounded-md text-center text-base cursor-pointer transition-all basis-1/4 shrink-0 md:basis-auto md:shrink snap-start ${isSelected
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "text-slate-300 hover:bg-slate-600/50"
                  }`}
                onClick={() => {
                  setSelectedDate(day.date);
                  setExpandedIds(new Set());
                }}
              >
                <div className="font-semibold my-1">{day.label}</div>
                <div className="text-xs text-slate-300">
                  {day.eventCount} Sự kiện
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-4 text-base text-slate-400">{selectedDayLabel}</div>

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
                  Trực tiếp
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-slate-400"
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-red-400"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-slate-400"
                  >
                    Không có sự kiện nào trong ngày nay.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => {
                  const actualValue = formatCellValue(event.actual);
                  return (
                    <React.Fragment key={event.id}>
                      <TableRow
                        className="border-b border-blue-400/10 hover:bg-slate-600/20 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(event.id)}
                      >
                        <TableCell className="text-slate-300 text-base py-4 pl-4 align-top">
                          {event.displayTime}
                        </TableCell>
                        <TableCell className="py-4 align-top">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-200 text-sm font-medium">
                              {event.country}
                            </span>
                            {event.currency ? (
                              <span className="text-xs text-cyan-300 border border-cyan-400/40 rounded px-1 py-0.5">
                                {event.currency}
                              </span>
                            ) : null}
                            <div
                              className={`ml-2 w-2 h-2 rounded-full ${getImportanceColor(
                                event.importance
                              )}`}
                            ></div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-200 text-base py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.title}</span>
                            <ChevronDown
                              className={`w-3 h-3 transition-transform text-slate-500 ${expandedIds.has(event.id)
                                  ? "rotate-180"
                                  : "rotate-0"
                                }`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span
                            className={`text-base ${actualValue !== "--"
                                ? "text-white font-medium"
                                : "text-slate-500"
                              }`}
                          >
                            {actualValue}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="text-base text-slate-400">
                            {formatCellValue(event.forecast)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="text-base text-slate-400">
                            {formatCellValue(event.previous)}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-b border-blue-400/10">
                        <TableCell colSpan={6} className="p-0">
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-out ${expandedIds.has(event.id)
                                ? "max-h-[28rem] opacity-100"
                                : "max-h-0 opacity-0"
                              }`}
                          >
                            <div
                              className={`p-4 bg-slate-700/30 transform transition-transform duration-300 ${expandedIds.has(event.id)
                                  ? "translate-y-0"
                                  : "-translate-y-2"
                                }`}
                            >
                              <div className="text-slate-300 text-sm space-y-1 mb-3">
                                <div>
                                  <span className="text-slate-400">
                                    Mức độ quan trọng:
                                  </span>{" "}
                                  <span className="text-slate-200 font-medium">
                                    {importanceText[event.importance]}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Thời gian:</span>{" "}
                                  <span className="text-slate-200">
                                    {event.displayTime}
                                  </span>
                                </div>
                                {event.currency ? (
                                  <div>
                                    <span className="text-slate-400">
                                      Đồng tiền tệ:
                                    </span>{" "}
                                    <span className="text-slate-200">
                                      {event.currency}
                                    </span>
                                  </div>
                                ) : null}
                              </div>
                              <div className="relative bg-slate-800/40 border border-blue-400/20 rounded-md p-3 h-64">
                                {expandedIds.has(event.id) ? (
                                  <EconomicBarChart series={fallbackSeries} />
                                ) : null}
                                <div className="absolute right-3 top-3 text-xs text-slate-400">
                                  Nguồn: {" "}
                                  {event.sourceUrl ? (
                                    <a
                                      href={event.sourceUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-cyan-300 hover:underline"
                                    >
                                      Mở trang
                                    </a>
                                  ) : (
                                    "Đang cập nhật"
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-slate-500 text-center">
          Tất cả thời gian theo UTC-7. {totalEvents} sự kiện trong khoảng thời
          gian đang xem.
        </div>
      </CardContent>
    </Card>
  );
}


