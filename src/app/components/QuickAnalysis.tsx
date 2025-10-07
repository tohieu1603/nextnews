"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { getSymbolData, getCompanyDetails } from "@/services/api";
import { useSymbolStore } from "@/store/symbol.store";
import { getStockAnalysis } from "@/components/helpers/detailedAnalysisHelpers";
import dayjs from "dayjs";

const getTrendIcon = (trend: string) => {
  return trend === "up" ? (
    <TrendingUp className="w-4 h-4" />
  ) : (
    <TrendingDown className="w-4 h-4" />
  );
};

const getRecommendationColor = (rec: string) => {
  switch (rec) {
    case "STRONG_BUY":
      return "text-emerald-300 bg-emerald-500/20 border-emerald-400/50";
    case "BUY":
      return "text-blue-300 bg-blue-500/20 border-blue-400/50";
    case "HOLD":
      return "text-amber-300 bg-amber-500/20 border-amber-400/50";
    case "SELL":
      return "text-red-300 bg-red-500/20 border-red-400/50";
    default:
      return "text-slate-300 bg-slate-500/20 border-slate-400/50";
  }
};

const getRecommendationIcon = (rec: string) => {
  switch (rec) {
    case "STRONG_BUY":
      return <ArrowUpRight className="w-3 h-3" />;
    case "BUY":
      return <TrendingUp className="w-3 h-3" />;
    case "HOLD":
      return <Minus className="w-3 h-3" />;
    case "SELL":
      return <ArrowDownRight className="w-3 h-3" />;
    default:
      return <AlertCircle className="w-3 h-3" />;
  }
};

export function QuickAnalysis() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SymbolByNameData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [detailedInfo, setDetailedInfo] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  type SymbolByNameData = {
    name: string;
    id: string;
    exchange: string;
    updated_at: string;
  };
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const symbolData = await getSymbolData("");
        setData(symbolData);
        useSymbolStore.getState().setSymbolMap(symbolData);

        // Auto-select first stock
        if (symbolData && symbolData.length > 0 && !selectedStock) {
          setSelectedStock(symbolData[0].name);
        }
      } catch (err) {
        setError("Không lấy được dữ liệu symbol");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchSymbols();
  }, []);

  // Fetch detailed info when selected stock changes
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedStock || !data) return;

      const selectedData = data.find((stock) => stock.name === selectedStock);
      if (!selectedData) return;

      setLoadingDetails(true);
      try {
        const details = await getCompanyDetails(Number(selectedData.id));
        setDetailedInfo(details);
      } catch (err) {
        console.error("Error fetching company details:", err);
        setDetailedInfo(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedStock, data]);

  const selectedData = data?.find((stock) => stock.name === selectedStock);
  const stockAnalysis = selectedStock ? getStockAnalysis(selectedStock) : null;

  console.log("Selected Data:", selectedData);
  console.log("Stock Analysis:", stockAnalysis);
  console.log("Detailed Info:", detailedInfo);

  return (
    <div className="space-y-6">
      {/* Stock Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {data?.map((data) => (
          <Card
            key={data.name}
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${selectedStock === data.name
              ? "ring-2 ring-blue-400 bg-blue-500/20 border-blue-400/50"
              : "hover:bg-gray-800/60 bg-gray-800/40 border-gray-600/30 hover:border-gray-500/50"
              }`}
            onClick={() => setSelectedStock(data.name)}
          >
            <CardContent className="p-3 text-center">
              <div className="text-base font-medium mb-1 text-white">
                {data.name}
              </div>
              <div className="text-sm text-gray-300 mb-1">{data.name}</div>
              <div
                className={`text-sm flex items-center justify-center gap-1 ${data.id === "up" ? "text-emerald-400" : "text-red-400"
                  }`}
              >
                {getTrendIcon(data.id)}
                <span>{data.id}</span>
              </div>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className={`text-xs ${getRecommendationColor(data.name)}`}
                >
                  {getRecommendationIcon(data.name)}
                  <span className="ml-1">
                    {data.name === "STRONG_BUY"
                      ? "MUA MẠNH"
                      : data.name === "BUY"
                        ? "MUA"
                        : data.name === "HOLD"
                          ? "GIỮ"
                          : "BÁN"}
                  </span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analysis Content */}
      <div className="">
        {/* Chart and Visual Section */}
        <div className="">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/60 border border-gray-600/30">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-white text-gray-300"
              >
                <BarChart3 className="w-4 h-4" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger
                value="technical"
                className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-white text-gray-300"
              >
                <Activity className="w-4 h-4" />
                Kỹ thuật
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-white text-gray-300"
              >
                <Eye className="w-4 h-4" />
                Tin tức
              </TabsTrigger>
            </TabsList>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 w-full">
              <div className="lg:col-span-2">
                <TabsContent value="overview">
                  <Card className="bg-gray-800/60 border border-gray-600/30">
                    <CardContent className="p-4">
                      {/* Stock Chart */}
                      {/* <div className="bg-gray-800/40 rounded-lg p-4 mb-4 border border-gray-600/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white text-lg">
                              {selectedData?.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className="text-xs text-blue-300 border-blue-400/50 bg-blue-400/10"
                            >
                              {selectedData.sector}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>Cập nhật: 14:32</span>
                          </div>
                        </div>

                        <Image
                          width={1080}
                          height={720}
                          src="/temp.jpg"
                          alt={`Biểu đồ giao dịch ${selectedData.name}`}
                          className="w-full h-48 object-cover rounded"
                        />
                      </div> */}

                      {/* Simple Text Analysis */}
                      <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-400" />
                          Thông tin phân tích
                        </h4>
                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-400/20">
                          <h5 className="text-base font-medium text-slate-400 mb-3">
                            {selectedData?.name} - {selectedData?.exchange}
                          </h5>
                          {loadingDetails ? (
                            <div className="text-center py-4">
                              <div className="text-slate-400">Đang tải thông tin phân tích...</div>
                            </div>
                          ) : stockAnalysis ? (
                            <div className="space-y-3">
                              {/* <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                                  <div className="text-sm text-slate-400">Giá hiện tại</div>
                                  <div className="font-bold text-white text-lg">{stockAnalysis.currentPrice}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                                  <div className="text-sm text-slate-400">Biến động</div>
                                  <div className={`font-bold text-lg ${
                                    stockAnalysis.change?.startsWith("+") ? "text-emerald-400" : "text-red-400"
                                  }`}>
                                    {stockAnalysis.change}
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                                  <div className="text-sm text-slate-400">P/E</div>
                                  <div className="font-bold text-blue-400">{stockAnalysis.pe}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                                  <div className="text-sm text-slate-400">ROE</div>
                                  <div className="font-bold text-emerald-400">{stockAnalysis.roe}</div>
                                </div>
                              </div> */}

                              <div className="pt-3 border-t border-slate-600/50">
                                {/* <div className="text-slate-300">
                                  <span className="text-slate-400">Khuyến nghị: </span>
                                  <span className={`font-medium ${
                                    stockAnalysis.recommendation === "STRONG_BUY" ? "text-emerald-400" :
                                    stockAnalysis.recommendation === "BUY" ? "text-blue-400" :
                                    stockAnalysis.recommendation === "SELL" ? "text-red-400" : "text-yellow-400"
                                  }`}>
                                    {stockAnalysis.recommendation === "STRONG_BUY" ? "MUA MẠNH" :
                                     stockAnalysis.recommendation === "BUY" ? "MUA" :
                                     stockAnalysis.recommendation === "SELL" ? "BÁN" : "GIỮ"}
                                  </span>
                                </div> */}
                                {/* <div className="text-slate-300 mt-2">
                                  <span className="text-slate-400">Ngành: </span>
                                  <span className="font-medium text-cyan-400">{stockAnalysis.sector}</span>
                                </div> */}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-slate-400">
                              Không có dữ liệu phân tích
                            </div>
                          )}
                        </div>
                        {/* <div className="bg-gray-800/40 rounded-lg border border-gray-600/30 p-4">
                          <div className="space-y-2 text-base leading-relaxed">
                            <p className="text-gray-300">
                              <span className="text-gray-400">RSI (14):</span>
                              <span
                                className={`ml-2 font-medium ${selectedData.technical.rsi > 70
                                  ? "text-red-400"
                                  : selectedData.technical.rsi < 30
                                    ? "text-emerald-400"
                                    : "text-yellow-400"
                                  }`}
                              >
                                {selectedData.technical.rsi}
                                {selectedData.technical.rsi > 70
                                  ? " (Quá mua)"
                                  : selectedData.technical.rsi < 30
                                    ? " (Quá bán)"
                                    : " (Trung tính)"}
                              </span>
                            </p>

                            <p className="text-slate-300">
                              <span className="text-slate-400">MACD:</span>
                              <span
                                className={`ml-2 font-medium ${selectedData.technical.macd.includes(
                                  "Bullish"
                                )
                                  ? "text-emerald-400"
                                  : selectedData.technical.macd.includes(
                                    "Bearish"
                                  )
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                  }`}
                              >
                                {selectedData.technical.macd}
                              </span>
                            </p>

                            <p className="text-slate-300">
                              <span className="text-slate-400">
                                Đường trung bình 20:
                              </span>
                              <span
                                className={`ml-2 font-medium ${selectedData.technical.ma20 === "Above"
                                  ? "text-emerald-400"
                                  : selectedData.technical.ma20 === "Below"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                  }`}
                              >
                                {selectedData.technical.ma20 === "Above"
                                  ? "Trên MA20"
                                  : selectedData.technical.ma20 === "Below"
                                    ? "Dưới MA20"
                                    : "Tại MA20"}
                              </span>
                            </p>

                            <p className="text-slate-300">
                              <span className="text-slate-400">
                                Vùng hỗ trợ:
                              </span>
                              <span className="ml-2 font-medium text-cyan-400">
                                {selectedData.technical.support}
                              </span>
                              <span className="text-slate-400"> • </span>
                              <span className="text-slate-400">
                                Vùng kháng cự:
                              </span>
                              <span className="ml-1 font-medium text-orange-400">
                                {selectedData.technical.resistance}
                              </span>
                            </p>

                            <p className="text-slate-300">
                              <span className="text-slate-400">
                                Khối lượng giao dịch:
                              </span>
                              <span className="ml-2 font-medium text-white">
                                {selectedData.volume}
                              </span>
                              <span className="text-slate-400"> • </span>
                              <span className="text-slate-400">Giá trị:</span>
                              <span className="ml-1 font-medium text-white">
                                {selectedData.value}
                              </span>
                            </p>

                            <div className="pt-2 border-t border-slate-600/50">
                              <p className="text-slate-300">
                                <span className="text-slate-400">
                                  Khuyến nghị đầu tư:
                                </span>
                                <span
                                  className={`ml-2 font-medium ${selectedData.recommendation === "STRONG_BUY"
                                    ? "text-emerald-400"
                                    : selectedData.recommendation === "BUY"
                                      ? "text-blue-400"
                                      : selectedData.recommendation === "SELL"
                                        ? "text-red-400"
                                        : "text-yellow-400"
                                    }`}
                                >
                                  {selectedData.recommendation === "STRONG_BUY"
                                    ? "MUA MẠNH"
                                    : selectedData.recommendation === "BUY"
                                      ? "MUA"
                                      : selectedData.recommendation === "SELL"
                                        ? "BÁN"
                                        : "GIỮ"}
                                </span>
                                <span className="text-slate-400">
                                  {" "}
                                  cho nhóm{" "}
                                </span>
                                <span className="font-medium text-cyan-400">
                                  {selectedData.sector}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div> */}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="technical">
                  <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20">
                    <CardContent className="p-4">
                      <h4 className="text-lg font-medium text-slate-300 mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6 text-teal-400" />
                        Phân tích kỹ thuật
                      </h4>

                      {loadingDetails ? (
                        <div className="text-center py-8">
                          <div className="text-slate-400">Đang tải dữ liệu kỹ thuật...</div>
                        </div>
                      ) : stockAnalysis ? (
                        <div className="space-y-4">
                          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-400/30">
                              <div className="text-sm text-slate-400">RSI (14)</div>
                              <div className={`text-lg font-bold ${
                                stockAnalysis.technical.rsi > 70 ? "text-red-400" :
                                stockAnalysis.technical.rsi < 30 ? "text-emerald-400" : "text-yellow-400"
                              }`}>
                                {stockAnalysis.technical.rsi}
                              </div>
                              <div className="text-xs text-slate-400">
                                {stockAnalysis.technical.rsi > 70 ? "Quá mua" :
                                 stockAnalysis.technical.rsi < 30 ? "Quá bán" : "Trung tính"}
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-400/30">
                              <div className="text-sm text-slate-400">MACD</div>
                              <div className={`text-lg font-bold ${
                                stockAnalysis.technical.macd.includes("Bullish") ? "text-emerald-400" :
                                stockAnalysis.technical.macd.includes("Bearish") ? "text-red-400" : "text-yellow-400"
                              }`}>
                                {stockAnalysis.technical.macd}
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                              <div className="text-sm text-slate-400">Vùng hỗ trợ</div>
                              <div className="text-lg font-bold text-emerald-400">
                                {stockAnalysis.technical.support}
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg border border-red-400/30">
                              <div className="text-sm text-slate-400">Vùng kháng cự</div>
                              <div className="text-lg font-bold text-red-400">
                                {stockAnalysis.technical.resistance}
                              </div>
                            </div>
                          </div> */}

                          <div className="p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg border border-blue-400/20">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-slate-400">Khối lượng giao dịch</div>
                                <div className="text-lg font-bold text-white">{stockAnalysis.volume}</div>
                              </div>
                              <div>
                                <div className="text-sm text-slate-400">Giá trị giao dịch</div>
                                <div className="text-lg font-bold text-white">{stockAnalysis.volume}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          Không có dữ liệu kỹ thuật
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Technical Indicators */}
                        {/* <div className="space-y-3">
                          <h5 className="text-base font-medium text-slate-400">
                            Chỉ báo kỹ thuật
                          </h5>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-400/30">
                              <span className="text-base text-slate-300">
                                RSI (14):
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    selectedData.technical.rsi > 70
                                      ? "text-red-300 border-red-400/50 bg-red-500/20"
                                      : selectedData.technical.rsi < 30
                                        ? "text-emerald-300 border-emerald-400/50 bg-emerald-500/20"
                                        : "text-amber-300 border-amber-400/50 bg-amber-500/20"
                                  }
                                >
                                  {selectedData.technical.rsi}
                                </Badge>
                                <span className="text-sm text-slate-400">
                                  {selectedData.technical.rsi > 70
                                    ? "Quá mua"
                                    : selectedData.technical.rsi < 30
                                      ? "Quá bán"
                                      : "Trung tính"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-400/30">
                              <span className="text-base text-slate-300">
                                MACD:
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  selectedData.technical.macd.includes(
                                    "Bullish"
                                  )
                                    ? "text-emerald-300 border-emerald-400/50 bg-emerald-500/20"
                                    : selectedData.technical.macd.includes(
                                      "Bearish"
                                    )
                                      ? "text-red-300 border-red-400/50 bg-red-500/20"
                                      : "text-amber-300 border-amber-400/50 bg-amber-500/20"
                                }
                              >
                                {selectedData.technical.macd}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                              <span className="text-base text-slate-300">
                                MA20:
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  selectedData.technical.ma20 === "Above"
                                    ? "text-emerald-300 border-emerald-400/50 bg-emerald-500/20"
                                    : selectedData.technical.ma20 === "Below"
                                      ? "text-red-300 border-red-400/50 bg-red-500/20"
                                      : "text-amber-300 border-amber-400/50 bg-amber-500/20"
                                }
                              >
                                {selectedData.technical.ma20 === "Above"
                                  ? "Trên MA20"
                                  : selectedData.technical.ma20 === "Below"
                                    ? "Dưới MA20"
                                    : "Tại MA20"}
                              </Badge>
                            </div>
                          </div>
                        </div> */}

                        {/* Support/Resistance */}
                        {/* <div className="space-y-3">
                          <h5 className="text-base font-medium text-slate-400">
                            Hỗ trợ & Kháng cự
                          </h5>
                          <div className="space-y-2">
                            <div className="p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg border border-red-400/30">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-base text-red-300">
                                  Kháng cự:
                                </span>
                                <span className="font-medium text-red-400">
                                  {selectedData.technical.resistance}
                                </span>
                              </div>
                              <div className="text-sm text-red-300/80">
                                Khoảng cách:{" "}
                                {(
                                  ((parseFloat(
                                    selectedData.technical.resistance
                                  ) -
                                    parseFloat(selectedData.price)) /
                                    parseFloat(selectedData.price)) *
                                  100
                                ).toFixed(2)}
                                %
                              </div>
                            </div>

                            <div className="p-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg border border-blue-400/20">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-base text-slate-300">
                                  Giá hiện tại:
                                </span>
                                <span className="font-medium text-white">
                                  {selectedData.price}
                                </span>
                              </div>
                              <div className="text-sm text-slate-400">
                                Biến động: {selectedData.change} (
                                {selectedData.changePercent})
                              </div>
                            </div>

                            <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-400/30">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-base text-emerald-300">
                                  Hỗ trợ:
                                </span>
                                <span className="font-medium text-emerald-400">
                                  {selectedData.technical.support}
                                </span>
                              </div>
                              <div className="text-sm text-emerald-300/80">
                                Khoảng cách:{" "}
                                {(
                                  ((parseFloat(selectedData.price) -
                                    parseFloat(
                                      selectedData.technical.support
                                    )) /
                                    parseFloat(selectedData.price)) *
                                  100
                                ).toFixed(2)}
                                %
                              </div>
                            </div>
                          </div>
                        </div> */}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="news">
                  <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20">
                    <CardContent className="p-4">
                      <h4 className="text-lg font-medium text-slate-300 mb-4 flex items-center gap-2">
                        <Eye className="w-6 h-6 text-sky-400" />
                        Tin tức liên quan {selectedStock}
                      </h4>

                      {loadingDetails ? (
                        <div className="text-center py-8">
                          <div className="text-slate-400">Đang tải tin tức...</div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 border border-blue-400/20 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 cursor-pointer transition-all">
                            <h5 className="text-base font-medium mb-2 text-white">
                              {selectedStock} công bố kết quả kinh doanh quý 4 vượt kỳ vọng
                            </h5>
                            <div className="flex items-center justify-between text-sm text-slate-400">
                              <span>2 giờ trước</span>
                              <Badge
                                variant="outline"
                                className="text-emerald-300 border-emerald-400/50 bg-emerald-500/20"
                              >
                                Tích cực
                              </Badge>
                            </div>
                          </div>

                          <div className="p-3 border border-blue-400/20 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 cursor-pointer transition-all">
                            <h5 className="text-base font-medium mb-2 text-white">
                              Khuyến nghị mua mạnh {selectedStock} từ CTCK ABC
                            </h5>
                            <div className="flex items-center justify-between text-sm text-slate-400">
                              <span>4 giờ trước</span>
                              <Badge
                                variant="outline"
                                className="text-blue-300 border-blue-400/50 bg-blue-500/20"
                              >
                                Phân tích
                              </Badge>
                            </div>
                          </div>

                          <div className="p-3 border border-blue-400/20 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 cursor-pointer transition-all">
                            <h5 className="text-base font-medium mb-2 text-white">
                              {stockAnalysis?.sector === "Banking" ? "Ngân hàng" : stockAnalysis?.sector} - Triển vọng tích cực trong quý tới
                            </h5>
                            <div className="flex items-center justify-between text-sm text-slate-400">
                              <span>1 ngày trước</span>
                              <Badge
                                variant="outline"
                                className="text-purple-300 border-purple-400/50 bg-purple-500/20"
                              >
                                Ngành
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                {/* <TabsContent value="news">
                  <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20">
                    <CardContent className="p-4">
                      <h4 className="text-lg font-medium text-slate-300 mb-4 flex items-center gap-2">
                        <Eye className="w-6 h-6 text-sky-400" />
                        Tin tức liên quan {selectedData.code}
                      </h4>

                      <div className="space-y-3">
                        <div className="p-3 border border-blue-400/20 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 cursor-pointer transition-all">
                          <h5 className="text-base font-medium mb-2 text-white">
                            {selectedData.code} công bố kết quả kinh doanh quý 4
                            vượt kỳ vọng
                          </h5>
                          <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>2 giờ trước</span>
                            <Badge
                              variant="outline"
                              className="text-emerald-300 border-emerald-400/50 bg-emerald-500/20"
                            >
                              Tích cực
                            </Badge>
                          </div>
                        </div>

                        <div className="p-3 border border-blue-400/20 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 cursor-pointer transition-all">
                          <h5 className="text-base font-medium mb-2 text-white">
                            Khuyến nghị mua mạnh {selectedData.code} từ CTCK ABC
                          </h5>
                          <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>4 giờ trước</span>
                            <Badge
                              variant="outline"
                              className="text-blue-300 border-blue-400/50 bg-blue-500/20"
                            >
                              Phân tích
                            </Badge>
                          </div>
                        </div>

                        <div className="p-3 border border-blue-400/20 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 cursor-pointer transition-all">
                          <h5 className="text-base font-medium mb-2 text-white">
                            {selectedData.sector === "Banking"
                              ? "Ngân hàng"
                              : selectedData.sector}{" "}
                            - Triển vọng tích cực trong quý tới
                          </h5>
                          <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>1 ngày trước</span>
                            <Badge
                              variant="outline"
                              className="text-purple-300 border-purple-400/50 bg-purple-500/20"
                            >
                              Ngành
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent> */}
              </div>
              {/* Action and Summary Section */}
              <div className="space-y-4">
                {/* Stock Summary Card */}
                <Card className="bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 border border-blue-400/30 shadow-lg">
                  <CardContent className="p-4">
                    {/* <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-lg text-white">
                          {selectedData.code}
                        </h3>
                        <p className="text-base text-slate-400">
                          {selectedData.name}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getRecommendationColor(
                          selectedData.recommendation
                        )} font-medium`}
                      >
                        {getRecommendationIcon(selectedData.recommendation)}
                      </Badge>
                    </div> */}

                    {/* <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base text-slate-400">
                          Cập nhật:
                        </span>
                        <div className="text-right">
                          <div
                            className={`font-medium text-lg ${selectedData?.name === "up"
                                ? "text-emerald-400"
                                : "text-red-400"
                              }`}
                          >
                            {selectedData?.updated_at}
                          </div>
                          <div
                            className={`text-sm flex items-center gap-1 ${selectedData?.exchange === "up"
                                ? "text-emerald-400"
                                : "text-red-400"
                              }`}
                          >
                            {selectedData?.exchange === "up"
                              ? getTrendIcon("up")
                              : getTrendIcon("down")}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-blue-400/20">
                        <Link href={`/viewdetails/${selectedData?.id}`}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
                            <Eye className="w-6 h-6 mr-2" />
                            <span className="text-sm">Xem chi tiết</span>
                          </Button>
                        </Link>
                      </div>
                    </div> */}
                    <div className="space-y-3 p-4 rounded-xl border border-slate-700/40 bg-slate-800/40 shadow-sm">
                      {/* Header */}
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-100">
                            {selectedData?.name || "Mã CK"}
                          </h2>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            {selectedData?.exchange || "Sàn"}
                          </span>
                        </div>

                        {/* Updated time */}
                        <div className="text-right">
                          <div className="font-medium text-sm text-slate-400">
                            {selectedData?.updated_at
                              ? dayjs(selectedData.updated_at).format("DD/MM/YYYY HH:mm")
                              : "Chưa có dữ liệu"}
                          </div>
                        </div>
                      </div>

                      {/* Button */}
                      <div className="pt-3 border-t border-blue-400/20">
                        <Link href={`/viewdetails/${selectedData?.id}`}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
                            <Eye className="w-5 h-5 mr-2" />
                            <span className="text-sm">Xem chi tiết</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                {/* <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3 text-white text-lg">
                      Thống kê nhanh
                    </h4>
                    <div className="space-y-2 text-base">
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Cao nhất trong ngày:
                        </span>
                        <span className="text-emerald-400">
                          {selectedData.session.high}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Thấp nhất trong ngày:
                        </span>
                        <span className="text-red-400">
                          {selectedData.session.low}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Giá mở cửa:</span>
                        <span className="text-white">
                          {selectedData.session.open}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Khối lượng:</span>
                        <span className="text-cyan-400">
                          {selectedData.volume}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
