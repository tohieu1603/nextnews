"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  TrendingUp,
  Search,
  Bell,
  User,
  Menu,
  X,
  Globe,
  BarChart3,
  Newspaper,
  Bot,
  Settings,
  Wallet,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuthStore } from "@/store/auth.store";
import { getCompanyDetails, getNameData } from "@/services/api";
import { useRouter } from "next/navigation";
import { searchStockSuggestions, StockSuggestion } from "@/constants/stockSuggestions";
import { usePathname } from "next/navigation";

type UserProfile = {

  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  displayName?: string;
  [key: string]: unknown;
};
interface HeaderProps {
  data?: unknown;
}

const PROFILE_ENDPOINT = "http://192.168.31.248:8000/api/auth/profile";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const resolveDisplayName = (profile?: UserProfile | null) => {
  if (!profile) return "";
  const fromDisplayName =
    typeof profile.displayName === "string" ? profile.displayName.trim() : "";
  if (fromDisplayName) return fromDisplayName;

  const fromName = typeof profile.name === "string" ? profile.name.trim() : "";
  if (fromName) return fromName;

  const first =
    typeof profile.first_name === "string" ? profile.first_name.trim() : "";
  const last =
    typeof profile.last_name === "string" ? profile.last_name.trim() : "";
  const full = [first, last].filter(Boolean).join(" ").trim();
  if (full) return full;

  const username =
    typeof profile.username === "string" ? profile.username.trim() : "";
  if (username) return username;

  const email = typeof profile.email === "string" ? profile.email.trim() : "";
  if (email) return email;

  return "";
};

const safeParseUser = (raw: string | null): UserProfile | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isRecord(parsed) ? (parsed as UserProfile) : null;
  } catch (error) {
    console.warn("Failed to parse cached user:", error);
    return null;
  }
};

const extractProfileRecord = (
  value: unknown
): Record<string, unknown> | null => {
  const visited = new Set<unknown>();
  let current: unknown = value;

  while (isRecord(current) && !visited.has(current)) {
    visited.add(current);
    const record = current as Record<string, unknown>;

    const hasIdentity =
      typeof record["email"] === "string" ||
      typeof record["name"] === "string" ||
      typeof record["username"] === "string" ||
      typeof record["first_name"] === "string" ||
      typeof record["last_name"] === "string";

    if (hasIdentity) {
      return record;
    }

    const nextKeys = ["user", "profile", "result", "data", "account"];
    let nextCandidate: unknown = null;
    for (const key of nextKeys) {
      if (key in record) {
        const candidate = record[key];
        if (candidate !== undefined && candidate !== null) {
          nextCandidate = candidate;
          break;
        }
      }
    }

    if (!isRecord(nextCandidate) || visited.has(nextCandidate)) {
      break;
    }

    current = nextCandidate;
  }

  return null;
};


export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeSearchFilter, setActiveSearchFilter] = useState("Tổng quan");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  // const [user, setUser] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);

  const { user, wallet, isLoggedIn, logout, fetchWallet } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  // Fetch wallet when user is logged in
  useEffect(() => {
    if (isLoggedIn && user && !wallet) {
      fetchWallet();
    }
  }, [isLoggedIn, user, wallet, fetchWallet]);


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show header when near top
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide header when scrolling down (after 100px)
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Show header when scrolling up
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navigationItems = [
    {
      label: "TRANG CHỦ",
      href: "#",
      isActive: true,
      icon: <Globe className="w-4 h-4" />,
    },
    {
      label: "THỊ TRƯỜNG",
      href: "#",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: "DOANH NGHIỆP",
      href: "#",
      icon: <Newspaper className="w-4 h-4" />,
    },
    {
      label: "KINH TẾ",
      href: "#",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      label: "CHÍNH SÁCH",
      href: "#",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "PHÂN TÍCH",
      href: "#",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: "AI TRADING",
      href: "#",
      icon: <Bot className="w-4 h-4" />,
    },
  ];

  const searchFilters = [
    {
      label: "Tổng quan",
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  const breakingNews = [
    "🔥 VN-Index vượt mốc 1,280 điểm trong phiên chiều",
    "📈 Khối ngoại mua ròng 500 tỷ đồng",
    "💰 Cổ phiếu ngân hàng tăng mạnh",
    "⚡ HPG công bố kết quả kinh doanh vượt kỳ vọng",
    "🏆 TCB đạt ROE cao nhất ngành ngân hàng",
  ];
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    // localStorage.clear();
    logout();
    setIsProfileMenuOpen(false);
    router.push("/");
  };


  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

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
    setSearchQuery(stockCode);
    setShowSuggestions(false);
    setSuggestions([]);
    // Immediately navigate to search results
    router.push(`/search?q=${encodeURIComponent(stockCode)}`);
  };

  // Handle focus and blur for suggestions
  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0) {
      const newSuggestions = searchStockSuggestions(searchQuery, 6);
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



  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();

    // Map thứ
    const weekdays = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];

    const dayName = weekdays[now.getDay()];
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    setDateStr(`${dayName}, ${day}/${month}/${year}`);
  }, []);
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const data = await getNameData(searchQuery.trim().toUpperCase());
      console.log("Kết quả:", data);
      setResult(data);

      // Điều hướng đến trang search results với query parameter
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } catch (err) {
      console.error("Search error:", err);
      setError("Không tìm thấy mã này");
    } finally {
      setLoading(false);
    }
  };




  return (

    <header
      className={`bg-gray-900/95 border-b border-gray-600/30 fixed top-0 left-0 right-0 z-[100] shadow-xl backdrop-blur-md transition-transform duration-300 ease-in-out ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
    >
      {/* Breaking News Ticker - Enhanced */}
      <div className="bg-blue-600 text-white py-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 animate-pulse"></div>
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-4">
            <Badge className="bg-white text-blue-600 px-3 py-1 font-medium flex-shrink-0 shadow-md">
              <span className="animate-pulse">●</span>
              <span className="ml-1">HOT NEWS</span>
            </Badge>
            <div className="flex-1 overflow-hidden">
              <div className="flex animate-marquee">
                {breakingNews.map((news, index) => (
                  <span
                    key={index}
                    className="mr-12 whitespace-nowrap cursor-pointer hover:text-cyan-200 transition-colors"
                  >
                    {news}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Top bar - Enhanced */}
        <div className="flex items-center justify-between py-4 border-b border-gray-600/30">
          {/* Logo and Brand - Enhanced */}
          <Link
            href={"/"}
            className="flex items-center space-x-4 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">24H</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">
                  TOGOGO ANALYTICS
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <span>Tin tức & Phân tích tài chính</span>
                  <Badge
                    variant="outline"
                    className="text-xs px-1 py-0 text-emerald-400 border-emerald-400/50 bg-emerald-400/10"
                  >
                    Live
                  </Badge>
                </div>
              </div>
            </div>
          </Link>

          {/* Right side - Enhanced */}
          <div className="flex items-center space-x-4">
            {/* Market Summary - Enhanced */}
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/60 rounded-lg border border-gray-600/40">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{dateStr}</span>
              </div>
              <div className="text-gray-600">|</div>
            </div>
            {/* Action buttons - Enhanced */}
            <div className="flex items-center space-x-2">
              {user && isLoggedIn && (
                <>
                  {/* Wallet Balance */}
                  {wallet && (
                    <Link
                      href="/profile?tab=wallet"
                      className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-400/30 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">
                        {new Intl.NumberFormat("vi-VN").format(wallet.balance)} đ
                      </span>
                    </Link>
                  )}

                  {/* User Name */}
                  <span className="hidden md:block text-sm text-blue-300 font-medium">
                    {user.fullName}
                  </span>
                </>
              )}

              <div className="relative">
                <Button
                  variant="ghost"
                  className="max-w-[180px] px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md truncate"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  {isLoggedIn && user
                    ? user.email || user.fullName
                    : "Đăng nhập"}
                </Button>

                {/* Profile Dropdown - Enhanced */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gradient-to-br from-slate-800 to-slate-700 border border-blue-400/30 rounded-lg shadow-xl py-2 z-50 backdrop-blur-sm">
                    <div className="px-4 py-2 border-b border-blue-400/20">
                      <div className="text-sm font-medium text-white">
                        Tài khoản
                      </div>
                      <div className="text-xs text-slate-400">
                        {isLoggedIn && user ? (
                          <span className="text-blue-300 font-medium">
                            <div className="text-xs">{user.fullName}</div>
                            <div className="text-xs text-slate-400">
                              {user.email}
                            </div>
                          </span>
                        ) : (
                          <span>Khách</span>
                        )}
                      </div>
                    </div>
                    {isLoggedIn && user ? (
                      <>
                        <Link
                          href={"/profile"}
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-blue-500/20 hover:text-white transition-colors"
                        >
                          Tài khoản của tôi
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-blue-500/20 hover:text-white transition-colors"
                        >
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={"/login"}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-blue-500/20 hover:text-white transition-colors"
                        >
                          Đăng nhập
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-700/50 text-gray-300 hover:text-white"
              >
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </div>
              </Button>
              {/* Mobile menu button - Enhanced */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-blue-500/20 text-slate-300 hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation - Enhanced Search Bar */}
        {!pathname.startsWith("/profile") && (
        <div className="hidden md:block py-3 lg:py-4">
          <div className="max-w-6xl mx-auto px-2 lg:px-4">
            {/* Search Bar with Filter Tabs - Responsive Enhanced */}
            <div className="bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-xl lg:rounded-2xl p-1 shadow-inner border border-blue-400/20 backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-0">
                {/* Filter Tabs - Responsive */}
                <div className="flex bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg lg:rounded-xl shadow-sm lg:mr-3 border border-blue-400/20 overflow-x-auto">
                  {searchFilters.map((filter) => (
                    <button
                      key={filter.label}
                      onClick={() => setActiveSearchFilter(filter.label)}
                      className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium transition-all rounded-lg lg:rounded-xl whitespace-nowrap ${activeSearchFilter === filter.label
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-blue-500/20"
                        }`}
                    >
                      <span className="w-3 h-3 lg:w-4 lg:h-4">{filter.icon}</span>
                      <span className="hidden sm:inline lg:inline">{filter.label}</span>
                      <span className="sm:hidden lg:hidden">{filter.label.slice(0, 3)}</span>
                    </button>
                  ))}
                </div>

                {/* Search Input - Responsive Enhanced */}
                <form onSubmit={handleSearch} className="flex-1 relative min-w-0">
                  <Search className="w-4 h-4 lg:w-5 lg:h-5 absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    placeholder={`Tìm ${activeSearchFilter.toLowerCase()}... (VD: VSC, HPG)`}
                    className="pl-10 lg:pl-12 pr-16 lg:pr-20 py-2.5 lg:py-3 text-sm lg:text-base bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-0 rounded-lg lg:rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-0 transition-all text-white placeholder-slate-400"
                  />
                  <div className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 lg:gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="px-2 lg:px-3 py-1 lg:py-1.5 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                      <span className="hidden lg:inline">Tìm</span>
                      <Search className="w-3 h-3 lg:hidden" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Stock Suggestions - Responsive Enhanced */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-2 bg-gradient-to-br from-slate-800/95 to-slate-700/95 rounded-lg shadow-xl border border-blue-400/30 py-2 w-full max-w-4xl mx-auto backdrop-blur-sm relative z-50">
                <div className="px-3 sm:px-4 py-2 text-xs text-slate-400 border-b border-blue-400/20">
                  <span className="hidden sm:inline">Gợi ý mã cổ phiếu ({suggestions.length} kết quả)</span>
                  <span className="sm:hidden">Gợi ý ({suggestions.length})</span>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.code}
                      onClick={() => handleSuggestionClick(suggestion.code)}
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-500/20 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {/* Avatar - responsive size */}
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs sm:text-xs">{suggestion.code.length > 3 ? suggestion.code.slice(0, 3) : suggestion.code}</span>
                        </div>

                        {/* Content - responsive layout */}
                        <div className="flex-1 min-w-0">
                          {/* Desktop & Tablet layout */}
                          <div className="hidden sm:block">
                            <div className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">
                              {suggestion.code} - {suggestion.name}
                            </div>
                            <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                              {suggestion.sector}
                            </div>
                          </div>

                          {/* Mobile layout */}
                          <div className="sm:hidden">
                            <div className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors truncate">
                              {suggestion.code}
                            </div>
                            <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors truncate">
                              {suggestion.name.length > 20 ? suggestion.name.slice(0, 20) + '...' : suggestion.name}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tag - hide on very small screens */}
                      <div className="hidden xs:block text-xs text-slate-500 group-hover:text-slate-400 transition-colors flex-shrink-0 ml-2">
                        <span className="hidden sm:inline">Cổ phiếu</span>
                        <span className="sm:hidden">CP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Mobile Navigation - Enhanced */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-400/20">
            {/* Mobile Search with Filters - Enhanced */}
            <div className="mb-4">
              {/* Mobile Filter Tabs - Enhanced */}
              <div className="flex mb-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg p-1 border border-blue-400/20">
                {searchFilters.map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => setActiveSearchFilter(filter.label)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded-md ${activeSearchFilter === filter.label
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm"
                      : "text-slate-300"
                      }`}
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Search Input - Enhanced */}
              
              <form onSubmit={handleSearch} className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder={`Tìm ${activeSearchFilter.toLowerCase()}...`}
                  className="pl-10 pr-12 bg-gradient-to-r from-slate-700/50 to-slate-600/50 border-blue-400/20 text-white placeholder-slate-400"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  Tìm
                </Button>
              </form>
            

              {/* Mobile Stock Suggestions - Responsive */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="mt-2 bg-gradient-to-br from-slate-800/95 to-slate-700/95 rounded-lg shadow-xl border border-blue-400/30 py-2 backdrop-blur-sm relative z-50">
                  <div className="px-3 py-2 text-xs text-slate-400 border-b border-blue-400/20">
                    Gợi ý ({suggestions.length})
                  </div>
                  <div className="space-y-0.5 max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.code}
                        onClick={() => handleSuggestionClick(suggestion.code)}
                        className="px-3 py-2.5 hover:bg-blue-500/20 active:bg-blue-500/30 cursor-pointer flex items-center gap-3 transition-all group touch-manipulation"
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <span className="text-white font-bold text-xs">{suggestion.code.length > 3 ? suggestion.code.slice(0, 3) : suggestion.code}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">
                              {suggestion.code}
                            </div>
                            <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors ml-2">
                              CP
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors truncate">
                            {suggestion.name.length > 25 ? suggestion.name.slice(0, 25) + '...' : suggestion.name}
                          </div>
                          <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                            {suggestion.sector}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Market Info - Enhanced */}
            <div className="mb-4 p-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg border border-blue-400/20">
            </div>

            {/* Mobile Menu Items - Enhanced */}
            <div className="space-y-2">
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 font-medium border border-blue-400/30"
                    : "text-slate-300 hover:bg-blue-500/20 hover:text-white"
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>

            {/* Mobile Actions - Enhanced */}
            <div className="mt-4 pt-4 border-t border-blue-400/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{dateStr}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        
      </div>
    </header>
  );
}
