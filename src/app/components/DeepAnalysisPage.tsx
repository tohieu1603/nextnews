"use client";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Lock,
  Crown,
  Zap,
  Calendar,
  Star,
  CheckCircle,
  Globe,
  LineChart,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/bagde";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layouts/Header";

interface DeepAnalysisPageProps {
  onBack: () => void;
}

// Mock comprehensive stock data
const getStockData = (code: string) => ({
  code,
  name:
    code === "YTC"
      ? "Ngân hàng TMCP Ngoại thương Việt Nam"
      : code === "TCB"
      ? "Ngân hàng TMCP Kỹ thương Việt Nam"
      : code === "HPG"
      ? "Tập đoàn Hoa Phát"
      : code === "MSN"
      ? "Tập đoàn Masan"
      : "Công ty Cổ phần " + code,
  sector:
    code.includes("YTC") || code.includes("TCB")
      ? "Ngân hàng"
      : code === "HPG"
      ? "Thép"
      : code === "MSN"
      ? "Tiêu dùng"
      : "Công nghiệp",
  currentPrice:
    code === "YTC"
      ? "95,800"
      : code === "TCB"
      ? "23,400"
      : code === "HPG"
      ? "24,600"
      : "67,300",
  change:
    code === "YTC"
      ? "+2,100"
      : code === "TCB"
      ? "+700"
      : code === "HPG"
      ? "+1,200"
      : "+500",
  changePercent:
    code === "YTC"
      ? "+2.24%"
      : code === "TCB"
      ? "+3.08%"
      : code === "HPG"
      ? "+5.13%"
      : "+0.75%",

  // Company Information
  companyInfo: {
    fullName:
      code === "YTC"
        ? "Ngân hàng Thương mại Cổ phần Ngoại thương Việt Nam"
        : code === "TCB"
        ? "Ngân hàng Thương mại Cổ phần Kỹ thương Việt Nam"
        : code === "HPG"
        ? "Tập đoàn Công nghiệp Hoa Phát"
        : "Tập đoàn " + code,
    industry:
      code.includes("YTC") || code.includes("TCB")
        ? "Dịch vụ tài chính - Ngân hàng"
        : code === "HPG"
        ? "Sản xuất - Kim loại cơ bản"
        : "Sản xuất - Tiêu dùng",
    establishedYear:
      code === "YTC"
        ? "1963"
        : code === "TCB"
        ? "1993"
        : code === "HPG"
        ? "1992"
        : "1996",
    headquarters:
      code === "YTC"
        ? "Hà Nội"
        : code === "TCB"
        ? "TP.HCM"
        : code === "HPG"
        ? "Hà Nội"
        : "TP.HCM",
    employees:
      code === "YTC"
        ? "25,000+"
        : code === "TCB"
        ? "18,000+"
        : code === "HPG"
        ? "35,000+"
        : "12,000+",
    website:
      code === "YTC"
        ? "vietcombank.com.vn"
        : code === "TCB"
        ? "techcombank.com.vn"
        : code === "HPG"
        ? "hoaphat.com.vn"
        : code.toLowerCase() + ".com.vn",

    // Shareholders structure
    majorShareholders: [
      {
        name: "Nhà nước",
        percent:
          code === "YTC"
            ? "74.8%"
            : code === "TCB"
            ? "0%"
            : code === "HPG"
            ? "0%"
            : "15.2%",
      },
      {
        name: "Khối ngoại",
        percent:
          code === "YTC"
            ? "18.7%"
            : code === "TCB"
            ? "35.8%"
            : code === "HPG"
            ? "22.4%"
            : "28.9%",
      },
      {
        name: "Cổ đông khác",
        percent:
          code === "YTC"
            ? "6.5%"
            : code === "TCB"
            ? "64.2%"
            : code === "HPG"
            ? "77.6%"
            : "55.9%",
      },
    ],

    // Business overview
    mainBusiness:
      code === "YTC"
        ? "Cung cấp dịch vụ ngân hàng bán lẻ và doanh nghiệp"
        : code === "TCB"
        ? "Dịch vụ ngân hàng số và tài chính hiện đại"
        : code === "HPG"
        ? "Sản xuất thép và vật liệu xây dựng"
        : "Sản xuất và phân phối hàng tiêu dùng",
    competitiveAdvantage:
      code === "YTC"
        ? "Thương hiệu mạnh, mạng lưới rộng khắp"
        : code === "TCB"
        ? "Công nghệ tiên tiến, dịch vụ số hóa"
        : code === "HPG"
        ? "Công suất lớn, tích hợp dọc"
        : "Thương hiệu nổi tiếng, kênh phân phối rộng",
  },

  // Bot trading data (premium)
  botTrading: {
    winRate:
      code === "YTC"
        ? "73%"
        : code === "TCB"
        ? "78%"
        : code === "HPG"
        ? "81%"
        : "69%",
    avgReturn:
      code === "YTC"
        ? "+2.8%"
        : code === "TCB"
        ? "+3.4%"
        : code === "HPG"
        ? "+4.1%"
        : "+2.3%",
    sharpeRatio:
      code === "YTC"
        ? "1.42"
        : code === "TCB"
        ? "1.67"
        : code === "HPG"
        ? "1.89"
        : "1.23",
    maxDrawdown:
      code === "YTC"
        ? "-8.5%"
        : code === "TCB"
        ? "-12.3%"
        : code === "HPG"
        ? "-15.1%"
        : "-9.8%",
    signals: [
      {
        date: "25/08/2025",
        action: "MUA",
        price: code === "YTC" ? "92,500" : "22,100",
        result: "+3.2%",
      },
      {
        date: "23/08/2025",
        action: "BÁN",
        price: code === "YTC" ? "95,100" : "23,800",
        result: "+2.8%",
      },
      {
        date: "20/08/2025",
        action: "MUA",
        price: code === "YTC" ? "89,200" : "21,500",
        result: "+6.4%",
      },
    ],
  },

  // Detailed analysis (premium)
  detailedAnalysis: {
    fundamentalScore:
      code === "YTC" ? 85 : code === "TCB" ? 88 : code === "HPG" ? 82 : 78,
    technicalScore:
      code === "YTC" ? 78 : code === "TCB" ? 85 : code === "HPG" ? 89 : 72,
    overallRating:
      code === "YTC"
        ? "MUA"
        : code === "TCB"
        ? "MUA MẠNH"
        : code === "HPG"
        ? "MUA MẠNH"
        : "GIỮ",

    // Quarter analysis
    quarterAnalysis: {
      q4_2024: {
        revenue:
          code === "YTC"
            ? "78.5T"
            : code === "TCB"
            ? "56.8T"
            : code === "HPG"
            ? "156.7T"
            : "89.4T",
        profit:
          code === "YTC"
            ? "24.8T"
            : code === "TCB"
            ? "19.2T"
            : code === "HPG"
            ? "8.5T"
            : "3.2T",
        growth:
          code === "YTC"
            ? "+18.5%"
            : code === "TCB"
            ? "+22.1%"
            : code === "HPG"
            ? "+28.9%"
            : "+12.4%",
      },
      forecast_q1_2025: {
        expectedGrowth:
          code === "YTC"
            ? "+15-20%"
            : code === "TCB"
            ? "+20-25%"
            : code === "HPG"
            ? "+25-30%"
            : "+10-15%",
        riskFactors: ["Lãi suất", "Tăng trưởng GDP", "Chính sách tiền tệ"],
      },
    },

    // VN-Index & VN30 analysis
    marketAnalysis: {
      vnIndexCorrelation:
        code === "YTC"
          ? "0.87"
          : code === "TCB"
          ? "0.82"
          : code === "HPG"
          ? "0.91"
          : "0.75",
      vn30Impact:
        code === "YTC"
          ? "Cao"
          : code === "TCB"
          ? "Cao"
          : code === "HPG"
          ? "Trung bình"
          : "Thấp",
      marketOutperformance:
        code === "YTC"
          ? "+5.2%"
          : code === "TCB"
          ? "+8.9%"
          : code === "HPG"
          ? "+12.1%"
          : "+2.8%",
    },
  },
});

const searchSuggestions = [
  "YTC",
  "TCB",
  "HPG",
  "MSN",
  "VHM",
  "VIC",
  "GAS",
  "SAB",
  "VNM",
  "ACB",
];

export function DeepAnalysisPage({ onBack }: DeepAnalysisPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState("YTC");
  const [hasBasicSubscription, setHasBasicSubscription] = useState(false);
  const [hasPremiumSubscription, setHasPremiumSubscription] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const stockData = getStockData(selectedStock);
  const isPositive = stockData.change.startsWith("+");

  const filteredSuggestions = searchSuggestions.filter(
    (stock) =>
      stock.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getStockData(stock).name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStockSelect = (code: string) => {
    setSelectedStock(code);
    setSearchQuery("");
    setShowSearchSuggestions(false);
  };

  const handleSubscribe = (type: "basic" | "premium") => {
    if (type === "basic") {
      setHasBasicSubscription(true);
    } else {
      setHasPremiumSubscription(true);
      setHasBasicSubscription(true); // Premium includes basic
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <Button onClick={onBack} className="mb-6" variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Về trang chủ
        </Button>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            PHÂN TÍCH CHUYÊN SÂU
          </h1>
          <p className="text-gray-600">
            Nghiên cứu toàn diện và dự báo chính xác từ AI
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-lg border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="relative max-w-md mx-auto">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tìm kiếm:
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  placeholder="Nhập mã chứng khoán hoặc tên công ty..."
                  className="pl-10 pr-4 py-3 border-2 border-blue-200 focus:border-blue-400 rounded-lg"
                />
              </div>

              {/* Search Suggestions */}
              {showSearchSuggestions &&
                searchQuery &&
                filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                    {filteredSuggestions.map((stock) => {
                      const data = getStockData(stock);
                      return (
                        <button
                          key={stock}
                          onClick={() => handleStockSelect(stock)}
                          className="w-full p-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-blue-600">
                            {stock}
                          </div>
                          <div className="text-sm text-gray-500">
                            {data.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Stock Display Section - Very Prominent */}
        <Card className="mb-8 shadow-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-6">
                <span className="text-white font-bold text-3xl">
                  {stockData.code}
                </span>
              </div>

              {/* Stock Code - Very Large */}
              <div className="mb-4">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stockData.code}
                </div>
                <div className="text-2xl font-medium text-gray-700 mb-4">
                  {stockData.name}
                </div>
              </div>

              {/* Price Information */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-4xl font-bold text-gray-900">
                  {stockData.currentPrice}
                </div>
                <div
                  className={`flex items-center gap-2 text-2xl font-bold ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-8 h-8" />
                  ) : (
                    <TrendingDown className="w-8 h-8" />
                  )}
                  <span>
                    {stockData.change} ({stockData.changePercent})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-blue-600 text-white px-4 py-2 text-lg">
                  <Building2 className="w-4 h-4 mr-1" />
                  {stockData.sector}
                </Badge>
                <Badge className="bg-green-600 text-white px-4 py-2 text-lg">
                  <Globe className="w-4 h-4 mr-1" />
                  HOSE
                </Badge>
                <Badge className="bg-purple-600 text-white px-4 py-2 text-lg">
                  <Star className="w-4 h-4 mr-1" />
                  Blue Chip
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="w-6 h-6 text-blue-600" />
              Thông tin công ty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-blue-600">
                  Thông tin cơ bản
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Tên đầy đủ:</span>
                    <span className="font-medium text-right max-w-xs">
                      {stockData.companyInfo.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngành:</span>
                    <span className="font-medium">
                      {stockData.companyInfo.industry}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thành lập:</span>
                    <span className="font-medium">
                      {stockData.companyInfo.establishedYear}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trụ sở:</span>
                    <span className="font-medium">
                      {stockData.companyInfo.headquarters}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nhân viên:</span>
                    <span className="font-medium">
                      {stockData.companyInfo.employees}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Website:</span>
                    <span className="font-medium text-blue-600">
                      {stockData.companyInfo.website}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shareholders */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-green-600 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Cơ cấu cổ đông
                </h4>
                <div className="space-y-3">
                  {stockData.companyInfo.majorShareholders.map(
                    (shareholder, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium">{shareholder.name}:</span>
                        <span className="font-bold text-blue-600">
                          {shareholder.percent}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Business Overview */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-purple-600">
                  Hoạt động kinh doanh
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">
                      Lĩnh vực chính:
                    </span>
                    <p className="font-medium mt-1">
                      {stockData.companyInfo.mainBusiness}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">
                      Lợi thế cạnh tranh:
                    </span>
                    <p className="font-medium mt-1">
                      {stockData.companyInfo.competitiveAdvantage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot Trading Suggestions - Paywall */}
        <Card className="mb-8 shadow-lg relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="w-6 h-6 text-yellow-600" />
                Gợi ý bot giao dịch
                <Badge className="bg-yellow-600 text-white">từ togogo.vn</Badge>
              </CardTitle>
              {!hasBasicSubscription && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSubscribe("basic")}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    size="sm"
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    20K/lần
                  </Button>
                  <Button
                    onClick={() => handleSubscribe("basic")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    100K/tuần
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            {/* Blur overlay for non-subscribers */}
            {!hasBasicSubscription && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center p-8">
                  <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    Nội dung Premium
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Đăng ký để xem gợi ý bot giao dịch từ togogo.vn
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => handleSubscribe("basic")}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      20,000 VNĐ/lần
                    </Button>
                    <Button
                      onClick={() => handleSubscribe("basic")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      100,000 VNĐ/tuần
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Bot Trading Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {stockData.botTrading.winRate}
                </div>
                <div className="text-sm text-gray-600">Tỷ lệ thắng</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {stockData.botTrading.avgReturn}
                </div>
                <div className="text-sm text-gray-600">Lại suất TB</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {stockData.botTrading.sharpeRatio}
                </div>
                <div className="text-sm text-gray-600">Sharpe Ratio</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {stockData.botTrading.maxDrawdown}
                </div>
                <div className="text-sm text-gray-600">Max Drawdown</div>
              </div>
            </div>

            {/* Recent Signals */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Tín hiệu gần đây:</h4>
              {stockData.botTrading.signals.map((signal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">{signal.date}</div>
                    <Badge
                      className={
                        signal.action === "MUA" ? "bg-green-600" : "bg-red-600"
                      }
                    >
                      {signal.action}
                    </Badge>
                    <div className="font-medium">{signal.price}</div>
                  </div>
                  <div
                    className={`font-bold ${
                      signal.result.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {signal.result}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis - Premium Paywall */}
        <Card className="mb-8 shadow-lg relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                PHÂN TÍCH VÀ ĐÁNH GIÁ CHI TIẾT TỪ TOGOGO.VN
                <Badge className="bg-indigo-600 text-white">Premium</Badge>
              </CardTitle>
              {!hasPremiumSubscription && (
                <Button
                  onClick={() => handleSubscribe("premium")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Nâng cấp Premium
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            {/* Blur overlay for non-premium subscribers */}
            {!hasPremiumSubscription && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center p-8">
                  <Crown className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    Phân tích Premium
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Truy cập phân tích chuyên sâu từ các chuyên gia tại
                    togogo.vn
                  </p>
                  <Button
                    onClick={() => handleSubscribe("premium")}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    size="lg"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Đăng ký Premium
                  </Button>
                </div>
              </div>
            )}

            {/* Premium Analysis Content */}
            <div className="space-y-8">
              {/* Overall Rating */}
              <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                <h3 className="text-xl font-bold mb-4">Đánh giá tổng thể</h3>
                <div className="flex items-center justify-center gap-8 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {stockData.detailedAnalysis.fundamentalScore}
                    </div>
                    <div className="text-sm text-gray-600">Điểm cơ bản</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {stockData.detailedAnalysis.technicalScore}
                    </div>
                    <div className="text-sm text-gray-600">Điểm kỹ thuật</div>
                  </div>
                </div>
                <Badge
                  className={`text-xl px-6 py-3 ${
                    stockData.detailedAnalysis.overallRating === "MUA MẠNH"
                      ? "bg-green-600"
                      : stockData.detailedAnalysis.overallRating === "MUA"
                      ? "bg-blue-600"
                      : "bg-yellow-600"
                  } text-white`}
                >
                  {stockData.detailedAnalysis.overallRating}
                </Badge>
              </div>

              {/* Quarter Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Calendar className="w-5 h-5" />
                      Kết quả Q4/2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Doanh thu:</span>
                        <span className="font-bold">
                          {
                            stockData.detailedAnalysis.quarterAnalysis.q4_2024
                              .revenue
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lợi nhuận:</span>
                        <span className="font-bold">
                          {
                            stockData.detailedAnalysis.quarterAnalysis.q4_2024
                              .profit
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tăng trưởng:</span>
                        <span className="font-bold text-green-600">
                          {
                            stockData.detailedAnalysis.quarterAnalysis.q4_2024
                              .growth
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <Target className="w-5 h-5" />
                      Dự báo Q1/2025
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Tăng trưởng dự kiến:</span>
                        <span className="font-bold text-blue-600">
                          {
                            stockData.detailedAnalysis.quarterAnalysis
                              .forecast_q1_2025.expectedGrowth
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Yếu tố rủi ro:
                        </span>
                        <div className="mt-2 space-y-1">
                          {stockData.detailedAnalysis.quarterAnalysis.forecast_q1_2025.riskFactors.map(
                            (risk, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="mr-2 text-orange-600 border-orange-200"
                              >
                                {risk}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* VN-Index & VN30 Analysis */}
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <LineChart className="w-5 h-5" />
                    Phân tích VN-Index & VN30
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {
                          stockData.detailedAnalysis.marketAnalysis
                            .vnIndexCorrelation
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        Tương quan VN-Index
                      </div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <div className="text-lg font-bold text-indigo-600 mb-1">
                        {stockData.detailedAnalysis.marketAnalysis.vn30Impact}
                      </div>
                      <div className="text-sm text-gray-600">Tác động VN30</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {
                          stockData.detailedAnalysis.marketAnalysis
                            .marketOutperformance
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        Vượt trội thị trường
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3">
                      Nhận định từ chuyên gia togogo.vn:
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {stockData.code} đang thể hiện sự tương quan tích cực với
                      VN-Index và có khả năng vượt trội thị trường chung. Dựa
                      trên phân tích kỹ thuật và cơ bản, cổ phiếu này được đánh
                      giá là lựa chọn tốt trong danh mục đầu tư trung và dài
                      hạn. Tuy nhiên, nhà đầu tư cần lưu ý các yếu tố rủi ro vĩ
                      mô có thể tác động đến hiệu suất.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        {(hasBasicSubscription || hasPremiumSubscription) && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-bold text-green-600">
                      {hasPremiumSubscription
                        ? "Gói Premium đang hoạt động"
                        : "Gói Basic đang hoạt động"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Bạn đã có quyền truy cập vào{" "}
                      {hasPremiumSubscription
                        ? "tất cả nội dung premium"
                        : "gợi ý bot giao dịch"}
                    </div>
                  </div>
                </div>
                <Badge
                  className={
                    hasPremiumSubscription ? "bg-indigo-600" : "bg-green-600"
                  }
                >
                  <Crown className="w-4 h-4 mr-1" />
                  {hasPremiumSubscription ? "Premium" : "Basic"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
