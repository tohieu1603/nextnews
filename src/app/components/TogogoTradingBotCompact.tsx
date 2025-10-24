"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Lightbulb,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
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
import { getSymbolBots, SymbolBotSummary } from "@/services/api";
import { useSymbolStore } from "@/store/symbol.store";
import { useAuthStore } from "@/store/auth.store";

type StockOption = {
  code: string;
  name: string;
  sector: string;
  symbolId?: number | string;
};

type DecoratedBot = {
  id: string;
  name: string;
  description: string;
  botTypeDisplay: string;
  color: string;
  icon: ReactNode;
  performance: string;
  confidence: number;
  timeframe: string;
  strategy: string;
  symbolName?: string;
  summary?: SymbolBotSummary;
};

type BotCategoryOption = {
  key: string;
  label: string;
};

type TemplateBot = Omit<DecoratedBot, "summary">;

const defaultBotTemplates: TemplateBot[] = [
  {
    id: "momentum",
    name: "Momentum Hunter",
    description: "Săn tìm cổ phiếu tăng mạnh kèm thanh khoản tốt.",
    botTypeDisplay: "Momentum",
    color: "from-emerald-500 to-teal-500",
    icon: <Rocket className="w-6 h-6" />,
    performance: "+18.4%",
    confidence: 89,
    timeframe: "1-2 tuần",
    strategy: "ám theo xu hướng khi giá và volume cùng tăng.",
    symbolName: "Momentum",
  },
  {
    id: "value",
    name: "Value Seeker",
    description: "Tập trung cổ phiếu cơ bản vững, giá cả hợp lý.",
    botTypeDisplay: "Value",
    color: "from-blue-500 to-cyan-500",
    icon: <Target className="w-6 h-6" />,
    performance: "+12.7%",
    confidence: 85,
    timeframe: "2-3 thang",
    strategy: "Pick fundamentally solid businesses with attractive ratios.",
    symbolName: "Value",
  },
  {
    id: "breakout",
    name: "Breakout Trader",
    description: "Theo doi cac diem bung no ky thuat quan trong.",
    botTypeDisplay: "Breakout",
    color: "from-orange-500 to-red-500",
    icon: <TrendingUp className="w-6 h-6" />,
    performance: "+22.1%",
    confidence: 87,
    timeframe: "1-4 tuan",
    strategy: "Vao lenh khi gia vuot khoi vung khang cu.",
    symbolName: "Breakout",
  },
];

const defaultStockOptions: StockOption[] = [
  { code: "VCB", name: "Vietcombank", sector: "Banking" },
  { code: "TCB", name: "Techcombank", sector: "Banking" },
  { code: "HPG", name: "Hoa Phat", sector: "Steel" },
  { code: "MSN", name: "Masan Group", sector: "Consumer" },
  { code: "VHM", name: "Vinhomes", sector: "Real estate" },
  { code: "GAS", name: "PV Gas", sector: "Energy" },
];

const categoryLabels: Record<string, string> = {
  short: "Ngắn hạn",
  medium: "Trung hạn",
  long: "Dài hạn",
};

const normalizeBotCategory = (value?: string | null): string => {
  if (!value) return "";
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
};

const buildDecoratedBots = (summaries: SymbolBotSummary[]): DecoratedBot[] => {
  if (!Array.isArray(summaries) || summaries.length === 0) {
    return defaultBotTemplates.map((template) => ({ ...template }));
  }

  return summaries.map((summary, index) => {
    const template = defaultBotTemplates[index % defaultBotTemplates.length];
    const name =
      typeof summary.name === "string" && summary.name.trim().length > 0
        ? summary.name.trim()
        : template.name;
    const typeDisplay =
      typeof summary.bot_type_display === "string" &&
        summary.bot_type_display.trim().length > 0
        ? summary.bot_type_display.trim()
        : summary.bot_type ?? template.botTypeDisplay;

    return {
      ...template,
      id: String(summary.id ?? `${template.id}-${index}`),
      name,
      botTypeDisplay: typeDisplay,
      description:
        summary.bot_type_display || summary.bot_type
          ? `Trading style: ${typeDisplay}`
          : template.description,
      summary,
      symbolName: summary.symbol_name ?? template.symbolName,
    };
  });
};

const formatDateTime = (value?: string): string => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatNumber = (value?: number | string): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  const numeric =
    typeof value === "string" && value.trim().length > 0
      ? Number(value)
      : (value as number);
  if (typeof numeric !== "number" || Number.isNaN(numeric)) {
    return "-";
  }
  return numeric.toLocaleString("vi-VN");
};

const formatDurationHours = (value?: number | string | null): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  const numeric =
    typeof value === "string" && value.trim().length > 0
      ? Number(value)
      : (value as number);
  if (typeof numeric !== "number" || Number.isNaN(numeric)) {
    return "-";
  }
  return `${numeric}h`;
};

const parseNumericValue = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const numeric = Number(trimmed.replace(/,/g, ""));
    return Number.isNaN(numeric) ? null : numeric;
  }
  return null;
};

type BotTrade = NonNullable<SymbolBotSummary["trades"]>[number];

type CombinedTrade = {
  transId: number | string;
  entryTrade?: BotTrade;
  exitTrade?: BotTrade;
  profit: number | null;
};

type ExpandedTradeRow = {
  transId: number | string;
  leg: "entry" | "exit";
  trade: BotTrade;
  pairedTrade?: BotTrade | undefined;
};

const aggregateTrades = (trades?: BotTrade[]): CombinedTrade[] => {
  if (!Array.isArray(trades) || trades.length === 0) {
    return [];
  }

  const grouped = new Map<number | string, CombinedTrade>();
  const sorted = [...trades].sort((a, b) => {
    const timeA = new Date(a.entry_date ?? a.created_at ?? 0).getTime();
    const timeB = new Date(b.entry_date ?? b.created_at ?? 0).getTime();
    return timeA - timeB;
  });

  sorted.forEach((trade, index) => {
    const rawKey = trade.trans_id ?? trade.id ?? index;
    const key =
      typeof rawKey === "number" || typeof rawKey === "string"
        ? rawKey
        : String(rawKey);
    const combined = grouped.get(key) ?? { transId: key, profit: null };
    const action = (trade.action ?? trade.trade_type ?? "").toLowerCase();
    const isClose =
      action === "close" || (trade.trade_type ?? "").toUpperCase() === "SELL";

    if (isClose) {
      combined.exitTrade = trade;
      const profit = parseNumericValue(trade.profit);
      if (profit !== null) {
        combined.profit = profit;
      }
    } else {
      combined.entryTrade = trade;
      if (combined.profit === null) {
        const profit = parseNumericValue(trade.profit);
        if (profit !== null) {
          combined.profit = profit;
        }
      }
    }

    grouped.set(key, combined);
  });

  return Array.from(grouped.values()).sort((a, b) => {
    const timeA = new Date(
      a.exitTrade?.entry_date ?? a.entryTrade?.entry_date ?? 0
    ).getTime();
    const timeB = new Date(
      b.exitTrade?.entry_date ?? b.entryTrade?.entry_date ?? 0
    ).getTime();
    return timeB - timeA;
  });
};

interface TogogoTradingBotCompactProps {
  initialSymbolCode?: string;
  initialSymbolId?: number | string;
  hideSymbolPicker?: boolean;
  onBotSelected?: (bot: DecoratedBot | null) => void;
}

export function TogogoTradingBotCompact({
  initialSymbolCode,
  initialSymbolId,
  hideSymbolPicker = false,
  onBotSelected,
}: TogogoTradingBotCompactProps) {
  const { symbolMap } = useSymbolStore();
  const accessToken = useAuthStore((state) => state.access_token);

  const normalizedInitialCode = initialSymbolCode
    ? initialSymbolCode.trim().toUpperCase()
    : "";

  const [availableStocks, setAvailableStocks] = useState<StockOption[]>(() => {
    const base = [...defaultStockOptions];
    if (
      normalizedInitialCode &&
      !base.some((stock) => stock.code.toUpperCase() === normalizedInitialCode)
    ) {
      base.unshift({
        code: normalizedInitialCode,
        name: normalizedInitialCode,
        sector: "Ma hien tai",
        symbolId:
          typeof initialSymbolId === "number" || typeof initialSymbolId === "string"
            ? initialSymbolId
            : undefined,
      });
    }
    return base;
  });

  const [selectedStock, setSelectedStock] = useState(
    normalizedInitialCode || availableStocks[0]?.code || ""
  );
  const [selectedSymbolId, setSelectedSymbolId] = useState<number | string | null>(
    initialSymbolId ?? availableStocks[0]?.symbolId ?? null
  );
  const [botSummaries, setBotSummaries] = useState<SymbolBotSummary[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loadingBots, setLoadingBots] = useState(false);

  const mapSymbolToId = useCallback(
    (value: number | string | null | undefined): number | string | null => {
      if (value === null || value === undefined) {
        return null;
      }

      if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
      }

      const stringValue = String(value).trim();
      if (!stringValue) {
        return null;
      }

      if (/^[0-9]+$/.test(stringValue)) {
        return stringValue;
      }

      const normalizedKey = stringValue.toUpperCase();
      if (
        normalizedKey &&
        symbolMap &&
        Object.prototype.hasOwnProperty.call(symbolMap, normalizedKey)
      ) {
        return symbolMap[normalizedKey];
      }

      return null;
    },
    [symbolMap]
  );

  useEffect(() => {
    if (!normalizedInitialCode) return;

    setAvailableStocks((prev) => {
      if (prev.some((item) => item.code.toUpperCase() === normalizedInitialCode)) {
        return prev;
      }
      return [
        {
          code: normalizedInitialCode,
          name: normalizedInitialCode,
          sector: "Ma hien tai",
          symbolId:
            typeof initialSymbolId === "number" || typeof initialSymbolId === "string"
              ? initialSymbolId
              : undefined,
        },
        ...prev,
      ];
    });

    setSelectedStock(normalizedInitialCode);
    setSelectedSymbolId(initialSymbolId ?? normalizedInitialCode);
  }, [normalizedInitialCode, initialSymbolId]);

  useEffect(() => {
    const normalized = selectedStock.trim().toUpperCase();
    if (!normalized) {
      setSelectedSymbolId(null);
      return;
    }

    const directOption = availableStocks.find(
      (stock) => stock.code.toUpperCase() === normalized
    );

    const candidate =
      directOption && directOption.symbolId !== undefined
        ? directOption.symbolId
        : normalized;

    const resolved = mapSymbolToId(candidate) ?? normalized;
    setSelectedSymbolId(resolved);
  }, [selectedStock, availableStocks, mapSymbolToId]);

  useEffect(() => {
    if (!selectedSymbolId) {
      setBotSummaries([]);
      setSelectedBotId(null);
      setLoadingBots(false);
      return;
    }

    if (!accessToken) {
      setBotSummaries([]);
      setSelectedBotId(null);
      setLoadingBots(false);
      return;
    }

    let cancelled = false;
    setLoadingBots(true);

    const targetSymbolId =
      mapSymbolToId(selectedSymbolId) ??
      mapSymbolToId(initialSymbolId) ??
      mapSymbolToId(normalizedInitialCode) ??
      null;

    if (!targetSymbolId) {
      setBotSummaries([]);
      setSelectedBotId(null);
      setLoadingBots(false);
      return;
    }

    const loadBots = async () => {
      try {
        const response = await getSymbolBots(targetSymbolId, accessToken);
        if (cancelled) return;

        if (!response || "message" in response) {
          setBotSummaries([]);
          setSelectedBotId(null);
          return;
        }

        const bots = Array.isArray(response.bots) ? response.bots : [];
        setBotSummaries(bots);
        setSelectedBotId((prev) => {
          const firstId = bots[0]?.id;
          if (!firstId) return null;
          const asString = String(firstId);
          if (prev && bots.some((bot) => String(bot.id) === prev)) {
            return prev;
          }
          return asString;
        });

        if (
          bots.length > 0 &&
          typeof response.symbol_id === "number" &&
          typeof response.symbol_name === "string"
        ) {
          const normalizedCode = response.symbol_name.trim().toUpperCase();
          if (normalizedCode.length > 0) {
            setAvailableStocks((prev) => {
              const map = new Map<string, StockOption>();
              prev.forEach((item) => {
                map.set(item.code.toUpperCase(), item);
              });
              const existing = map.get(normalizedCode);
              map.set(normalizedCode, {
                code: normalizedCode,
                name: existing?.name ?? response.symbol_name,
                sector: existing?.sector ?? "Bot suggestion",
                symbolId: response.symbol_id,
              });
              return Array.from(map.values()).sort((a, b) =>
                a.code.localeCompare(b.code)
              );
            });
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load trading bots:", error);
          setBotSummaries([]);
          setSelectedBotId(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingBots(false);
        }
      }
    };

    void loadBots();

    return () => {
      cancelled = true;
    };
  }, [
    selectedSymbolId,
    accessToken,
    mapSymbolToId,
    initialSymbolId,
    normalizedInitialCode,
  ]);

  const decoratedBots = useMemo(
    () => buildDecoratedBots(botSummaries),
    [botSummaries]
  );

  const categories = useMemo<BotCategoryOption[]>(() => {
    const map = new Map<string, string>();
    decoratedBots.forEach((bot) => {
      const key = normalizeBotCategory(
        bot.summary?.bot_type ?? bot.summary?.bot_type_display ?? ""
      );
      if (!key) return;
      const fallbackLabel =
        bot.summary?.bot_type_display ??
        bot.summary?.bot_type ??
        bot.botTypeDisplay ??
        key;
      if (!map.has(key)) {
        map.set(key, categoryLabels[key] ?? fallbackLabel);
      }
    });
    return Array.from(map.entries()).map(([key, label]) => ({
      key,
      label,
    }));
  }, [decoratedBots]);

  useEffect(() => {
    if (selectedCategory === "all") return;
    if (!categories.some((category) => category.key === selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [categories, selectedCategory]);

  const filteredDecoratedBots = useMemo(() => {
    if (selectedCategory === "all" || categories.length === 0) {
      return decoratedBots;
    }
    return decoratedBots.filter((bot) => {
      const key = normalizeBotCategory(
        bot.summary?.bot_type ?? bot.summary?.bot_type_display ?? ""
      );
      return key === selectedCategory;
    });
  }, [decoratedBots, selectedCategory, categories]);

  useEffect(() => {
    const available =
      filteredDecoratedBots.length > 0 ? filteredDecoratedBots : decoratedBots;
    if (available.length === 0) {
      setSelectedBotId(null);
      return;
    }
    setSelectedBotId((prev) => {
      if (prev && available.some((bot) => bot.id === prev)) {
        return prev;
      }
      return available[0].id;
    });
  }, [filteredDecoratedBots, decoratedBots]);

  const currentDecoratedBot =
    (selectedBotId
      ? decoratedBots.find((bot) => bot.id === selectedBotId)
      : filteredDecoratedBots[0] ?? decoratedBots[0]) ?? null;

  const currentBotSummary = currentDecoratedBot?.summary ?? null;

  const combinedTrades = useMemo(
    () => aggregateTrades(currentBotSummary?.trades),
    [currentBotSummary]
  );

  const tradeStats = useMemo(() => {
    if (combinedTrades.length === 0) {
      return {
        total: 0,
        wins: 0,
        losses: 0,
        neutral: 0,
        winRate: 0,
        pnl: 0,
      };
    }

    let wins = 0;
    let losses = 0;
    let totalProfit = 0;

    combinedTrades.forEach(({ profit }) => {
      if (profit === null) {
        return;
      }
      totalProfit += profit;
      if (profit > 0) wins += 1;
      if (profit < 0) losses += 1;
    });

    const total = combinedTrades.length;
    const neutral = Math.max(total - wins - losses, 0);
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    return {
      total,
      wins,
      losses,
      neutral,
      winRate,
      pnl: Number(totalProfit.toFixed(2)),
    };
  }, [combinedTrades]);

  const combinedTradesToDisplay = combinedTrades.slice(0, 5);

  const expandedTrades = useMemo<ExpandedTradeRow[]>(() => {
    const rows: ExpandedTradeRow[] = [];
    combinedTradesToDisplay.forEach((combined) => {
      if (combined.entryTrade) {
        rows.push({
          transId: combined.transId,
          leg: "entry",
          trade: combined.entryTrade,
          pairedTrade: combined.exitTrade,
        });
      }
      if (combined.exitTrade) {
        rows.push({
          transId: combined.transId,
          leg: "exit",
          trade: combined.exitTrade,
          pairedTrade: combined.entryTrade,
        });
      }
    });
    return rows;
  }, [combinedTradesToDisplay]);

  const latestAggregatedTrade = combinedTradesToDisplay[0];
  const latestSignalLabel = latestAggregatedTrade
    ? latestAggregatedTrade.exitTrade?.action ??
      latestAggregatedTrade.exitTrade?.trade_type ??
      latestAggregatedTrade.entryTrade?.action ??
      latestAggregatedTrade.entryTrade?.trade_type ??
      "-"
    : "-";
  const latestTimestamp = latestAggregatedTrade
    ? latestAggregatedTrade.exitTrade?.entry_date ??
      latestAggregatedTrade.exitTrade?.created_at ??
      latestAggregatedTrade.entryTrade?.entry_date ??
      latestAggregatedTrade.entryTrade?.created_at ??
      null
    : null;

  useEffect(() => {
    if (onBotSelected) {
      onBotSelected(currentDecoratedBot ?? null);
    }
  }, [currentDecoratedBot, onBotSelected]);

  const handleBotCardClick = (botId: string) => {
    setSelectedBotId(botId);
  };

  const getSymbolHref = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const option = availableStocks.find(
      (stock) => stock.code.toUpperCase() === normalized
    );
    if (option && option.symbolId !== undefined) {
      return `/viewdetails/${option.symbolId}`;
    }
    if (
      symbolMap &&
      Object.prototype.hasOwnProperty.call(symbolMap, normalized)
    ) {
      return `/viewdetails/${symbolMap[normalized]}`;
    }
    return `/viewdetails/${normalized}`;
  };

  const symbolDisplayName =
    currentBotSummary?.symbol_name ?? selectedStock.toUpperCase();

  const categoryButtons =
    categories.length > 0
      ? [{ key: "all", label: "Tất cả" }, ...categories]
      : [];

  return (
    <div className="space-y-8">
      {categoryButtons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoryButtons.map((option) => {
            const isActive = selectedCategory === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedCategory(option.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${isActive
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.35)]"
                    : "border-blue-400/30 text-slate-300 hover:border-cyan-400/40 hover:text-white hover:bg-slate-700/40"
                  }`}
              >
                {option.key === "all" ? <Sparkles className="w-4 h-4" /> : null}
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2 grid-cols-1">
        {loadingBots
          ? Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`bot-skeleton-${index}`}
              className="rounded-2xl border border-blue-400/20 bg-slate-800/40 p-5 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-slate-700/80" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-slate-700/80" />
                  <div className="h-3 w-full rounded bg-slate-700/60" />
                </div>
              </div>
              <div className="h-3 w-1/2 rounded bg-slate-700/60" />
            </div>
          ))
          : filteredDecoratedBots.map((bot) => {
            const isActive = selectedBotId === bot.id;
            return (
              <button
                key={bot.id}
                type="button"
                onClick={() => handleBotCardClick(bot.id)}
                className={`group relative flex h-full flex-col justify-between rounded-2xl border px-5 py-6 text-left transition-all duration-300 ${isActive
                    ? "border-cyan-400/60 bg-slate-900/70 shadow-[0_0_30px_rgba(34,211,238,0.25)]"
                    : "border-blue-400/15 bg-slate-800/40 hover:border-cyan-400/40 hover:bg-slate-800/70"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${bot.color} shadow-lg transition-transform group-hover:scale-105`}
                  >
                    {bot.icon}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-lg font-semibold text-white">
                        {bot.name}
                      </h4>
                      {bot.summary && (
                        <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/40">
                          <Sparkles className="mr-1 h-3 w-3" />
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-300">
                      {bot.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-blue-400/20 bg-slate-900/40 p-3">
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      Khung thời gian
                    </span>
                    <div className="mt-1 font-semibold text-cyan-200">
                      {bot.timeframe}
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-400/20 bg-slate-900/40 p-3">
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      Hiệu suất
                    </span>
                    <div className="mt-1 font-semibold text-emerald-300">
                      {bot.performance}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <span>{bot.botTypeDisplay}</span>
                  </div>
                  <span className="font-medium text-slate-300">
                    {bot.symbolName ?? symbolDisplayName}
                  </span>
                </div>
                {isActive && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-400/40" />
                )}
              </button>
            );
          })}
      </div>

      {!loadingBots && botSummaries.length === 0 && (
        <div className="rounded-2xl border border-blue-400/20 bg-slate-800/40 p-6 text-sm text-slate-300">
          Chua co bot nao duoc kich hoat cho ma {selectedStock}. Mua ban quyen de mo khoa them chien luoc.
        </div>
      )}

      <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${currentDecoratedBot?.color ?? "from-blue-500 to-cyan-500"} shadow-xl`}
            >
              {currentDecoratedBot?.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-white truncate">
                  {currentDecoratedBot?.name ?? "Trading Bot"}
                </span>
                {currentBotSummary?.bot_type_display && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {currentBotSummary.bot_type_display}
                  </Badge>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Gợi ý cho mã <span className="text-cyan-300">{symbolDisplayName}</span>
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-blue-400/20 bg-slate-900/40 p-4 shadow-inner">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Hiệu suất tham chiếu
              </span>
              <div className="mt-2 text-2xl font-bold text-emerald-300">
                {currentDecoratedBot?.performance ?? "-"}
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Khung thời gian:{" "}
                <span className="text-slate-200">
                  {currentDecoratedBot?.timeframe ?? "-"}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-400/20 bg-slate-900/40 p-4 shadow-inner">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Độ tin cậy mô phỏng
              </span>
              <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-cyan-300">
                {currentDecoratedBot?.confidence ?? 0}%
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Chien luoc:{" "}
                <span className="text-slate-200">
                  {currentDecoratedBot?.botTypeDisplay ?? "N/A"}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-400/20 bg-slate-900/40 p-4 shadow-inner">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Ty le thang
              </span>
              <div className="mt-2 text-2xl font-bold text-emerald-300">
                {tradeStats.total > 0 ? `${tradeStats.winRate}%` : "-"}
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Thang / Thua / Hoa:{" "}
                <span className="text-slate-200">
                  {tradeStats.wins}/{tradeStats.losses}/{tradeStats.neutral}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-400/20 bg-slate-900/40 p-4 shadow-inner">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                PnL rong
              </span>
              <div
                className={`mt-2 text-2xl font-bold ${tradeStats.pnl >= 0 ? "text-emerald-300" : "text-red-300"
                  }`}
              >
                {tradeStats.total > 0 ? formatNumber(tradeStats.pnl) : "-"}
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Tong lenh:{" "}
                <span className="text-slate-200">{tradeStats.total}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-400/20 bg-slate-900/40 p-5">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-cyan-300" />
              <span className="text-sm font-medium text-slate-200">
                Ghi chu chien luoc
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              {currentDecoratedBot?.strategy ??
                "Thong tin se duoc cap nhat ngay khi bot phat sinh giao dich moi tu he thong."}
            </p>
          </div>

          <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/30 bg-slate-800/60">
                  <Target className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">
                    Lich su giao dich
                  </p>
                  <p className="text-sm text-slate-400">
                    Tong cong {tradeStats.total} lenh duoc ghi nhan cho bot nay.
                  </p>
                </div>
              </div>
              {combinedTradesToDisplay.length > 0 && (
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                  Cap nhat cuoi: {formatDateTime(latestTimestamp ?? undefined)}
                </Badge>
              )}
            </div>


          {expandedTrades.length > 0 ? (
            <>
              <div className="hidden rounded-2xl border border-blue-400/20 bg-slate-900/40 md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-blue-400/20 text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Trans ID</th>
                        <th className="px-4 py-3 text-left font-semibold">Action</th>
                        <th className="px-4 py-3 text-left font-semibold">Direction</th>
                        <th className="px-4 py-3 text-right font-semibold">Entry price</th>
                        <th className="px-4 py-3 text-right font-semibold">Exit price</th>
                        <th className="px-4 py-3 text-right font-semibold">PnL</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                        <th className="px-4 py-3 text-left font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-400/10 text-slate-200">
                      {expandedTrades.map((row) => {
                        const baseTrade = row.trade;
                        const counterpart = row.pairedTrade;
                        const isExit = row.leg === "exit";

                        const actionLabel = baseTrade.action ?? baseTrade.trade_type ?? row.leg.toUpperCase();
                        const directionLabel = baseTrade.direction ?? "-";
                        const statusLabel = baseTrade.win_loss_status ?? counterpart?.win_loss_status ?? "-";

                        const entryPriceValue = isExit
                          ? counterpart?.price ?? counterpart?.exit_price ?? baseTrade.price ?? null
                          : baseTrade.price ?? null;
                        const exitPriceValue = isExit
                          ? baseTrade.price ?? baseTrade.exit_price ?? null
                          : baseTrade.exit_price ?? null;
                        const formattedEntryPrice =
                          entryPriceValue !== null && entryPriceValue !== undefined
                            ? formatNumber(entryPriceValue)
                            : "-";
                        const formattedExitPrice =
                          exitPriceValue !== null && exitPriceValue !== undefined && exitPriceValue !== "0.00"
                            ? formatNumber(exitPriceValue)
                            : "-";

                        const profitValue = isExit ? parseNumericValue(baseTrade.profit) : null;
                        const profitClass =
                          profitValue === null
                            ? ""
                            : profitValue < 0
                            ? "text-red-300"
                            : profitValue > 0
                            ? "text-emerald-300"
                            : "";
                        const profitCellClassName = [
                          "px-4 py-3 text-right font-mono font-semibold",
                          profitClass,
                        ]
                          .filter(Boolean)
                          .join(" ");
                        const formattedProfit =
                          profitValue === null ? "-" : formatNumber(profitValue);

                        const timestamp =
                          isExit
                            ? baseTrade.entry_date ?? baseTrade.created_at ?? counterpart?.entry_date ?? counterpart?.created_at ?? undefined
                            : baseTrade.entry_date ?? baseTrade.created_at ?? undefined;
                        const durationValue =
                          baseTrade.max_duration ?? counterpart?.max_duration ?? null;

                        return (
                          <tr key={`${row.transId}-${row.leg}`} className="hover:bg-slate-800/60">
                            <td className="px-4 py-3 text-slate-300">{row.transId}</td>
                            <td className="px-4 py-3 text-slate-300">{actionLabel}</td>
                            <td className="px-4 py-3 text-slate-300">{directionLabel}</td>
                            <td className="px-4 py-3 text-right font-mono text-slate-200">
                              {formattedEntryPrice}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-slate-200">
                              {formattedExitPrice}
                            </td>
                            <td className={profitCellClassName}>{formattedProfit}</td>
                            <td className="px-4 py-3 text-slate-300">{statusLabel}</td>
                            <td className="px-4 py-3 text-slate-300">
                              {formatDateTime(timestamp)}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {formatDurationHours(durationValue)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-3 md:hidden">
                {expandedTrades.map((row) => {
                  const baseTrade = row.trade;
                  const counterpart = row.pairedTrade;
                  const isExit = row.leg === "exit";

                  const actionLabel = baseTrade.action ?? baseTrade.trade_type ?? row.leg.toUpperCase();
                  const directionLabel = baseTrade.direction ?? "-";
                  const statusLabel = baseTrade.win_loss_status ?? counterpart?.win_loss_status ?? "-";

                  const entryTimestamp =
                    baseTrade.entry_date ?? baseTrade.created_at ?? undefined;
                  const exitTimestamp = isExit
                    ? baseTrade.entry_date ?? baseTrade.created_at ?? counterpart?.entry_date ?? counterpart?.created_at ?? undefined
                    : counterpart?.entry_date ?? counterpart?.created_at ?? undefined;

                  const entryPriceValue = isExit
                    ? counterpart?.price ?? counterpart?.exit_price ?? baseTrade.price ?? null
                    : baseTrade.price ?? null;
                  const exitPriceValue = isExit
                    ? baseTrade.price ?? baseTrade.exit_price ?? null
                    : baseTrade.exit_price ?? null;
                  const formattedEntryPrice =
                    entryPriceValue !== null && entryPriceValue !== undefined
                      ? formatNumber(entryPriceValue)
                      : "-";
                  const formattedExitPrice =
                    exitPriceValue !== null && exitPriceValue !== undefined && exitPriceValue !== "0.00"
                      ? formatNumber(exitPriceValue)
                      : "-";

                  const profitValue = isExit ? parseNumericValue(baseTrade.profit) : null;
                  const profitClass =
                    profitValue === null
                      ? ""
                      : profitValue < 0
                      ? "text-red-300"
                      : profitValue > 0
                      ? "text-emerald-300"
                      : "";
                  const mobileProfitTextClassName = ["font-semibold", profitClass]
                    .filter(Boolean)
                    .join(" ");
                  const formattedProfit =
                    profitValue === null ? "-" : formatNumber(profitValue);

                  const durationValue =
                    baseTrade.max_duration ?? counterpart?.max_duration ?? null;

                  return (
                    <div
                      key={`${row.transId}-${row.leg}`}
                      className="rounded-xl border border-blue-400/20 bg-slate-900/40 p-4"
                    >
                      <div className="flex items-center justify-between text-xs uppercase text-blue-200">
                        <span className="font-semibold">{actionLabel}</span>
                        <span className="text-slate-400">{directionLabel}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Trans ID: <span className="text-slate-200">{row.transId}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Status: <span className="text-slate-200">{statusLabel}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        Entry time: <span className="text-slate-200">{formatDateTime(entryTimestamp)}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Exit time: <span className="text-slate-200">{formatDateTime(exitTimestamp)}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div>
                          Entry price: <span className="text-slate-200">{formattedEntryPrice}</span>
                        </div>
                        <div>
                          Exit price: <span className="text-slate-200">{formattedExitPrice}</span>
                        </div>
                        <div className="col-span-2">
                          PnL: <span className={mobileProfitTextClassName}>{formattedProfit}</span>
                        </div>
                        <div>
                          Duration: <span className="text-slate-200">{formatDurationHours(durationValue)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-blue-400/20 bg-slate-900/40 p-6 text-center text-sm text-slate-300">
              Bot has not recorded any trades yet. Check back after the next signal.
            </div>
          )}
        </div>
          {!hideSymbolPicker && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-400" />
                <span className="font-medium text-slate-200">
                  Pick another symbol
                </span>
              </div>
              <Select value={selectedStock} onValueChange={setSelectedStock}>
                <SelectTrigger className="bg-slate-700/40 border-blue-400/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-blue-400/30">
                  {availableStocks.map((stock) => (
                    <SelectItem
                      key={stock.code}
                      value={stock.code}
                      className="text-white hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-cyan-400">{stock.code}</span>
                        <span className="text-slate-400">-</span>
                        <span className="text-sm text-slate-300">{stock.name}</span>
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
          )}

          <div className="space-y-3">
            <Link href={getSymbolHref(selectedStock)}>
              <Button className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white shadow-lg">
                <Target className="w-4 h-4 mr-2" />
                View details for {selectedStock.toUpperCase()}
              </Button>
            </Link>
          {!hideSymbolPicker && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-blue-400/30 text-slate-200 hover:bg-blue-500/20 hover:text-white hover:border-blue-400/50"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Explore more bots
              </Button>
              <Button
                variant="outline"
                className="border-teal-400/30 text-slate-200 hover:bg-teal-500/20 hover:text-white hover:border-teal-400/50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Activate services
              </Button>
            </div>
          )}
          </div>

          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-400/20">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total trades recorded:</span>
                <span className="font-bold text-white">
                  {currentBotSummary?.trades?.length ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latest signal:</span>
                <span className="font-bold text-cyan-400">
                  {latestSignalLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Suggested timeframe:</span>
                <span className="font-bold text-emerald-400">
                  {currentDecoratedBot?.timeframe ?? "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Strategy snapshot:</span>
                <span className="font-bold text-amber-300">
                  {currentDecoratedBot?.strategy ?? "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-3 border border-amber-400/20">
            <p className="text-sm text-amber-300 leading-relaxed">
              Reminder: these bots support your decision making. Always review your risk and portfolio plan before trading.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export type { DecoratedBot };
