import type { CSSProperties } from "react";
import {
  ShoppingBag,
  Crown,
  Database,
  Power,
  Settings,
  User,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { TradingBot } from "../../types";
import { UserProfile } from "@/types";

interface SidebarProps {
  user: UserProfile;
  membershipDays: number;
  activeBots: number;
  totalServices: number;
  tradingBots: TradingBot[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
  style?: CSSProperties;
}

export default function Sidebar({
  user,
  membershipDays,
  activeBots,
  totalServices,
  tradingBots,
  activeTab,
  setActiveTab,
  className,
  style,
}: SidebarProps) {
  return (
    <div
      className={cn(
        "w-80 bg-gradient-to-b from-slate-900/80 to-slate-800/60 backdrop-blur-xl border-r border-blue-400/20 flex flex-col overflow-hidden",
        className
      )}
      style={style}
    >
      {/* Header section with rounded corners */}
      <div className="p-6 border-b border-blue-400/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
          </div>
          <div className="text-slate-400 text-sm">user.profile</div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-2 border-cyan-400/30">
              <AvatarImage src={user?.avatar} alt={user?.fullName || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white text-lg">
                {user?.fullName
                  ? user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                  : user?.email
                  ? user.email.substring(0, 2).toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1">
            <h3 className="text-white text-xl font-semibold">
              {user?.fullName || user?.email || "User"}
            </h3>
            <p className="text-cyan-400 text-sm">#{user?.id || "---"}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-400 border-yellow-400/30 text-xs rounded-full">
                <Crown className="w-3 h-3 mr-1" />
                PREMIUM
              </Badge>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Basic Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Trạng thái:</span>
            <span className="text-emerald-400">Hoạt động</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Thành viên:</span>
            <span className="text-blue-400">{membershipDays} ngày</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Bot hoạt động:</span>
            <span className="text-cyan-400">
              {activeBots}/{tradingBots.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Dịch vụ:</span>
            <span className="text-purple-400">{totalServices}</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu with rounded design */}
      <div className="flex-1 p-6">
        <div className="space-y-2">
          {[
            {
              id: "profile",
              label: "Thông tin cá nhân",
              icon: User,
              color: "text-blue-400",
            },
            {
              id: "licenses",
              label: "Các mã đã mua",
              icon: ShoppingBag,
              color: "text-cyan-400",
            },
            {
              id: "wallet",
              label: "Ví & Nạp tiền",
              icon: Wallet,
              color: "text-emerald-400",
            },
            {
              id: "history",
              label: "Lịch sử giao dịch",
              icon: Database,
              color: "text-purple-400",
            },

            {
              id: "settings",
              label: "Cài đặt",
              icon: Settings,
              color: "text-orange-400",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 border ${
                activeTab === item.id
                  ? "bg-blue-500/20 border-blue-400/30 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/30"
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-base">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Actions with rounded design */}
      <div className="p-6 border-t border-blue-400/20">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:text-white rounded-lg"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 hover:text-white rounded-lg"
          >
            <Power className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
