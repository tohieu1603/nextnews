"use client";

import { Dayjs } from "dayjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/components/ui/utils";
import { ConfigProvider, DatePicker, theme as antdTheme } from "antd";
import viVN from "antd/locale/vi_VN";
import { Edit, Save, Upload, User, X } from "lucide-react";

import { UserProfile } from "@/types";

interface UserProfileTabProps {
  user: UserProfile;
  editedUser: UserProfile | null;
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  validationErrors: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
  selectedDate: Dayjs | null;
  onDateChange: (value: Dayjs | null) => void;
  disableOutOfRangeDates: (date: Dayjs) => boolean;
  onAvatarChange: () => void;
}

export default function UserProfileTab({
  user,
  editedUser,
  isEditing,
  onEditChange,
  onSave,
  onCancel,
  validationErrors,
  onInputChange,
  selectedDate,
  onDateChange,
  disableOutOfRangeDates,
  onAvatarChange,
}: UserProfileTabProps) {
  return (
    <TabsContent
      value="profile"
      className="p-4 sm:p-6 lg:p-8 pt-8 sm:pt-10 lg:pt-12 space-y-4 sm:space-y-6 bg-slate-900/40"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">
              Thông tin cá nhân
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Quản lý thông tin tài khoản và cài đặt cá nhân của bạn
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {isEditing ? (
              <>
                <Button
                  onClick={onSave}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm sm:text-base"
                >
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Lưu
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 sm:flex-none border-slate-400/30 text-slate-400 hover:bg-slate-700/30 text-sm sm:text-base"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Hủy
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onEditChange(true)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm sm:text-base"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      </div>
      <Card className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20 backdrop-blur-sm relative">
        {/* Avatar Section - Show first on mobile */}
        <div className="lg:col-span-1 lg:order-last flex flex-col items-center justify-center space-y-3 sm:space-y-4 p-4 sm:p-6 lg:p-0">
          <div className="relative group">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
              <AvatarImage src={user?.avatar} alt={user?.fullName || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white text-base sm:text-lg">
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
            <div
              onClick={onAvatarChange}
              className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-xs text-white">Thay đổi</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="text-slate-300 border-slate-600 hover:bg-slate-700/50 text-sm w-full sm:w-auto"
            onClick={onAvatarChange}
          >
            Chọn ảnh
          </Button>

          <div className="text-center text-xs sm:text-sm text-slate-400 mt-2">
            <p>Dung lượng file tối đa 1 MB</p>
            <p>Định dạng: .JPEG, .PNG</p>
          </div>
        </div>
        {/* Divider - Desktop only */}
        <div className="hidden lg:block absolute left-2/3 top-1/2 transform -translate-y-1/2 w-px h-48 bg-gray-300/20" />
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="bg-transparent border-none">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl font-semibold">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Label className="text-slate-300 sm:w-32 sm:text-right text-sm">
                  Họ và tên
                </Label>
                <div className="flex-1 space-y-1">
                  <Input
                    value={editedUser?.fullName || ""}
                    onChange={(e) => onInputChange("fullName", e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 text-sm",
                      validationErrors.fullName && "border-red-400",
                      !isEditing && "bg-slate-800/30"
                    )}
                    placeholder="Nhập họ tên"
                  />
                  {validationErrors.fullName && (
                    <p className="text-red-400 text-xs sm:text-sm">
                      {validationErrors.fullName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Label className="text-slate-300 sm:w-32 sm:text-right text-sm">Email</Label>
                <div className="flex-1 space-y-1">
                  <Input
                    value={editedUser?.email || ""}
                    onChange={(e) => onInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 text-sm",
                      validationErrors.email && "border-red-400",
                      !isEditing && "bg-slate-800/30"
                    )}
                    placeholder="Nhập email"
                  />
                  {validationErrors.email && (
                    <p className="text-red-400 text-xs sm:text-sm">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Label className="text-slate-300 sm:text-right sm:w-32 text-sm">
                  Số điện thoại
                </Label>
                <div className="flex-1 space-y-1">
                  <Input
                    value={editedUser?.phone || ""}
                    onChange={(e) => onInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 text-sm",
                      validationErrors.phone && "border-red-400",
                      !isEditing && "bg-slate-800/30"
                    )}
                    placeholder="Nhập số điện thoại"
                  />
                  {validationErrors.phone && (
                    <p className="text-red-400 text-xs sm:text-sm">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-4">
                <Label className="text-slate-300 sm:text-right sm:w-32 sm:pt-2 text-sm">
                  Giới tính
                </Label>
                <RadioGroup
                  value={editedUser?.gender ?? undefined}
                  onValueChange={(value) => {
                    if (!isEditing) return;
                    onInputChange("gender", value);
                  }}
                  className="flex flex-wrap gap-4 sm:gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="male"
                      id="male"
                      disabled={!isEditing}
                    />
                    <Label htmlFor="male" className="text-slate-300 text-sm">
                      Nam
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="female"
                      id="female"
                      disabled={!isEditing}
                    />
                    <Label htmlFor="female" className="text-slate-300 text-sm">
                      Nữ
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="other"
                      id="other"
                      disabled={!isEditing}
                    />
                    <Label htmlFor="other" className="text-slate-300 text-sm">
                      Khác
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Label className="text-slate-300 sm:text-right sm:w-32 text-sm">
                  Ngày sinh
                </Label>
                <div className="flex-1">
                  <ConfigProvider
                    locale={viVN}
                    theme={{
                      algorithm: antdTheme.darkAlgorithm,
                      token: {
                        colorPrimary: "#22d3ee",
                        colorPrimaryHover: "#38bdf8",
                        colorPrimaryActive: "#0ea5e9",
                        colorText: "#e2e8f0",
                        colorTextPlaceholder: "rgba(148,163,184,0.75)",
                        colorTextDisabled: "rgba(148,163,184,0.6)",
                        colorBgContainer: "rgba(15,23,42,0.75)",
                        colorBorder: "rgba(71,85,105,0.6)",
                        borderRadius: 12,
                      },
                    }}
                  >
                    <DatePicker
                      value={selectedDate}
                      onChange={onDateChange}
                      format="DD/MM/YYYY"
                      disabledDate={disableOutOfRangeDates}
                      disabled={!isEditing}
                      allowClear={false}
                      inputReadOnly
                      className="profile-date-picker w-full"
                      classNames={{ root: "profile-date-picker-root" }}
                    />
                  </ConfigProvider>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-4">
                <Label className="text-slate-300 sm:text-right sm:w-32 sm:pt-2 text-sm">
                  Địa chỉ
                </Label>
                <div className="flex-1">
                  <Textarea
                    value={editedUser?.address || ""}
                    onChange={(e) => onInputChange("address", e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 text-sm",
                      !isEditing && "bg-slate-800/30"
                    )}
                    placeholder="Nhập địa chỉ"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Card>
    </TabsContent>
  );
}
