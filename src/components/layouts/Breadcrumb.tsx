"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABEL_MAP: Record<string, string> = {
  viewdetails: "Phân tích chuyên sâu",
  login: "Đăng nhập",
  auth: "Xác thực",
  callback: "Chuyển hướng",
  google: "Google",
  users: "Người dùng",
  settings: "Cài đặt",
};

function formatSegment(seg: string) {
  return LABEL_MAP[seg] || decodeURIComponent(seg).replace(/[-_]/g, " ");
}

export default function Breadcrumb() {
  const pathname = usePathname();
  if (!pathname || pathname === "/" || pathname.includes("/login")) return null; // Hide on homepage & login

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = formatSegment(seg);
    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-slate-800/40 border border-blue-400/20 rounded-md px-3 py-2">
          <ol className="flex items-center gap-2 text-sm md:text-base leading-none">
            <li>
              <Link href="/" className="text-cyan-400 hover:text-white font-medium">
                Trang chủ
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
                {i === crumbs.length - 1 ? (
                  <span className="text-white font-semibold">{c.label}</span>
                ) : (
                  <Link
                    href={c.href}
                    className="text-slate-300 hover:text-white font-medium"
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}
