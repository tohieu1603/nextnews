"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Tabs as UiTabs,
  TabsContent as UiTabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Bell, MessageCircle, RefreshCw, Shield } from "lucide-react";
import { TradingBot, WalletBalance } from "../../types";

interface SettingsTabProps {
  tradingBots: TradingBot[];
  walletBalance: WalletBalance;
  setWalletBalance: React.Dispatch<React.SetStateAction<WalletBalance>>;
  formatCurrency: (amount: number) => string;
}

export default function SettingsTab({
  tradingBots,
  walletBalance,
  setWalletBalance,
  formatCurrency,
}: SettingsTabProps) {
  const [notificationChannel, setNotificationChannel] = useState("telegram");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [zaloNumber, setZaloNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  const isTelegram = notificationChannel === "telegram";
  const isZalo = notificationChannel === "zalo";
  const isEmail = notificationChannel === "email";

  const getRecommendedMinBalance = (): number => {
    const activeBotsTotal = tradingBots
      .filter((bot) => bot.status === "active")
      .reduce((sum, bot) => sum + bot.monthlyFee, 0);

    // Recommend 3 months worth of active bot fees, minimum 200K
    return Math.max(200000, activeBotsTotal * 3);
  };

  const handleAutoRenewalToggle = (
    setting: keyof WalletBalance["autoRenewal"],
    value: boolean | number
  ) => {
    if (setting === "minBalance") {
      const recommendedMinBalance = getRecommendedMinBalance();
      setWalletBalance((prev) => ({
        ...prev,
        autoRenewal: {
          ...prev.autoRenewal,
          minBalance: recommendedMinBalance,
        },
      }));
    } else {
      setWalletBalance((prev) => ({
        ...prev,
        autoRenewal: {
          ...prev.autoRenewal,
          [setting]: value,
          minBalance: getRecommendedMinBalance(),
        },
      }));
    }
  };

  return (
    <UiTabsContent
      value="settings"
      className="p-8 pt-12 bg-slate-900/40"
    >
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Cài đặt</h2>
          <p className="text-slate-400">
            Cấu hình các tùy chọn tự động và cài đặt hệ thống
          </p>
        </div>

        <UiTabs
          defaultValue="autoRenewal"
          className="flex flex-col gap-4"
        >
          <TabsList className="w-full justify-start gap-2 rounded-2xl border border-slate-800/60 bg-slate-800/40 p-1.5 ">
            <TabsTrigger value="autoRenewal" className="gap-2 px-4 py-2">
              <RefreshCw className="h-4 w-4 text-orange-400" />
              Gia hạn
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 px-4 py-2">
              <Bell className="h-4 w-4 text-purple-400" />
              Thông báo
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 px-4 py-2">
              <Shield className="h-4 w-4 text-red-400" />
              Bảo mật
            </TabsTrigger>
          </TabsList>

          <UiTabsContent
            value="autoRenewal"
            className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-800/40 to-slate-700/40 p-6"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between rounded-lg border border-slate-600/30 bg-slate-700/30 p-4">
                <div>
                  <Label className="text-base text-slate-300">
                    Bật tự động gia hạn
                  </Label>
                  <p className="mt-1 text-sm text-slate-400">
                    Tự động gia hạn các dịch vụ khi hết hạn
                  </p>
                </div>
                <Switch
                  checked={walletBalance.autoRenewal.enabled}
                  onCheckedChange={(checked) =>
                    handleAutoRenewalToggle("enabled", checked)
                  }
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>

              {walletBalance.autoRenewal.enabled && (
                <div className="ml-4 space-y-4 border-l-2 border-orange-400/30 pl-4">
                  <div className="flex items-center justify-between rounded-lg bg-slate-700/20 p-3">
                    <div>
                      <Label className="text-slate-300">
                        Gia hạn tín hiệu trading
                      </Label>
                      <p className="text-xs text-slate-400">
                        Tự động gia hạn gói tín hiệu khi hết hạn
                      </p>
                    </div>
                    <Switch
                      checked={walletBalance.autoRenewal.signalPackages}
                      onCheckedChange={(checked) =>
                        handleAutoRenewalToggle("signalPackages", checked)
                      }
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-slate-700/20 p-3">
                    <div>
                      <Label className="text-slate-300">
                        Gia hạn bot trading
                      </Label>
                      <p className="text-xs text-slate-400">
                        Gia hạn các bot trading tự động
                      </p>
                    </div>
                    <Switch
                      checked={walletBalance.autoRenewal.botSubscriptions}
                      onCheckedChange={(checked) =>
                        handleAutoRenewalToggle("botSubscriptions", checked)
                      }
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>

                  <div className="rounded-lg bg-slate-700/20 p-3">
                    <Label className="mb-2 block text-slate-300">
                      Số dư tối thiểu để gia hạn
                    </Label>
                    <Input
                      type="text"
                      value={formatCurrency(getRecommendedMinBalance())}
                      readOnly
                      className="cursor-not-allowed border-slate-600/50 bg-slate-600/30 text-slate-300"
                      placeholder="500,000"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Tự động tính toán: {formatCurrency(getRecommendedMinBalance())} VNĐ (3 tháng phí bot hiện tại)
                    </p>
                    <p className="mt-1 text-xs text-cyan-400">
                      Mức này được tính tự động dựa trên tổng phí của các bot
                      đang hoạt động
                    </p>
                  </div>
                </div>
              )}
            </div>
          </UiTabsContent>

          <UiTabsContent
            value="notifications"
            className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-800/40 to-slate-700/40 p-6"
          >
            <div className="flex flex-col gap-5">
              <div className="rounded-lg border border-slate-700/30 bg-slate-700/30 p-4">
                <Label className="mb-3 flex items-center gap-2 text-base text-slate-200">
                  <MessageCircle className="h-4 w-4 text-purple-300" />
                  Chọn kênh nhận tín hiệu
                </Label>
                <RadioGroup
                  value={notificationChannel}
                  onValueChange={setNotificationChannel}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  <div className="flex items-center gap-3 rounded-lg border border-slate-600/40 bg-slate-800/40 px-3 py-2">
                    <RadioGroupItem value="telegram" id="notify-telegram" />
                    <Label htmlFor="notify-telegram" className="text-sm text-slate-200">
                      Telegram
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-600/40 bg-slate-800/40 px-3 py-2">
                    <RadioGroupItem value="zalo" id="notify-zalo" />
                    <Label htmlFor="notify-zalo" className="text-sm text-slate-200">
                      Zalo
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-600/40 bg-slate-800/40 px-3 py-2">
                    <RadioGroupItem value="email" id="notify-email" />
                    <Label htmlFor="notify-email" className="text-sm text-slate-200">
                      Email
                    </Label>
                  </div>
                </RadioGroup>
                <p className="mt-3 text-xs text-slate-400">
                  Điền thông tin liên hệ tương ứng để bot có thể gửi thông báo chính xác.
                </p>

                {(isTelegram || isZalo || isEmail) && (
                  <div className="mt-4 space-y-4 rounded-lg border border-slate-700/40 bg-slate-800/30 p-4">
                    <p className="text-xs text-slate-400">
                      Nhập dữ liệu bắt buộc cho kênh đã chọn. Nếu bỏ trống bot sẽ không thể gửi tin.
                    </p>

                    {isTelegram && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="telegram-username" className="text-sm text-slate-200">
                            Telegram username
                          </Label>
                          <Input
                            id="telegram-username"
                            placeholder="@your_username"
                            value={telegramHandle}
                            onChange={(event) => setTelegramHandle(event.target.value)}
                          />
                          <p className="text-xs text-slate-500">
                            Username hoặc link Telegram dùng để bot nhận dạng bạn.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telegram-chat-id" className="text-sm text-slate-200">
                            Telegram chat ID
                          </Label>
                          <Input
                            id="telegram-chat-id"
                            placeholder="123456789"
                            value={telegramChatId}
                            onChange={(event) => setTelegramChatId(event.target.value)}
                          />
                          <p className="text-xs text-slate-500">
                            Chat ID giúp bot gửi tin nhắn đến đúng cuộc trò chuyện.
                          </p>
                        </div>
                      </div>
                    )}

                    {isZalo && (
                      <div className="space-y-2">
                        <Label htmlFor="zalo-number" className="text-sm text-slate-200">
                          Số điện thoại Zalo
                        </Label>
                        <Input
                          id="zalo-number"
                          placeholder="0xxxxxxxxx"
                          value={zaloNumber}
                          onChange={(event) => setZaloNumber(event.target.value)}
                        />
                        <p className="text-xs text-slate-500">
                          Sử dụng số đăng ký Zalo hoặc OA ID để bot kết nối khi gửi tín hiệu.
                        </p>
                      </div>
                    )}

                    {isEmail && (
                      <div className="space-y-2">
                        <Label htmlFor="notify-email-field" className="text-sm text-slate-200">
                          Địa chỉ email nhận thông báo
                        </Label>
                        <Input
                          id="notify-email-field"
                          type="email"
                          placeholder="user@domain.com"
                          value={emailAddress}
                          onChange={(event) => setEmailAddress(event.target.value)}
                        />
                        <p className="text-xs text-slate-500">
                          Đảm bảo email khớp với tài khoản bạn đang sử dụng.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-700/30 p-3">
                  <div>
                    <Label className="text-slate-300">Thông báo gia hạn</Label>
                    <p className="text-xs text-slate-400">
                      Nhận thông báo khi dịch vụ sắp hết hạn
                    </p>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple-500" />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-700/30 p-3">
                  <div>
                    <Label className="text-slate-300">Thông báo giao dịch</Label>
                    <p className="text-xs text-slate-400">
                      Nhận thông báo khi bot thực hiện giao dịch
                    </p>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple-500" />
                </div>

                <div className="flex items-center   justify-between rounded-lg border border-slate-700/30 bg-slate-700/30 p-3">
                  <div>
                    <Label className="text-slate-300">Thông báo nạp tiền</Label>
                    <p className="text-xs text-slate-400">
                      Cập nhật trạng thái nạp rút tài khoản
                    </p>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple-500" />
                </div>
              </div>
            </div>
          </UiTabsContent>

          <UiTabsContent
            value="security"
            className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-800/40 to-slate-700/40 p-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-700/30 p-3">
                <div>
                  <Label className="text-slate-300">Xác thực 2 yếu tố</Label>
                  <p className="text-xs text-slate-400">
                    Bảo vệ tài khoản bằng OTP
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                >
                  Kích hoạt
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-700/30 p-3">
                <div>
                  <Label className="text-slate-300">Đổi mật khẩu</Label>
                  <p className="text-xs text-slate-400">
                    Cập nhật mật khẩu đăng nhập
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-400/30 text-slate-400 hover:bg-slate-700/30"
                >
                  Thay đổi
                </Button>
              </div>
            </div>
          </UiTabsContent>
        </UiTabs>
      </div>
    </UiTabsContent>
  );
}
