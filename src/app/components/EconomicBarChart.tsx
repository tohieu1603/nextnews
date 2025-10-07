"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type {
  ComposeOption,
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
  BarSeriesOption,
  MarkAreaComponentOption,
} from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export type SeriesPoint = {
  label: string;
  /** Dùng 1 trong 2: value (actual) đơn giản, hoặc actual/forecast chi tiết */
  value?: number | null;
  actual?: number | null;
  forecast?: number | null;
};

type ECOption = ComposeOption<
  | GridComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | XAXisComponentOption
  | YAXisComponentOption
  | BarSeriesOption
  | MarkAreaComponentOption
>;

type TooltipItem = {
  seriesName: string;
  axisValueLabel: string;
  marker: string;
  data: number | null | undefined;
};

type Props = {
  series: SeriesPoint[];
  className?: string;
  actualName?: string; // nhãn legend cho “Thực tế”
  forecastName?: string; // nhãn legend cho “Dự đoán”
};

export default function EconomicBarChart({
  series,
  className,
  actualName = "Thực tế %",
  forecastName = "Dự đoán %",
}: Props) {
  // Chuẩn hoá dữ liệu: cho phép truyền {label, value} hoặc {label, actual, forecast}
  const { labels, actual, forecast, forecastStartIdx } = useMemo(() => {
    const labels = series.map((d) => d.label);
    const actual = series.map((d) =>
      d.actual !== undefined ? d.actual : d.value ?? null
    );
    const forecast = series.map((d) =>
      d.forecast !== undefined ? d.forecast : null
    );

    // Tìm điểm bắt đầu vùng forecast (sau last actual)
    let lastActual = -1;
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== null && actual[i] !== undefined) lastActual = i;
    }
    const forecastStartIdx =
      lastActual >= 0 && lastActual < labels.length - 1 ? lastActual + 1 : -1;

    return { labels, actual, forecast, forecastStartIdx };
  }, [series]);

  const option = useMemo<ECOption>(() => {
    const hasForecast = forecast.some((v) => v !== null && v !== undefined);
    const actualClean = actual.map((v) => (v == null ? undefined : v));
    const forecastClean = forecast.map((v) => (v == null ? undefined : v));

    const seriesArr: BarSeriesOption[] = [];

    seriesArr.push({
      name: actualName,
      type: "bar",
      barWidth: 18,
      data: actualClean as BarSeriesOption["data"],
      itemStyle: { color: "#3b82f6", borderRadius: [4, 4, 0, 0] },
      z: 10,
    });

    if (hasForecast) {
      const forecastSeries: BarSeriesOption = {
        name: forecastName,
        type: "bar",
        barWidth: 18,
        data: forecastClean as BarSeriesOption["data"],
        itemStyle: { color: "#d9dde5", borderRadius: [4, 4, 0, 0] },
        markArea:
          forecastStartIdx >= 0
            ? {
                silent: true,
                // FIX 2: chỉ màu nền; nếu muốn gạch chéo, xem chú thích bên dưới
                itemStyle: { color: "rgba(125,130,160,0.10)" },
                data: [
                  [
                    { xAxis: labels[forecastStartIdx] },
                    { xAxis: labels[labels.length - 1] },
                  ],
                ],
              }
            : undefined,
        z: 1,
      };

      // (Tùy chọn) thêm gạch chéo cho vùng forecast – bỏ comment 4 dòng dưới nếu muốn
      if (forecastSeries.markArea) {
        forecastSeries.markArea.itemStyle = {
          color: "rgba(125,130,160,0.10)",
          decal: {
            symbol: "line",
            dashArrayX: [4, 4],
            dashArrayY: [2, 2],
            rotation: Math.PI / 4,
          },
        };
      }

      seriesArr.push(forecastSeries);
    }

    return {
      grid: { left: 8, right: 12, top: 24, bottom: 24, containLabel: true },
      legend: hasForecast
        ? {
            data: [actualName, forecastName],
            textStyle: {
              color: "#e2e8f0", // màu chữ legend (phù hợp nền tối)
              fontSize: 12,
              fontWeight: 500,
            },
            inactiveColor: "#64748b",
            selectedMode: false,
          }
        : undefined,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: unknown) => {
          const arr = (params as TooltipItem[]) ?? [];
          if (!arr.length) return "";
          const name = arr[0].axisValueLabel ?? "";
          const lines = arr
            .filter((p) => p.data !== null && p.data !== undefined)
            .map((p) => `${p.marker} ${p.seriesName}: <b>${p.data}</b>`);
          return `<div style="font-weight:600;margin-bottom:4px">${name}</div>${lines.join(
            "<br/>"
          )}`;
        },
      },
      xAxis: {
        type: "category",
        data: labels,
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        splitLine: {
          lineStyle: {
            color: "rgba(148,163,184,0.05)", // màu/độ mờ
            width: 1,
            type: "solid", // "dashed" hoặc "dotted" nếu muốn gạch
          },
        },
      },
      animation: false,
      progressive: 4000,
      series: seriesArr,
    };
  }, [labels, actual, forecast, forecastStartIdx, actualName, forecastName]);

  return (
    <div className={`${className} w-full h-full`}>
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        notMerge
      />
    </div>
  );
}
