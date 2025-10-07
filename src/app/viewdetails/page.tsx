"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/layouts/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { getSymbolData } from "@/services/api";

// Define the SymbolByNameData type
type SymbolByNameData = {
  id: string;
  code: string;
  name: string;
};

export default function DeepAnalysisIndexPage() {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SymbolByNameData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const data = await getSymbolData(""); // TODO: Replace "" with the appropriate symbol or logic to fetch all symbols if supported
        setData(data);
      } catch (err) {
        setError("Không lấy được dữ liệu symbol");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchSymbols();
    // No return value here (void)
  }, []);
  return (
    <div className="min-h-screen mt-24">
      <div className="pt-16 md:pt-28">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Breadcrumb for this page */}
          <Breadcrumb />

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-cyan-400">
              PHÂN TÍCH CHUYÊN SÂU
            </h1>
            <p className="text-slate-400 text-sm">
              Chọn mã cổ phiếu để xem phân tích chi tiết
            </p>
          </div>

          {/* Quick links (placeholder) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(data) &&
              data.map((item: SymbolByNameData, index: number) => (
                <Link key={item.code} href={`/viewdetails/${item.id}`}>
                  <Card className="bg-slate-800/60 border border-blue-400/30 hover:border-cyan-400/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">
                          {item.name}
                        </div>
                        {/* <div className="text-slate-400 text-sm">{item.exchange}</div> */}
                      </div>
                      <span className="text-cyan-400 text-sm">
                        Xem chi tiết →
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
