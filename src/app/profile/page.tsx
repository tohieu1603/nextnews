"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  QrCode,
  Settings,
  User,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/store/auth.store";
import { TradingBot, Transaction, Package, WalletBalance } from "./types";
import { PurchasedLicense, AutoRenewSubscription } from "@/types";
import Sidebar from "./components/layouts/Sidebar";
import UserProfileTab from "./components/tabs/UserProfileTab";
import PurchasedLicensesTab from "./components/tabs/PurchasedLicensesTab";
import TransactionHistoryTab from "./components/tabs/TransactionHistoryTab";
import WalletTab from "./components/tabs/WalletTab";
import SettingsTab from "./components/tabs/SettingsTab";
import {
  getPurchasedLicenses,
  getAutoRenewSubscriptions,
  pauseAutoRenew,
  resumeAutoRenew,
  createAutoRenewSubscription,
} from "@/services/api";
import { cn } from "@/components/ui/utils";

const HEADER_HEIGHT = "8rem";
const CONTENT_MIN_HEIGHT = `calc(100vh - ${HEADER_HEIGHT})`;
const PROFILE_CONTENT_TOP_OFFSET = "5rem";
const SIDEBAR_MAX_HEIGHT = `calc(100vh - ${HEADER_HEIGHT} - ${PROFILE_CONTENT_TOP_OFFSET})`;

export default function UserProfilePage() {
  const { user, updateProfile, access_token } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const getInitialBirthDate = useCallback(() => {
    if (!user?.dateOfBirth) {
      return null;
    }

    const parsed = dayjs(user.dateOfBirth);
    return parsed.isValid() ? parsed : null;
  }, [user?.dateOfBirth]);

  const minBirthDate = useMemo(() => dayjs("1900-01-01").startOf("day"), []);

  // New state for dialogs
  const [showBotSettingsDialog, setShowBotSettingsDialog] = useState(false);
  const [showBotRenewDialog, setShowBotRenewDialog] = useState(false);
  const [showCancelOrderDialog, setShowCancelOrderDialog] = useState(false);
  const [showQRPaymentDialog, setShowQRPaymentDialog] = useState(false);
  const [selectedBot, setSelectedBot] = useState<TradingBot | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // QR Payment States
  const [paymentStatus, setPaymentStatus] = useState<
    "waiting" | "processing" | "success" | "failed"
  >("waiting");
  const [qrData, setQrData] = useState("");

  // NEW: Wallet and Auto Renewal States
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    balance: 2850000,
    lastTopUp: "2024-09-14",
    autoRenewal: {
      enabled: true,
      signalPackages: true,
      botSubscriptions: true,
      minBalance: 500000,
    },
  });

  // Purchased Licenses state
  const [purchasedLicenses, setPurchasedLicenses] = useState<PurchasedLicense[]>([]);
  const [licensesLoading, setLicensesLoading] = useState(true);
  const [, setSubscriptions] = useState<AutoRenewSubscription[]>([]);

  const loadLicensesAndSubscriptions = useCallback(async () => {
    if (!access_token) {
      setPurchasedLicenses([]);
      setSubscriptions([]);
      setLicensesLoading(false);
      return;
    }

    try {
      setLicensesLoading(true);
      const [licensesData, subscriptionsData]: [
        PurchasedLicense[],
        AutoRenewSubscription[]
      ] = await Promise.all([
        getPurchasedLicenses(access_token),
        getAutoRenewSubscriptions(access_token),
      ]);

      const subscriptionsByLicense = new Map<string, AutoRenewSubscription>();
      const subscriptionsById = new Map<string, AutoRenewSubscription>();

      subscriptionsData.forEach((subscription) => {
        subscriptionsById.set(subscription.subscription_id, subscription);
        if (subscription.current_license_id) {
          subscriptionsByLicense.set(subscription.current_license_id, subscription);
        }
        if (subscription.license_id) {
          subscriptionsByLicense.set(subscription.license_id, subscription);
        }
      });

      const mergedLicenses = licensesData.map((license) => {
        const matchedSubscription =
          license.subscription ??
          (license.subscription_id
            ? subscriptionsById.get(license.subscription_id) ?? null
            : null) ??
          subscriptionsByLicense.get(license.license_id) ??
          null;

        const subscriptionId =
          license.subscription_id ??
          matchedSubscription?.subscription_id ??
          matchedSubscription?.id ??
          null;

        return {
          ...license,
          subscription: matchedSubscription,
          subscription_id: subscriptionId,
        };
      });

      setPurchasedLicenses(mergedLicenses);
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error("Failed to fetch licenses:", error);
    } finally {
      setLicensesLoading(false);
    }
  }, [access_token]);

  // Sample data for trading bots (keep for backward compatibility with Sidebar)
  const [tradingBots] = useState<TradingBot[]>([
    {
      id: "BOT001",
      name: "Togogo AI Trading Pro",
      type: "AI Momentum",
      status: "active",
      subscribedDate: "2024-01-15",
      expiryDate: "2024-12-15",
      monthlyFee: 500000,
      description: "Bot AI phân tích momentum và xu hướng thị trường",
      openOrders: [],
    },
  ]);

  // Sample data for transactions
  const [transactions] = useState<Transaction[]>([
    {
      id: "TXN001",
      date: "2024-09-15",
      type: "bot_subscription",
      description: "Gia hạn Togogo AI Trading Pro - 1 tháng",
      amount: -500000,
      status: "completed",
      duration: "1 tháng",
    },
    {
      id: "TXN002",
      date: "2024-09-12",
      type: "signal_package",
      description: "Gói tín hiệu premium tuần - VCB Analysis",
      amount: -100000,
      status: "completed",
      duration: "1 tuần",
    },
    {
      id: "TXN003",
      date: "2024-09-10",
      type: "analysis_package",
      description: "Phân tích chuyên sâu TCB từ togogo.vn",
      amount: -20000,
      status: "completed",
    },
    {
      id: "TXN004",
      date: "2024-09-08",
      type: "bot_subscription",
      description: "Đăng ký Blue Chip Strategy Bot - 3 tháng",
      amount: -900000,
      status: "completed",
      duration: "3 tháng",
    },
    {
      id: "TXN005",
      date: "2024-09-05",
      type: "premium_upgrade",
      description: "Nâng cấp tài khoản Premium - 1 năm",
      amount: -1200000,
      status: "completed",
      duration: "1 năm",
    },
    {
      id: "TXN006",
      date: "2024-09-03",
      type: "signal_package",
      description: "Gói tín hiệu tuần - HPG Analysis",
      amount: -100000,
      status: "pending",
      duration: "1 tuần",
    },
  ]);

  // Initialize date picker
  useEffect(() => {
    setSelectedDate(getInitialBirthDate());
  }, [getInitialBirthDate]);

  // Fetch purchased licenses + auto renew subscriptions
  useEffect(() => {
    loadLicensesAndSubscriptions();
  }, [loadLicensesAndSubscriptions]);

  useEffect(() => {
    if (!isEditing) {
      setEditedUser(user);
    }
  }, [isEditing, user]);

  const disableOutOfRangeDates = useCallback(
    (current: Dayjs) => {
      if (!current) {
        return false;
      }

      return (
        current.endOf("day").isAfter(dayjs()) ||
        current.startOf("day").isBefore(minBirthDate)
      );
    },
    [minBirthDate]
  );

  if (!user || !editedUser) {
    return null;
  }

  // Validation functions
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email không được để trống";
    if (!emailRegex.test(email)) return "Email không đúng định dạng";
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phone) return "Số điện thoại không được để trống";
    if (!phoneRegex.test(phone.replace(/\s/g, "")))
      return "Số điện thoại không đúng định dạng";
    return null;
  };

  const validateName = (name: string): string | null => {
    if (!name.trim()) return "Họ tên không được để trống";
    if (name.length < 2) return "Họ tên phải có ít nhất 2 ký tự";
    return null;
  };

  // NEW: Helper function to format currency with commas
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-US"); // 500000 -> "500,000"
  };

  // New handler function for package selection
  const handlePackageSelect = (pkg: {
    duration: string;
    months: number;
    discount: number;
  }) => {
    if (!selectedBot) return;

    const originalPrice = selectedBot.monthlyFee * pkg.months;
    const discountedPrice = originalPrice * (1 - pkg.discount / 100);
    const savings = originalPrice - discountedPrice;

    setSelectedPackage({
      duration: pkg.duration,
      months: pkg.months,
      discount: pkg.discount,
      price: discountedPrice,
      originalPrice: originalPrice,
      savings: savings,
    });

    setShowBotRenewDialog(false);
    setShowQRPaymentDialog(true);

    // Generate QR data
    const orderId = `ORD${Date.now()}`;
    const qrString = `PAYMENT|${orderId}|${discountedPrice}|${selectedBot.name}|${pkg.duration}`;
    setQrData(qrString);
    setPaymentStatus("waiting");
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedUser((prev) => (prev ? { ...prev, [field]: value } : null));

    // Clear validation error when user starts typing
    setValidationErrors((prev) => {
      const updatedErrors = { ...prev };
      delete updatedErrors[field];
      return updatedErrors;
    });
  };

  const handleDateChange = (value: Dayjs | null) => {
    const normalized = value && value.isValid() ? value.startOf("day") : null;

    setSelectedDate(normalized);
    handleInputChange(
      "dateOfBirth",
      normalized ? normalized.toISOString() : ""
    );
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (editedUser?.fullName) {
      const nameError = validateName(editedUser.fullName);
      if (nameError) errors.fullName = nameError;
    }

    if (editedUser?.email) {
      const emailError = validateEmail(editedUser.email);
      if (emailError) errors.email = emailError;
    }

    if (editedUser?.phone) {
      const phoneError = validatePhone(editedUser.phone);
      if (phoneError) errors.phone = phoneError;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = () => {
    if (editedUser && validateForm()) {
      updateProfile(editedUser);
      setIsEditing(false);
      setValidationErrors({});
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser(user);
    setValidationErrors({});
    setSelectedDate(getInitialBirthDate());
  };
  const handleAvatarChange = () => {
    // Create hidden file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("Kích thước file không được vượt quá 5MB");
          return;
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
          alert("Vui lòng chọn file hình ảnh");
          return;
        }

        // Read file and convert to URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            const newUser = { ...editedUser!, avatar: result };
            setEditedUser(newUser);
            updateProfile({ avatar: result });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const activeBots = tradingBots.filter(
    (bot) => bot.status === "active"
  ).length;
  const totalServices = transactions.filter(
    (t) => t.status === "completed"
  ).length;
  const membershipDays = Math.floor(
    (Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Update handler functions for bot actions to use dialogs
  const handleBotSettings = (botId: string) => {
    const bot = tradingBots.find((b) => b.id === botId);
    setSelectedBot(bot || null);
    setShowBotSettingsDialog(true);
  };

  const handleBotRenew = (botId: string) => {
    const bot = tradingBots.find((b) => b.id === botId);
    setSelectedBot(bot || null);
    setShowBotRenewDialog(true);
  };

  const handleCancelOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowCancelOrderDialog(true);
  };

  const confirmCancelOrder = () => {
    // Here you would make the API call to cancel the order
    console.log(`Cancelling order ${selectedOrderId}`);
    setShowCancelOrderDialog(false);
    setSelectedOrderId("");
  };

  const handleCopyQR = () => {
    navigator.clipboard.writeText(qrData);
  };

  const handlePaymentComplete = () => {
    setPaymentStatus("success");
    setTimeout(() => {
      setShowQRPaymentDialog(false);
      setPaymentStatus("waiting");
    }, 2000);
  };

  const handleCancelPayment = () => {
    setShowQRPaymentDialog(false);
    setPaymentStatus("waiting");
  };

  // Handle enabling auto-renew subscription for a license
  const handleCreateAutoRenew = async (license: PurchasedLicense) => {
    if (!access_token) return;

    try {
      const renewalPrice =
        license.auto_renew_price ??
        license.purchase_price ??
        0;
      const cycleDays = license.license_days && license.license_days > 0 ? license.license_days : 30;

      await createAutoRenewSubscription(
        access_token,
        license.license_id,
        renewalPrice,
        cycleDays
      );

      await loadLicensesAndSubscriptions();
    } catch (error) {
      console.error("Failed to enable auto-renew:", error);
    }
  };

  // Handle auto-renew toggle
  const handleToggleAutoRenew = async (licenseId: string, currentValue: boolean) => {
    if (!access_token) return;

    try {
      const license = purchasedLicenses.find(l => l.license_id === licenseId);
      if (!license) {
        console.error("License not found");
        return;
      }

      // Get subscription ID from either flat or nested format
      const subscriptionId =
        license.subscription_id ||
        license.subscription?.subscription_id ||
        license.subscription?.id;

      if (!subscriptionId) {
        console.error("No subscription found for this license");
        return;
      }

      // Toggle subscription status
      if (currentValue) {
        // Currently enabled (active), so pause it (turn OFF)
        await pauseAutoRenew(access_token, subscriptionId);
      } else {
        // Currently disabled (paused), so resume it (turn ON)
        await resumeAutoRenew(access_token, subscriptionId);
      }

      // Refresh licenses list
      await loadLicensesAndSubscriptions();
    } catch (error) {
      console.error("Failed to toggle auto-renew:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1B36]">
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Flowing particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* ADDED: Large decorative circles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute rounded-full border border-cyan-400/25 animate-pulse"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* ADDED: Geometric circles with different opacities */}
        <div className="absolute top-1/4 left-1/6 w-64 h-64 border border-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/5 w-32 h-32 border border-teal-400/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 border border-cyan-400/15 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/5 right-1/3 w-96 h-96 border border-blue-400/10 rounded-full animate-pulse delay-3000"></div>

        {/* ADDED: Smaller accent circles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`small-circle-${i}`}
            className="absolute w-8 h-8 border border-cyan-400/35 rounded-full animate-pulse"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 1}s`,
            }}
          />
        ))}

        {/* Animated grid lines */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent transform rotate-45 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/3 to-transparent transform -rotate-45 animate-pulse delay-1000"></div>
        </div>

        {/* Moving data streams */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent animate-pulse"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400/25 to-transparent animate-pulse delay-1500"></div>

        {/* Vertical streams */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400/20 to-transparent animate-pulse delay-2000"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-pink-400/15 to-transparent animate-pulse delay-2500"></div>

        {/* Glowing orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-500/8 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-500/12 rounded-full blur-lg animate-pulse delay-2000"></div>

        {/* Circuit-like patterns */}
        <div className="absolute top-32 left-1/3 w-16 h-2 bg-gradient-to-r from-blue-400/20 to-cyan-400/10 rounded animate-pulse"></div>
        <div className="absolute bottom-40 left-1/2 w-2 h-16 bg-gradient-to-b from-teal-400/15 to-emerald-400/8 rounded animate-pulse delay-1000"></div>

        {/* Scan lines effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/1 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Page Container with proper spacing from header */}
      <div className="relative z-10 pt-32">

        {/* Mobile Tab Navigation */}
        <div className="md:hidden sticky top-32 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-blue-400/20">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-4 py-3 min-w-max">
              {[
                { id: "profile", icon: User, label: "Thông tin" },
                { id: "licenses", icon: ShoppingBag, label: "Mã" },
                { id: "wallet", icon: Wallet, label: "Ví" },
                { id: "history", icon: CreditCard, label: "Lịch sử" },
                { id: "settings", icon: Settings, label: "Cài đặt" },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                      activeTab === tab.id
                        ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Layout Wrapper */}
        <div className="flex">

          {/* Sidebar - Desktop Only, Fixed Position */}
          <aside className="hidden md:block fixed left-0 w-64 lg:w-72 xl:w-80 h-[calc(100vh-8rem)] overflow-y-auto">
            <Sidebar
              user={user}
              membershipDays={membershipDays}
              activeBots={activeBots}
              totalServices={totalServices}
              tradingBots={tradingBots}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              className="h-full"
            />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 md:ml-64 lg:ml-72 xl:ml-80 w-full">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            {/* Profile Tab */}
            <UserProfileTab
              user={user}
              editedUser={editedUser}
              isEditing={isEditing}
              onEditChange={(value) => setIsEditing(value)}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
              validationErrors={validationErrors}
              onInputChange={handleInputChange}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              disableOutOfRangeDates={disableOutOfRangeDates}
              onAvatarChange={handleAvatarChange}
            />

            {/* Purchased Licenses Tab */}
            <PurchasedLicensesTab
              licenses={purchasedLicenses}
              onToggleAutoRenew={handleToggleAutoRenew}
              onCreateAutoRenew={handleCreateAutoRenew}
              loading={licensesLoading}
            />

            {/* Transaction History Tab - now uses auth store directly */}
            <TransactionHistoryTab />

            {/* Wallet Tab - now uses auth store directly */}
            <WalletTab />

            <SettingsTab
              tradingBots={tradingBots}
              walletBalance={walletBalance}
              setWalletBalance={setWalletBalance}
              formatCurrency={formatCurrency}
            />
          </Tabs>
          </main>
        </div>
      </div>

      {/* Bot Settings Dialog */}
      <Dialog
        open={showBotSettingsDialog}
        onOpenChange={setShowBotSettingsDialog}
      >
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Cài đặt Bot
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Cấu hình các thông số cho bot {selectedBot?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-300">Mức rủi ro</Label>
              <Select defaultValue="medium">
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="low" className="text-white">
                    Thấp
                  </SelectItem>
                  <SelectItem value="medium" className="text-white">
                    Trung bình
                  </SelectItem>
                  <SelectItem value="high" className="text-white">
                    Cao
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Số tiền tối đa mỗi lệnh</Label>
              <Input
                type="number"
                defaultValue="10000000"
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Nhập số tiền"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Tự động giao dịch</Label>
              <Switch className="data-[state=checked]:bg-blue-500" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBotSettingsDialog(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Hủy
            </Button>
            <Button
              onClick={() => setShowBotSettingsDialog(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Lưu cài đặt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bot Renewal Dialog */}
      <Dialog open={showBotRenewDialog} onOpenChange={setShowBotRenewDialog}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Gia hạn Bot - {selectedBot?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Chọn gói gia hạn phù hợp với nhu cầu của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {[
              { duration: "1 tháng", months: 1, discount: 0 },
              { duration: "3 tháng", months: 3, discount: 10 },
              { duration: "6 tháng", months: 6, discount: 20 },
              { duration: "12 tháng", months: 12, discount: 30 },
            ].map((pkg) => {
              const originalPrice = selectedBot
                ? selectedBot.monthlyFee * pkg.months
                : 0;
              const discountedPrice = originalPrice * (1 - pkg.discount / 100);
              const savings = originalPrice - discountedPrice;

              return (
                <div
                  key={pkg.duration}
                  onClick={() => handlePackageSelect(pkg)}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-emerald-400/50 cursor-pointer transition-all duration-200 hover:bg-slate-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">
                        {pkg.duration}
                      </h4>
                      {pkg.discount > 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30 text-xs mt-1">
                          Tiết kiệm {pkg.discount}%
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {discountedPrice.toLocaleString("vi-VN")} VNĐ
                      </p>
                      {pkg.discount > 0 && (
                        <p className="text-slate-400 text-sm line-through">
                          {originalPrice.toLocaleString("vi-VN")} VNĐ
                        </p>
                      )}
                      {savings > 0 && (
                        <p className="text-emerald-400 text-xs">
                          Tiết kiệm {savings.toLocaleString("vi-VN")} VNĐ
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBotRenewDialog(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <AlertDialog
        open={showCancelOrderDialog}
        onOpenChange={setShowCancelOrderDialog}
      >
        <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Xác nhận hủy lệnh
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bạn có chắc chắn muốn hủy lệnh này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Không
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelOrder}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Hủy lệnh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Payment Dialog */}
      <Dialog open={showQRPaymentDialog} onOpenChange={setShowQRPaymentDialog}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-400" />
              Thanh toán QR Code
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Quét mã QR bên dưới để thanh toán
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-slate-800 mx-auto mb-2" />
                  <p className="text-slate-800 text-xs">QR Code giả lập</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            {selectedPackage && selectedBot && (
              <div className="space-y-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dịch vụ:</span>
                  <span className="text-white">{selectedBot.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian:</span>
                  <span className="text-white">{selectedPackage.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Giá gốc:</span>
                  <span className="text-slate-400 line-through">
                    {selectedPackage.originalPrice.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                {selectedPackage.savings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Giảm giá:</span>
                    <span className="text-emerald-400">
                      -{selectedPackage.savings.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-slate-600 pt-2">
                  <span className="text-white">Tổng thanh toán:</span>
                  <span className="text-emerald-400">
                    {selectedPackage.price.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className="text-center">
              {paymentStatus === "waiting" && (
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>Chờ thanh toán...</span>
                </div>
              )}
              {paymentStatus === "success" && (
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Thanh toán thành công!</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCopyQR}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Sao chép mã
            </Button>
            <Button
              onClick={handlePaymentComplete}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={paymentStatus === "success"}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Đã thanh toán
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelPayment}
              className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
              Hủy thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
