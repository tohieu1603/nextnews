import {
  Building,
  ChartColumnBig,
  ChartLine,
  Clock,
  Eye,
  Flame,
  Scale,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsColumnsProps {
  onViewNews: (articleId: number) => void;
}

const newsCategories = [
  {
    title: "Thị trường",
    icon: <ChartColumnBig className="w-6 h-6" />,
    color: "text-blue-600",
    articles: [
      {
        id: 5,
        title: "Cổ phiếu ACB tăng trần trong phiên sáng",
        time: "1 giờ trước",
        views: "3.2K",
      },
      {
        id: 6,
        title: "Khối lượng giao dịch HSX đạt kỷ lục mới",
        time: "2 giờ trước",
        views: "2.8K",
      },
      {
        id: 7,
        title: "Dòng tiền ngoại đổ mạnh vào công nghệ",
        time: "3 giờ trước",
        views: "1.9K",
      },
      {
        id: 8,
        title: "VN30 dẫn dắt thị trường tăng điểm",
        time: "4 giờ trước",
        views: "1.5K",
      },
    ],
  },
  {
    title: "Doanh nghiệp",
    icon: <Building className="w-6 h-6" />,
    color: "text-green-600",
    articles: [
      {
        id: 9,
        title: "FPT ký hợp đồng 500 triệu USD với đối tác Mỹ",
        time: "30 phút trước",
        views: "4.1K",
      },
      {
        id: 10,
        title: "Viettel Post IPO thu về 2,000 tỷ đồng",
        time: "1 giờ trước",
        views: "3.5K",
      },
      {
        id: 11,
        title: "Masan mua lại 25% cổ phần Techcombank",
        time: "2 giờ trước",
        views: "2.7K",
      },
      {
        id: 12,
        title: "Vingroup khởi động dự án smart city 5 tỷ USD",
        time: "3 giờ trước",
        views: "2.1K",
      },
    ],
  },
  {
    title: "Chính sách",
    icon: <Scale className="w-6 h-6" />,
    color: "text-purple-600",
    articles: [
      {
        id: 13,
        title: "Nghị định mới về thuế chứng khoán có hiệu lực",
        time: "1 giờ trước",
        views: "5.8K",
      },
      {
        id: 14,
        title: "SBV tăng room tín dụng lên 14% cho 2025",
        time: "2 giờ trước",
        views: "4.2K",
      },
      {
        id: 15,
        title: "Giảm thuế VAT xuống 8% từ quý 2",
        time: "4 giờ trước",
        views: "3.1K",
      },
      {
        id: 16,
        title: "Chính sách hỗ trợ startup công nghệ mới",
        time: "5 giờ trước",
        views: "2.3K",
      },
    ],
  },
];

export function NewsColumns({ onViewNews }: NewsColumnsProps) {
  return (
    <div>
    </div>
  );
}
