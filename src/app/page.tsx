"use client";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import { ChartColumnBig, Clock, Database, Eye, Link, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeepAnalysisPage } from "./components/DeepAnalysisPage";
import { NewsDetailPage } from "./components/NewDetailPage";
import { QuickAnalysis } from "./components/QuickAnalysis";
import { TogogoTradingBotCompact } from "./components/TogogoTradingBotCompact";
import { NewsColumns } from "./components/NewsColumns";
import { EconomicCalendar } from "./components/EconomicCalendar";
import { NewsSidebar } from "./components/NewsSidebar";
import { FacebookIcon, TwitterIcon, LinkedinIcon } from "lucide-react";
import { getCompanyDetails } from "@/services/api";

export default function Home() {
  const [currentView, setCurrentView] = useState<
    "home" | "details" | "news-detail" | "deep-analysis"
  >("home");
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<number>(1);
  const [time, setTime] = useState("");


  const handleViewDetails = (stockCode: string) => {
    setSelectedStock(stockCode);
    setCurrentView("details");
  };

  const handleViewNews = (articleId: number) => {
    setSelectedArticle(articleId);
    setCurrentView("news-detail");
  };

  const handleViewDeepAnalysis = () => {
    setCurrentView("deep-analysis");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedStock("");
    setSelectedArticle(1);
  };

  if (currentView === "news-detail") {
    return (
      <NewsDetailPage
        articleId={selectedArticle}
        onBack={handleBackToHome}
        onViewDetails={handleViewDetails}
      />
    );
  }


  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setTime(formatted);
    };

    updateClock(); // chạy lần đầu
    const interval = setInterval(updateClock, 1000); // update mỗi giây
    return () => clearInterval(interval);
  }, []);

  if (currentView === "deep-analysis") {
    return <DeepAnalysisPage onBack={handleBackToHome} />;
  }
  

  return (
    <div className="min-h-screen">
      {/* Add top padding to account for fixed header (smaller on mobile) */}
      <div className="pt-32 relative z-10">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          {/* Quick Analysis Section - Enhanced */}
          <Card className="mb-4 shadow-xl bg-gray-900/80 border border-gray-600/30 backdrop-blur-md relative overflow-hidden">
            {/* Card decorative pattern */}
            <div className="absolute inset-0 pattern-gentle-dots opacity-70 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-400/15 via-blue-400/8 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/10 to-transparent rounded-full blur-xl"></div>
            <CardContent className="p-4 mt-18 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-white">
                    PHÂN TÍCH NHANH
                  </h2>
                  <Badge
                    variant="outline"
                    className="ml-3 text-blue-300 border-blue-500/50 bg-blue-500/10 px-2 py-1 text-xs"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse mr-1"></div>
                    Live
                  </Badge>
                </div>
                <div className="text-xs text-gray-400 bg-gray-800/60 px-2 py-1 rounded">
                  {time}
                </div>
              </div>
              <QuickAnalysis />
            </CardContent>
          </Card>

          {/* Trading Bot Suggestions Section - Enhanced */}
          <Card className="mb-4 shadow-xl bg-gray-900/80 border border-gray-600/30 backdrop-blur-md relative overflow-hidden">
            {/* Card decorative pattern */}
            <div className="absolute inset-0 pattern-waves opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-emerald-400/18 via-emerald-400/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/12 to-transparent rounded-full blur-xl"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">
                  GỢI Ý TRADING BOT
                </h2>
                <Badge
                  variant="outline"
                  className="ml-3 text-emerald-300 border-emerald-500/50 bg-emerald-500/10 px-2 py-1 text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1 text-yellow-400" />
                  AI v2.1
                </Badge>
              </div>
              <TogogoTradingBotCompact />
            </CardContent>
          </Card>

          {/* Economic Calendar Section - New */}
          <div className="mb-4">
            <EconomicCalendar />
          </div>
          {/* Main Content Grid - 3:1 Layout */}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Content Area - 3 columns */}
            <div className="lg:col-span-3 space-y-4">
              {/* News Columns */}

              <NewsColumns onViewNews={handleViewNews} />

              {/* Latest News Section */}
              <Card className="border border-gray-600/30 bg-gray-900/80 backdrop-blur-md shadow-xl relative overflow-hidden">
                {/* Card decorative pattern */}
                <div className="absolute inset-0 pattern-organic opacity-75 pointer-events-none"></div>
                <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-blue-400/12 via-purple-400/8 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-tl from-emerald-400/10 to-transparent rounded-full blur-xl"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                    <h3 className="font-bold text-white">Tin tức thị trường mới nhất</h3>
                    <Badge className="bg-blue-500/20 border-blue-500/50 text-blue-300 px-2 py-1 text-xs">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse mr-1"></div>
                      Live
                    </Badge>
                  </div>

                  {/* Grid layout for news items - 2 columns, 3 rows */}
                  <div className="grid grid-cols-2 gap-4">
                    {(() => {
                      // Sample news data based on the JSON format provided
                      const newsData = [
                        {
                          id: 19,
                          title: "SAV: Giải trình chênh lệch lợi nhuận 6 tháng đầu năm 2025 so với cùng kỳ năm trước",
                          news_image_url: "https://cdn.fiingroup.vn/medialib/127889/I/2024/12/03/10505782769750700_SAV.png",
                          news_source_link: "https://www.hsx.vn/vi/tin-tuc/sav-giai-trinh-chenh-lech-loi-nhuan-6-thang-dau-nam-2025-so-voi-cung-ky-nam-truoc/2397315",
                          price_change_pct: 0,
                          public_date: 1755194101
                        },
                        {
                          id: 20,
                          title: "SAV: Báo cáo tình hình quản trị công ty 06 tháng đầu năm 2025",
                          news_image_url: "https://cdn.fiingroup.vn/medialib/127889/I/2024/12/03/10505782769750700_SAV.png",
                          news_source_link: "https://www.hsx.vn/vi/tin-tuc/sav-bao-cao-tinh-hinh-quan-tri-cong-ty-06-thang-dau-nam-2025/2390803",
                          price_change_pct: 0,
                          public_date: 1753291378
                        },
                        {
                          id: 21,
                          title: "SAV: Giải trình biến động KQKD quý 2/2025 so với cùng kỳ năm trước",
                          news_image_url: "https://cdn.fiingroup.vn/medialib/127889/I/2024/12/03/10505782769750700_SAV.png",
                          news_source_link: "https://www.hsx.vn/vi/tin-tuc/sav-giai-trinh-bien-dong-kqkd-quy-22025-so-voi-cung-ky-nam-truoc/2389448",
                          price_change_pct: 0,
                          public_date: 1752857880
                        },
                        {
                          id: 22,
                          title: "SAV: Thông báo về việc ký hợp đồng kiểm toán BCTC năm 2025",
                          news_image_url: "https://cdn.fiingroup.vn/medialib/127889/I/2024/12/03/10505782769750700_SAV.png",
                          news_source_link: "https://www.hsx.vn/vi/tin-tuc/sav-thong-bao-ve-viec-ky-hop-dong-kiem-toan-bctc-nam-2025/2384342",
                          price_change_pct: 0,
                          public_date: 1751046522
                        },
                        {
                          id: 23,
                          title: "SAV: Giấy chứng nhận đăng ký doanh nghiệp thay đổi lần thứ 24",
                          news_image_url: "https://cdn.fiingroup.vn/medialib/127889/I/2024/12/03/10505782769750700_SAV.png",
                          news_source_link: "https://www.hsx.vn/vi/tin-tuc/sav-giay-chung-nhan-dang-ky-doanh-nghiep-thay-doi-lan-thu-24/2383962",
                          price_change_pct: -0.01,
                          public_date: 1750958966
                        },
                        {
                          id: 24,
                          title: "VN-Index vượt mốc 1,280 điểm trong phiên chiều với thanh khoản cao",
                          news_image_url: "",
                          news_source_link: "",
                          price_change_pct: 2.15,
                          public_date: Date.now() / 1000 - 7200 // 2 hours ago
                        }
                      ];

                      // Color themes for different news items
                      const colorThemes = [
                        { bg: 'emerald-400', delay: '0s' },
                        { bg: 'blue-400', delay: '0.5s' },
                        { bg: 'purple-400', delay: '1s' },
                        { bg: 'red-400', delay: '1.5s' },
                        { bg: 'yellow-400', delay: '2s' },
                        { bg: 'orange-400', delay: '2.5s' }
                      ];

                      // Function to format relative time
                      const formatRelativeTime = (timestamp: number): string => {
                        const now = Date.now() / 1000;
                        const diff = now - timestamp;

                        if (diff < 3600) {
                          return `${Math.floor(diff / 60)}m`;
                        } else if (diff < 86400) {
                          return `${Math.floor(diff / 3600)}h`;
                        } else {
                          return `${Math.floor(diff / 86400)}d`;
                        }
                      };

                      // Function to generate short description based on title
                      const generateDescription = (title: string): string => {
                        if (title.includes('SAV')) {
                          return 'Công ty Cổ phần Vàng bạc Đá quý Sài Gòn (SAV) công bố thông tin tài chính và vận hành trong kỳ báo cáo.';
                        } else if (title.includes('VN-Index')) {
                          return 'Chỉ số VN-Index tiếp tục đà tăng mạnh với thanh khoản cao, được dẫn dắt bởi nhóm ngân hàng và bất động sản.';
                        }
                        return 'Thông tin quan trọng về thị trường chứng khoán và các doanh nghiệp niêm yết.';
                      };

                      // Function to generate view count
                      const generateViewCount = (id: number): string => {
                        const baseCount = 1000 + (id * 123) % 20000;
                        if (baseCount >= 1000) {
                          return `${(baseCount / 1000).toFixed(1)}K`;
                        }
                        return baseCount.toString();
                      };

                      return newsData.slice(0, 6).map((news, index) => {
                        const theme = colorThemes[index];
                        return (
                          <div
                            key={news.id}
                            className="p-4 bg-gray-800/60 rounded-lg border border-gray-600/40 hover:border-gray-500/60 cursor-pointer transition-all duration-300 hover:shadow-lg hover:bg-gray-800/80 relative overflow-hidden group"
                            onClick={() => news.news_source_link && window.open(news.news_source_link, '_blank')}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br from-${theme.bg}/8 via-transparent to-${theme.bg}/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            <div className={`absolute ${index % 4 === 0 ? 'top-0 right-0' : index % 4 === 1 ? 'bottom-0 left-0' : index % 4 === 2 ? 'top-0 left-0' : 'bottom-0 right-0'} w-16 h-16 bg-gradient-to-${index % 4 === 0 ? 'bl' : index % 4 === 1 ? 'tr' : index % 4 === 2 ? 'br' : 'tl'} from-${theme.bg}/6 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            <div className="flex items-start gap-3 relative z-10">
                              <div className={`w-2 h-2 bg-${theme.bg} rounded-full mt-2 flex-shrink-0 animate-pulse`} style={{ animationDelay: theme.delay }}></div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2 text-white leading-tight text-base hover:text-gray-100 transition-colors line-clamp-2">
                                  {news.title}
                                </h4>
                                <p className="text-gray-300 text-sm mb-3 leading-relaxed line-clamp-2">
                                  {generateDescription(news.title)}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{formatRelativeTime(news.public_date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{generateViewCount(news.id)}</span>
                                  </div>
                                  {news.price_change_pct !== 0 && (
                                    <div className="flex items-center gap-1">
                                      {news.price_change_pct > 0 ? (
                                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                                      )}
                                      <span className={news.price_change_pct > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                        {news.price_change_pct > 0 ? '+' : ''}{(news.price_change_pct * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Market Insights Section */}
              <Card className="border border-gray-600/30 bg-gray-900/80 backdrop-blur-md shadow-xl relative overflow-hidden">
                {/* Card decorative pattern */}
                <div className="absolute inset-0 pattern-clouds opacity-90 pointer-events-none"></div>
                <div className="absolute top-4 right-4 w-36 h-36 bg-gradient-to-br from-blue-400/15 to-purple-400/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 left-4 w-28 h-28 bg-gradient-to-tr from-emerald-400/12 to-transparent rounded-full blur-xl"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-10 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                    <h3 className="font-bold text-2xl text-white">
                      Market Insights
                    </h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-3 text-base">
                    Thị trường chứng khoán Việt Nam đang cho thấy những dấu hiệu
                    tích cực với sự phục hồi mạnh mẽ của các nhóm cổ phiếu lớn.
                    Thanh khoản gia tăng và dòng tiền từ khối ngoại tiếp tục đổ
                    vào thị trường tạo động lực tích cực cho xu hướng tăng trong
                    các phiên giao dịch tới.
                  </p>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <p className="text-blue-200 text-sm">
                      <ChartColumnBig className="inline-block w-5 h-5 mb-1 mr-2 text-white" />
                      <strong className="text-white text-base mr-2 mb-1">
                        Điểm nhấn:
                      </strong>
                      VN-Index có thể thử thách vùng kháng cự 1,300 điểm trong
                      tuần tới nếu duy trì được momentum hiện tại.
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Sidebar - NewsSidebar - 1 column */}
            <div className="lg:col-span-1">
              <NewsSidebar onViewDetails={handleViewDetails} />
            </div>
          </div>
        </div>
      </div>
      <Card>
        <footer className="bg-slate-900 text-gray-200  ">
          <div className="max-w-7xl mx-auto px-4 py-5 my-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                TOGOGO ANALYTICS
              </h2>
              <p className="text-sm leading-relaxed">
                Togogo Analytics giúp bạn nắm bắt cổ phiếu tiềm năng, phân tích nhanh – ra quyết định kịp thời.
              </p>
              <div className="flex space-x-4 mt-3 text-lg">
                <a href="#"><FacebookIcon className="w-5 h-5 text-cyan-400" /></a>
                <a href="#"><TwitterIcon className="w-5 h-5 text-cyan-400" /></a>
                <a href="#"><LinkedinIcon className="w-5 h-5 text-cyan-400" /></a>
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-2 mb-4 text-white">
                <Link className="w-5 h-5 text-cyan-400" />
                <span>Liên kết nhanh</span>
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:text-cyan-400">Trang chủ</a></li>
                <li><a href="/" className="hover:text-cyan-400">Tin tức</a></li>
                <li><a href="/" className="hover:text-cyan-400">Tìm kiếm mã</a></li>

              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 mb-4 text-white">
                <Database className="w-5 h-5 text-cyan-400" />
                <span>Dữ liệu thị trường</span>
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-cyan-400">DesignBot</a></li>
                <li><a href="#" className="hover:text-cyan-400">TogoAuto</a></li>
                <li><a href="#" className="hover:text-cyan-400">System Rental</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Liên hệ</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 (+84) 853.336.668</li>
                <li>📧 hungle@hagency.vn</li>
                <li>📍 CT1AB khu đô thị VOV, Nam Từ Liêm, Hà Nội</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 text-xs text-gray-400 px-4 py-4 max-w-7xl mx-auto leading-relaxed">
            <p>
              Togogo Analytics không đưa ra bất kỳ cam kết, đảm bảo nào – dù rõ ràng hay ngụ ý – về tính chính xác, đầy đủ hoặc tính phù hợp của thông tin cho một mục đích cụ thể. Mọi dữ liệu, hình ảnh, biểu tượng hiển thị trên trang chỉ mang tính tham khảo.
              Việc sử dụng thông tin và công cụ từ Togogo Analytics hoàn toàn do người dùng tự quyết định và tự chịu trách nhiệm. Chúng tôi không chịu trách nhiệm với bất kỳ rủi ro, tổn thất hoặc thiệt hại nào phát sinh từ việc sử dụng trang web hoặc phần mềm của Togogo Analytics.
            </p>
          </div>
          <div className="mt-8">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2837.328032322972!2d105.78409189999999!3d20.9965474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad6c9a5d7957%3A0xba4cc9cfa7eaf58d!2sCT1A%20-%20CHUNG%20C%C6%AF%20VOV!5e1!3m2!1svi!2s!4v1759303537419!5m2!1svi!2s"
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              className="rounded-lg shadow-lg"
            ></iframe>
          </div>
        </footer>
      </Card>
    </div>
  );
}
