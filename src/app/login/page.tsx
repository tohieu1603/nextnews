"use client";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { getGoogleAuthUrl, loginWithEmail } from "@/services/api";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  TrendingUp,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginWithEmail(email, password, rememberMe);
      console.log("Login successful:", response);
      // Handle successful login (e.g., store token, redirect)
      if (response.token) {
        localStorage.setItem("token", response.token);
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify({ email }));
        }
        router.push("/profile");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleClick = async () => {
    try {
      setIsGoogleLoading(true);
      const resp = await getGoogleAuthUrl();

      const url =
        resp?.auth_url ||
        resp?.authUrl ||
        resp?.url ||
        resp?.data?.auth_url ||
        resp?.data?.authUrl;
      if (url) {
        window.location.assign(url);
        return;
      }
      alert("Không lấy được URL đăng nhập Google. Vui lòng thử lại.");
    } catch (err) {
      console.error("Lỗi khi lấy URL Google:", err);
      alert("Không kết nối được máy chủ đăng nhập. Kiểm tra backend.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#0E1B36" }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-cyan-600/5 to-teal-600/5"></div>

      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Back button */}
        <Button
          onClick={() => {
            router.push("/");
          }}
          className="mb-6 bg-blue-400"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Về trang chủ
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Right side - Login form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-2 border-blue-500/30 backdrop-blur-sm shadow-2xl">
              <CardHeader className="space-y-6 pb-8">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent tracking-wide">
                      Đăng nhập
                    </CardTitle>
                    <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full mx-auto shadow-lg"></div>
                  </div>
                  <p className="text-slate-400 text-lg">
                    Chào mừng bạn quay trở lại
                  </p>
                </div>

                {/* Premium badge */}
                <div className="flex justify-center">
                  <Badge className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2">
                    <Sparkles className="w-3 h-3 mr-2" />
                    Tài khoản Premium
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email field */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <label className="text-base font-semibold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                        Email
                      </label>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-teal-400" />
                      <label className="text-base font-semibold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                        Mật khẩu
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all duration-300"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 text-slate-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Remember me and forgot password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) =>
                          setRememberMe(checked as boolean)
                        }
                        className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm text-slate-300"
                      >
                        Ghi nhớ đăng nhập
                      </label>
                    </div>

                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-blue-400 hover:text-blue-300 p-0 h-auto"
                    >
                      Quên mật khẩu?
                    </Button>
                  </div>

                  {/* Login button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang đăng nhập...
                      </div>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800 text-slate-400">
                      Hoặc
                    </span>
                  </div>
                </div>

                {/* Social login */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onGoogleClick}
                    disabled={isGoogleLoading}
                    className="w-full bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    <FcGoogle className="w-5 h-5" />
                    Đăng nhập với Google
                  </Button>
                </div>

                {/* Sign up link */}
                <div className="text-center pt-4">
                  <p className="text-sm text-slate-400">
                    Chưa có tài khoản?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                    >
                      Đăng ký ngay
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Left side - Branding and features */}
          <div className="space-y-8">
            {/* Logo and title */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                    Togogo Analytics
                  </h1>
                  <p className="text-slate-400">
                    Phân tích chứng khoán chuyên nghiệp
                  </p>
                </div>
              </div>

              <p className="text-xl text-slate-300 leading-relaxed">
                Đăng nhập để truy cập vào hệ thống phân tích chứng khoán hàng
                đầu Việt Nam
              </p>
            </div>

            {/* Features showcase */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 border border-blue-400/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                      <BarChart3 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Phân tích chuyên sâu
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Báo cáo tài chính chi tiết, phân tích kỹ thuật và đánh
                        giá cơ bản
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 border border-teal-400/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-teal-400/30">
                      <Sparkles className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        AI Trading Bot
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Gợi ý giao dịch thông minh với độ chính xác cao từ AI
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 border border-cyan-400/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
                      <Shield className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Dữ liệu real-time
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Cập nhật giá và thông tin thị trường theo thời gian thực
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-400/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  50K+
                </div>
                <div className="text-xs text-slate-400">Nhà đầu tư</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-xl border border-teal-400/20">
                <div className="text-2xl font-bold text-teal-400 mb-1">
                  1.2M+
                </div>
                <div className="text-xs text-slate-400">Phân tích</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/20">
                <div className="text-2xl font-bold text-cyan-400 mb-1">98%</div>
                <div className="text-xs text-slate-400">Độ chính xác</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
