import { useState, useEffect } from "react";
import { ArrowLeft, Search, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getNameData } from "@/services/api";
import { searchStockSuggestions, StockSuggestion } from "@/constants/stockSuggestions";
import { getSymbolData } from "@/services/api";
import { getCompanyDetails } from "@/services/api";

interface SearchResultsPageProps {
  searchQuery: string;
  onBack: () => void;
  onDetailedAnalysis: (stockId: string) => void;
}

type SortOption = "name" | "code" | "price" | "change";
type SortDirection = "asc" | "desc";

export function SearchResultsPage({ searchQuery, onBack, onDetailedAnalysis }: SearchResultsPageProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [animatedCards, setAnimatedCards] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [companyDetailsCache, setCompanyDetailsCache] = useState<Record<string, any>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch search results when currentSearchQuery changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!currentSearchQuery.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getNameData(currentSearchQuery.trim().toUpperCase());

        // Ensure we have an array of results
        const results = Array.isArray(data) ? data : [data];
        setSearchResults(results);

        // Fetch additional company details for each result
        const detailsPromises = results.map(async (result: any) => {
          if (result.id && !companyDetailsCache[result.id]) {
            try {
              const details = await getCompanyDetails(result.id);
              return { id: result.id, details };
            } catch (err) {
              return { id: result.id, details: null };
            }
          }
          return null;
        });

        const detailsResults = await Promise.all(detailsPromises);
        const newCache = { ...companyDetailsCache };
        detailsResults.forEach(item => {
          if (item && item.details) {
            newCache[item.id] = item.details;
          }
        });
        setCompanyDetailsCache(newCache);
      } catch (err) {
        console.error("Search error:", err);
        setError("Không tìm thấy kết quả cho từ khóa này");
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [currentSearchQuery]);

  // Initialize with initial search query
  useEffect(() => {
    if (searchQuery && searchQuery !== currentSearchQuery) {
      setCurrentSearchQuery(searchQuery);
      setLocalSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when new search
    }
  }, [searchQuery, currentSearchQuery]);

  // Reset to first page when search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchResults]);

  // Calculate pagination
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = searchResults.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    document.querySelector('.results-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Sort filtered stocks


  // Animate cards on load

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (option: SortOption) => {
    if (sortBy !== option) return null;
    return sortDirection === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  // Handle new search from search bar
  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      setCurrentSearchQuery(localSearchQuery.trim());
      // Update URL to reflect new search
      const newUrl = `/search?q=${encodeURIComponent(localSearchQuery.trim())}`;
      window.history.pushState({}, '', newUrl);
    }
  };

  // Handle search input change with suggestions
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);

    if (value.trim().length > 0) {
      const newSuggestions = searchStockSuggestions(value, 6);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (stockCode: string) => {
    setLocalSearchQuery(stockCode);
    setShowSuggestions(false);
    setSuggestions([]);
    setCurrentSearchQuery(stockCode);
    // Update URL
    const newUrl = `/search?q=${encodeURIComponent(stockCode)}`;
    window.history.pushState({}, '', newUrl);
  };

  // Handle focus and blur for suggestions
  const handleSearchFocus = () => {
    if (localSearchQuery.trim().length > 0) {
      const newSuggestions = searchStockSuggestions(localSearchQuery, 6);
      setSuggestions(newSuggestions);
      if (newSuggestions.length > 0) {
        setShowSuggestions(true);
      }
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0E1B36' }}>
      {/* Enhanced Background with organic patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#1E3A8A', stopOpacity: 0.1 }} />
                <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.05 }} />
                <stop offset="100%" style={{ stopColor: '#1E40AF', stopOpacity: 0.02 }} />
              </linearGradient>
              <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#059669', stopOpacity: 0.08 }} />
                <stop offset="100%" style={{ stopColor: '#065F46', stopOpacity: 0.03 }} />
              </linearGradient>
            </defs>

            <path d="M0,200 Q300,100 600,180 T1200,150 L1200,0 L0,0 Z" fill="url(#grad1)" />
            <path d="M0,400 Q400,300 800,380 T1200,320 L1200,200 Q900,250 600,220 T0,280 Z" fill="url(#grad2)" />
            <path d="M0,600 Q200,500 400,550 Q600,600 800,520 Q1000,440 1200,480 L1200,800 L0,800 Z" fill="url(#grad1)" opacity="0.3" />

            <circle cx="150" cy="150" r="60" fill="url(#grad2)" opacity="0.15" />
            <circle cx="1050" cy="300" r="80" fill="url(#grad1)" opacity="0.1" />
            <circle cx="300" cy="600" r="45" fill="url(#grad2)" opacity="0.12" />
            <circle cx="900" cy="650" r="70" fill="url(#grad1)" opacity="0.08" />
          </svg>
        </div>
      </div>

      {/* Header Spacer - Ensure content doesn't overlap with fixed header */}
      <div className="h-44 sm:h-48 lg:h-52"></div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Header - Enhanced with responsive back button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 px-3 py-2 
             bg-gradient-to-r from-blue-500 to-blue-700 
             border border-blue-600 text-white font-medium
             shadow-md shadow-blue-900/40 
             hover:from-blue-600 hover:to-blue-800 
             hover:shadow-lg hover:shadow-blue-900/60
             active:translate-y-[1px] active:shadow-sm
             rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Trở về trang chủ</span>
              </Button>
              <div className="hidden sm:block h-6 w-px bg-slate-600/50" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                <span className="hidden sm:inline">Kết quả tìm kiếm</span>
                <span className="sm:hidden">Tìm kiếm</span>
              </h1>
            </div>

            {/* Quick stats - mobile friendly */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Search className="w-4 h-4" />
                <span>Từ khóa: <span className="text-blue-300 font-medium">"{searchQuery}"</span></span>
              </div>
            </div>
          </div>

          {/* Search Bar - Enhanced with search functionality */}
          <div className="mb-6">
            <form onSubmit={handleNewSearch} className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                value={localSearchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder="Tìm kiếm mã khác (VD: HPG, TCB, VHM)..."
                className="pl-12 pr-20 py-3 text-base bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-0 transition-all text-white placeholder-slate-400"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !localSearchQuery.trim()}
                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Tìm"
                  )}
                </Button>
              </div>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="relative max-w-2xl mt-2">
                <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 rounded-lg shadow-xl border border-blue-400/30 py-2 backdrop-blur-sm relative z-30">
                  <div className="px-4 py-2 text-xs text-slate-400 border-b border-blue-400/20">
                    Gợi ý mã cổ phiếu ({suggestions.length} kết quả)
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.code}
                        onClick={() => handleSuggestionClick(suggestion.code)}
                        className="px-4 py-3 hover:bg-blue-500/20 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">{suggestion.code.length > 3 ? suggestion.code.slice(0, 3) : suggestion.code}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">
                              {suggestion.code} - {suggestion.name}
                            </div>
                            <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                              {suggestion.sector}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors flex-shrink-0 ml-2">
                          Cổ phiếu
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Search className="w-4 h-4 mr-2" />
                {searchResults.length} kết quả
              </Badge>
              {searchResults.length > 0 && (
                <div className="text-slate-400 text-sm">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, searchResults.length)} của {searchResults.length}
                </div>
              )}
              {currentSearchQuery && (
                <div className="text-slate-400">
                  Tìm kiếm cho: <span className="text-white font-medium">"{currentSearchQuery}"</span>
                </div>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm mr-2">Sắp xếp:</span>
              <Button
                onClick={() => handleSort("name")}
                variant="ghost"
                size="sm"
                className={`text-xs ${sortBy === "name" ? "text-blue-400 bg-blue-500/20" : "text-slate-400 hover:text-white"}`}
              >
                Tên {getSortIcon("name")}
              </Button>
              <Button
                onClick={() => handleSort("code")}
                variant="ghost"
                size="sm"
                className={`text-xs ${sortBy === "code" ? "text-blue-400 bg-blue-500/20" : "text-slate-400 hover:text-white"}`}
              >
                Mã {getSortIcon("code")}
              </Button>
              <Button
                onClick={() => handleSort("price")}
                variant="ghost"
                size="sm"
                className={`text-xs ${sortBy === "price" ? "text-blue-400 bg-blue-500/20" : "text-slate-400 hover:text-white"}`}
              >
                Giá {getSortIcon("price")}
              </Button>
              <Button
                onClick={() => handleSort("change")}
                variant="ghost"
                size="sm"
                className={`text-xs ${sortBy === "change" ? "text-blue-400 bg-blue-500/20" : "text-slate-400 hover:text-white"}`}
              >
                Thay đổi {getSortIcon("change")}
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 rounded-2xl p-8 max-w-md mx-auto">
                <div className="animate-spin w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-medium text-white mb-2">Đang tìm kiếm...</h3>
                <p className="text-slate-400">
                  Đang tìm kiếm thông tin cho "{searchQuery}"
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 rounded-2xl p-8 max-w-md mx-auto">
                <Search className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Có lỗi xảy ra</h3>
                <p className="text-slate-400 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="text-blue-400 border-blue-400/30 hover:bg-blue-500/20"
                >
                  Thử lại
                </Button>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 results-grid">
                {currentResults.map((result, index) => (
                <div
                  key={startIndex + index}
                  className="p-6 bg-slate-800/60 rounded-xl border border-slate-600/40 hover:border-slate-500/60 cursor-pointer transition-all duration-300 hover:shadow-lg hover:bg-slate-800/80 relative overflow-hidden group"
                  onClick={() => {
                    onDetailedAnalysis(result.id);
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/8 via-transparent to-blue-400/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {result.name || result.code || result.symbol || result.ticker || searchQuery.trim().toUpperCase()}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {companyDetailsCache[result.id]?.company?.company_name ||
                           result.company_name ||
                           result.companyName ||
                           result.fullName ||
                           result.description ||
                           'Đang tải tên công ty...'}
                        </p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                        Cổ phiếu
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Sàn giao dịch:</span>
                        <span className="text-white font-medium">
                          {result.exchange || 'HOSE'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Ngày cập nhật:</span>
                        <span className="text-slate-400 text-xs">
                          {result.updated_at ? new Date(result.updated_at).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </div>
                      {companyDetailsCache[result.id]?.company?.industry && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Ngành:</span>
                          <span className="text-cyan-400 text-xs">
                            {companyDetailsCache[result.id].company.industry}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDetailedAnalysis(result.id);
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-8">
                  {/* Previous Button */}
                  <Button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border-slate-600/40 text-slate-300 hover:bg-slate-700/80 hover:border-slate-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Trước</span>
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page and adjacent pages
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1;

                      if (!showPage) {
                        // Show ellipsis
                        if (page === currentPage - 2 && currentPage > 3) {
                          return (
                            <span key={page} className="px-2 text-slate-500">
                              ...
                            </span>
                          );
                        }
                        if (page === currentPage + 2 && currentPage < totalPages - 2) {
                          return (
                            <span key={page} className="px-2 text-slate-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className={`w-10 h-10 p-0 ${
                            currentPage === page
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg"
                              : "bg-slate-800/60 border-slate-600/40 text-slate-300 hover:bg-slate-700/80 hover:border-slate-500/60"
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border-slate-600/40 text-slate-300 hover:bg-slate-700/80 hover:border-slate-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 rounded-2xl p-8 max-w-md mx-auto">
                <Search className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Không tìm thấy kết quả</h3>
                <p className="text-slate-400 mb-4">
                  Không có công ty nào phù hợp với từ khóa "{currentSearchQuery}"
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => setLocalSearchQuery("")}
                    variant="outline"
                    className="text-blue-400 border-blue-400/30 hover:bg-blue-500/20"
                  >
                    Xóa bộ lọc
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/viewdetails/'}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    Xem tất cả
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Back Button for Mobile - Always visible */}
      <div className="fixed bottom-6 left-6 z-40 sm:hidden">
        <Button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Trang chủ</span>
        </Button>
      </div>
    </div>
  );
}