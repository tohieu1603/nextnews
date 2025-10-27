import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, DollarSign, Users, TrendingUpIcon } from "lucide-react";
import OverviewTab from "./tabs/OverView";
import FinancialsTab from "./tabs/Financials";
import GovernanceTab from "./tabs/Governace";
import AnalysisTab from "./tabs/AnalysisTab";

interface StockData {
  symbol: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  detailedInfo: {
    shareholderStructure: unknown;
    subsidiaries: unknown;
    esgInfo: {
      overallRating: string;
      environmentalScore: string | number;
      socialScore: string | number;
      governanceScore: string | number;
    };
    riskAssessment: {
      creditRisk: {
        level: string;
        nplRatio: string;
      };
      marketRisk: {
        level: string;
        var: string;
      };
    };
    [key: string]: unknown;
  };
  additionalMetrics: {
    week52Low: string;
    week52High: string;
  };
  [key: string]: unknown;
}

interface TabsDetailProps {
  stock: StockData | null;
  data: Record<string, unknown>;
  isPositive: boolean;
}

export default function TabsDetail({
  stock,
  data,
  isPositive,
}: TabsDetailProps) {
  // Provide fallback stock data if null
  const stockData: StockData = stock || {
    symbol: 'N/A',
    currentPrice: '0',
    change: '0',
    changePercent: '0',
    detailedInfo: {
      shareholderStructure: null,
      subsidiaries: null,
      esgInfo: {
        overallRating: 'N/A',
        environmentalScore: 0,
        socialScore: 0,
        governanceScore: 0,
      },
      riskAssessment: {
        creditRisk: {
          level: 'N/A',
          nplRatio: '0',
        },
        marketRisk: {
          level: 'N/A',
          var: '0',
        },
      },
    },
    additionalMetrics: {
      week52Low: '0',
      week52High: '0',
    },
  };

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 p-1 shadow-lg shadow-cyan-500/15 backdrop-blur-md">
        <TabsTrigger
          value="overview"
          className="group relative flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-slate-300 transition-all duration-200 hover:bg-slate-800/50 hover:text-cyan-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white data-[state=active]:shadow-inner data-[state=active]:shadow-cyan-500/30"
        >
          <BarChart className="w-4 h-4 mr-1 transition-colors duration-200 group-data-[state=active]:text-white" />
          Tổng quan
        </TabsTrigger>
        <TabsTrigger
          value="financials"
          className="group relative flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-slate-300 transition-all duration-200 hover:bg-slate-800/50 hover:text-cyan-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white data-[state=active]:shadow-inner data-[state=active]:shadow-cyan-500/30"
        >
          <DollarSign className="w-4 h-4 mr-1 transition-colors duration-200 group-data-[state=active]:text-white" />
          Tài chính
        </TabsTrigger>
        <TabsTrigger
          value="governance"
          className="group relative flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-slate-300 transition-all duration-200 hover:bg-slate-800/50 hover:text-cyan-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white data-[state=active]:shadow-inner data-[state=active]:shadow-cyan-500/30"
        >
          <Users className="w-4 h-4 mr-1 transition-colors duration-200 group-data-[state=active]:text-white" />
          Quản trị
        </TabsTrigger>
        <TabsTrigger
          value="analysis"
          className="group relative flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-slate-300 transition-all duration-200 hover:bg-slate-800/50 hover:text-cyan-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white data-[state=active]:shadow-inner data-[state=active]:shadow-cyan-500/30"
        >
          <TrendingUpIcon className="w-4 h-4 mr-1 transition-colors duration-200 group-data-[state=active]:text-white" />
          Phân tích
        </TabsTrigger>
      </TabsList>

      {/* Full Width Content */}
      <div className="w-full">
        <TabsContent value="overview">
          <OverviewTab stock={stockData} data={data} isPositive={isPositive} />
        </TabsContent>

        <TabsContent value="financials">
          <FinancialsTab data={data} />
        </TabsContent>

        <TabsContent value="governance">
          <GovernanceTab stock={stockData} data={data} />
        </TabsContent>

        <TabsContent value="analysis">
          <AnalysisTab data={data} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
