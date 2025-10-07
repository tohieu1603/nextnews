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
      className="p-8 pt-12 space-y-6 bg-slate-900/40"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Thông tin cá nhân
          </h2>
          <p className="text-slate-400">
            Quản lý thông tin tài khoản và cài đặt cá nhân của bạn
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={onSave}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-slate-400/30 text-slate-400 hover:bg-slate-700/30"
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onEditChange(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <Card className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-gradient-to-br from-slate-800/40 to-slate-700/40 border border-blue-400/20 backdrop-blur-sm relative">
        <div className="col-span-2">
          <Card className="bg-transparent border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-xl font-semibold">
                <User className="w-6 h-6 text-blue-400" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label className="text-slate-300 w-32 text-right">
                  Họ và tên
                </Label>
                <Input
                  value={editedUser?.fullName || ""}
                  onChange={(e) => onInputChange("fullName", e.target.value)}
                  disabled={!isEditing}
                  className={cn(
                    "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400",
                    validationErrors.fullName && "border-red-400",
                    !isEditing && "bg-slate-800/30"
                  )}
                  placeholder="Nhập họ tên"
                />
                {validationErrors.fullName && (
                  <p className="text-red-400 text-sm mt-1 w-full">
                    {validationErrors.fullName}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Label className="text-slate-300 w-32 text-right">Email</Label>
                <Input
                  value={editedUser?.email || ""}
                  onChange={(e) => onInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className={cn(
                    "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400",
                    validationErrors.email && "border-red-400",
                    !isEditing && "bg-slate-800/30"
                  )}
                  placeholder="Nhập email"
                />
                {validationErrors.email && (
                  <p className="text-red-400 text-sm mt-1 w-full">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Label className="text-slate-300 text-right w-32">
                  Số điện thoại
                </Label>
                <Input
                  value={editedUser?.phone || ""}
                  onChange={(e) => onInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  className={cn(
                    "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400",
                    validationErrors.phone && "border-red-400",
                    !isEditing && "bg-slate-800/30"
                  )}
                  placeholder="Nhập số điện thoại"
                />
                {validationErrors.phone && (
                  <p className="text-red-400 text-sm mt-1 w-full">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              <div className="flex items-start space-x-4">
                <Label className="text-slate-300 text-right w-32 pt-2">
                  Giới tính
                </Label>
                <RadioGroup
                  value={editedUser?.gender ?? undefined}
                  onValueChange={(value) => {
                    if (!isEditing) return;
                    onInputChange("gender", value);
                  }}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="male"
                      id="male"
                      disabled={!isEditing}
                    />
                    <Label htmlFor="male" className="text-gray-700">
                      Nam
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="female"
                      id="female"
                      disabled={!isEditing}
                    />
                    <Label htmlFor="female" className="text-gray-700">
                      Nữ
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="other"
                      id="other"
                      disabled={!isEditing}
                    />
                    <Label htmlFor="other" className="text-gray-700">
                      Khác
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-4">
                <Label className="text-slate-300 text-right w-32">
                  Ngày sinh
                </Label>
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
                    className="profile-date-picker"
                    classNames={{ root: "profile-date-picker-root" }}
                  />
                </ConfigProvider>
              </div>

              <div className="flex items-center space-x-4">
                <Label className="text-slate-300 text-right w-32">
                  Địa chỉ
                </Label>
                <Textarea
                  value={editedUser?.address || ""}
                  onChange={(e) => onInputChange("address", e.target.value)}
                  disabled={!isEditing}
                  className={cn(
                    "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400",
                    !isEditing && "bg-slate-800/30"
                  )}
                  placeholder="Nhập địa chỉ"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:block absolute left-2/3 top-1/2 transform -translate-y-1/2 w-px h-48 bg-gray-300/20" />

        <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            <Avatar className="w-24 h-24">
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
            <div
              onClick={onAvatarChange}
              className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-5 h-5 text-white" />
                <span className="text-xs text-white">Thay đổi</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="text-gray-700 border-gray-300 hover:bg-white/80"
            onClick={onAvatarChange}
          >
            Chọn ảnh
          </Button>

          <div className="text-center text-sm text-gray-500 mt-2">
            <p>Dung lượng file tối đa 1 MB</p>
            <p>Định dạng: .JPEG, .PNG</p>
          </div>
        </div>
      </Card>
    </TabsContent>
  );
}
