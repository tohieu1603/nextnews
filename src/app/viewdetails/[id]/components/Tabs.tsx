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
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 bg-slate-800/60 border border-blue-400/30 p-1">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-blue-500/20 text-white data-[state=active]:text-cyan-400 text-sm font-bold py-2"
        >
          <BarChart className="w-4 h-4 mr-1" />
          Tổng quan
        </TabsTrigger>
        <TabsTrigger
          value="financials"
          className="data-[state=active]:bg-blue-500/20 text-white data-[state=active]:text-cyan-400 text-sm font-bold py-2"
        >
          <DollarSign className="w-4 h-4 mr-1" />
          Tài chính
        </TabsTrigger>
        <TabsTrigger
          value="governance"
          className="data-[state=active]:bg-blue-500/20 text-white data-[state=active]:text-cyan-400 text-sm font-bold py-2"
        >
          <Users className="w-4 h-4 mr-1" />
          Quản trị
        </TabsTrigger>
        <TabsTrigger
          value="analysis"
          className="data-[state=active]:bg-blue-500/20 text-white data-[state=active]:text-cyan-400 text-sm font-bold py-2"
        >
          <TrendingUpIcon className="w-4 h-4 mr-1" />
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
