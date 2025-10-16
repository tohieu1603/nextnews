"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  ThumbsUp,
  Heart,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Header } from "@/components/layouts/Header";
import {
  articleData,
  relatedArticles,
  getCategoryColor,
  getTimeAgo,
} from "@/constants/newsData";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { getNameData } from "@/services/api";

// Define SymbolByNameData type (replace fields with actual structure if known)
type SymbolByNameData = {
  // Example fields, update as needed
  symbol: string;
  name: string;
  price: number;
  // Add other fields as required
};

interface NewsDetailPageProps {
  articleId: number;
  onBack: () => void;
  onViewDetails: (stockCode: string) => void;
}

export function NewsDetailPage({
  articleId,
  onBack,
  onViewDetails,
}: NewsDetailPageProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SymbolByNameData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const article = articleData[articleId as keyof typeof articleData];
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const response = await apiGetSymbolByNameData(slug);
  //       setData(response);
  //       console.log("Data fetchedffffffffffffff:", response);
  //     } catch (err: unknown) {
  //       const message = err instanceof Error ? err.message : "Unknown error";
  //       setError(message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, []);
  

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Button onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Bài viết không tồn tại hoặc đã bị xóa.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleShare = (platform: string) => {
    // Handle sharing logic here
    console.log(`Sharing to ${platform}`);
    setShowShareMenu(false);
  };
  
  console.log("Rendering article:", data);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button
            onClick={onBack}
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Trang chủ
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-blue-600">{article.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 truncate max-w-xs">
            {data?.[0]?.symbol || data?.[0]?.name || `#${articleId}`}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-sm">
              {/* Article Header */}
              <header className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <Badge
                    variant="outline"
                    className={`${getCategoryColor(article.category)}`}
                  >
                    {article.category}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {article.readTime}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {article.difficulty}
                  </Badge>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {article.title}
                </h1>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {article.summary}
                </p>

                {/* Article Meta */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-10 h-10">
                        <ImageWithFallback
                          src={article.author.avatar}
                          alt={article.author.name}
                          className="w-full h-full object-cover"
                        />
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {article.author.name}
                          </span>
                          {article.author.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {article.author.title}
                        </div>
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{getTimeAgo(article.publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{article.comments}</span>
                      </div>
                    </div>
                  </div>

                  {/* Social Share Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          isBookmarked ? "fill-blue-500 text-blue-500" : ""
                        }`}
                      />
                    </Button>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>

                      {showShareMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                          <button
                            onClick={() => handleShare("facebook")}
                            className="w-full px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Facebook className="w-4 h-4 text-blue-600" />
                            Facebook
                          </button>
                          <button
                            onClick={() => handleShare("twitter")}
                            className="w-full px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Twitter className="w-4 h-4 text-sky-600" />
                            Twitter
                          </button>
                          <button
                            onClick={() => handleShare("linkedin")}
                            className="w-full px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Linkedin className="w-4 h-4 text-blue-800" />
                            LinkedIn
                          </button>
                          <button
                            onClick={() => handleShare("copy")}
                            className="w-full px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Link
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {/* Featured Image */}
              <div className="px-6">
                <div className="relative">
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-4 right-4">
                    <Badge className="bg-black/70 text-white">
                      Ảnh minh họa
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Tags:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          if (["YTC", "TCB", "ACB", "HPG"].includes(tag)) {
                            onViewDetails(tag);
                          }
                        }}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sources */}
                {article.sources && article.sources.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Nguồn tham khảo:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {article.sources.map((source, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {source.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{article.likes} lượt thích</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        <span>{article.shares} lượt chia sẻ</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        <span>{article.bookmarks} lưu</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      SEO Score: {article.seoScore}/100
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Author Bio */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <ImageWithFallback
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-lg">
                        {article.author.name}
                      </h4>
                      {article.author.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-blue-600 mb-2">
                      {article.author.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {article.author.bio}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{article.author.articles} bài viết</span>
                      <span>•</span>
                      <span>{article.author.followers} người theo dõi</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Bình luận ({article.comments})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample Comments */}
                  <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        NV
                      </div>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          Nguyễn Văn A
                        </span>
                        <span className="text-xs text-gray-500">
                          2 giờ trước
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        Bài viết rất hay và chi tiết. Cảm ơn tác giả đã chia sẻ
                        thông tin hữu ích về thị trường.
                      </p>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6"
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          12
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6"
                        >
                          Trả lời
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <div className="w-full h-full bg-green-600 text-white flex items-center justify-center text-xs">
                        TH
                      </div>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Trần Hồng B</span>
                        <span className="text-xs text-gray-500">
                          1 giờ trước
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        Nhóm ngân hàng thực sự đang có momentum tốt. Đặc biệt
                        VSC và TCB đều có kết quả kinh doanh ấn tượng.
                      </p>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6"
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />8
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6"
                        >
                          Trả lời
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Xem thêm bình luận
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              {/* Stock Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Phân tích nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data?.map((item) => (
                    <div
                      key={item.symbol}
                      className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => onViewDetails(item.symbol)}
                    >
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">{item.price}</span>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onViewDetails("YTC")}
                  >
                    Xem phân tích chi tiết
                  </Button>
                </CardContent>
              </Card>

              {/* Related Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Bài viết liên quan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedArticles.map((related) => (
                    <div key={related.id} className="group cursor-pointer">
                      <div className="flex gap-3">
                        <ImageWithFallback
                          src={related.image}
                          alt={related.title}
                          className="w-16 h-16 object-cover rounded group-hover:opacity-80 transition-opacity"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {related.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {related.category}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <span>{related.time}</span>
                              <span>•</span>
                              <span>{related.views}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    Xem thêm tin tức
                  </Button>
                </CardContent>
              </Card>

              {/* Market Widget */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Thị trường hôm nay
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">VN-Index</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">1,278.45</div>
                      <div className="text-xs text-green-600">
                        +12.35 (+0.97%)
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">HNX-Index</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">234.12</div>
                      <div className="text-xs text-red-600">-1.87 (-0.79%)</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">UPCOM</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">89.45</div>
                      <div className="text-xs text-green-600">
                        +0.23 (+0.26%)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {error && <p className="text-red-500 mt-4">Lỗi: {error}</p>}
    </div>
  );
}

// async function apiGetSymbolByNameData(slug: string): Promise<SymbolByNameData[]> {
//   // Replace this mock with your actual API call logic
//   console.log('Fetching data for:', slug);
//   return getNameData(slug);
// }
