import React from "react";
import { Crown, Leaf, Shield, Target, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShareholderStructure } from "../sections/ShareholderStructure";
import { Subsidiaries } from "../sections/Subsidiaries";
import { calculateMarketPosition } from "@/components/helpers/detailedAnalysisHelpers";

interface Officer {
  officer_name: string;
  position_short_name: string;
  officer_position: string;
  officer_owner_percent: number;
  updated_at: string;
}

interface StockData {
  currentPrice: string;
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

interface Subsidiary {
  company_name: string;
  sub_own_percent: number;
  status?: string;
  share_holder?: string;
}

interface Shareholder {
  share_holder: string;
  share_own_percent: number;
}

interface CompanyData {
  symbolData?: {
    company?: {
      officers?: Officer[];
      subsidiaries?: Subsidiary[];
      shareholders?: Shareholder[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface GovernanceProps {
  stock: StockData;
  data: CompanyData;
}

export default function GovernanceTab({ stock, data }: GovernanceProps) {
  return (
    <div className="space-y-6 mt-0">
      {/* Shareholder Structure - Full Width */}
      <ShareholderStructure
        shareholderData={stock.detailedInfo.shareholderStructure}
        data={data}
      />

      {/* Management Team - Full Width Grid */}
      <Card className="bg-slate-800/60 border border-blue-400/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Ban lãnh đạo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.symbolData?.company?.officers?.map(
              (officer: Officer, index: number) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {officer.officer_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm">
                        {officer.officer_name}
                      </h4>
                      <div className="text-xs text-orange-400">
                        {officer.position_short_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>Chức vụ: {officer.officer_position}</div>
                    <div>Tỷ lệ sở hữu: {officer.officer_owner_percent}%</div>
                    <div>
                      Cập nhật:{" "}
                      {new Date(officer.updated_at).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subsidiaries - Full Width */}
      <Subsidiaries data={data} />

      {/* ESG & Risk - Full Width Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/60 border border-blue-400/30">
          <CardContent className="p-4">
            <h3 className="font-bold text-cyan-400 mb-3 flex items-center gap-2 text-sm">
              <Leaf className="w-4 h-4" />
              ESG Rating
            </h3>
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-400 mb-2">
                {stock.detailedInfo.esgInfo.overallRating}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-slate-400">E</div>
                  <div className="font-bold text-emerald-400">
                    {stock.detailedInfo.esgInfo.environmentalScore}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">S</div>
                  <div className="font-bold text-emerald-400">
                    {stock.detailedInfo.esgInfo.socialScore}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">G</div>
                  <div className="font-bold text-emerald-400">
                    {stock.detailedInfo.esgInfo.governanceScore}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border border-blue-400/30">
          <CardContent className="p-4">
            <h3 className="font-bold text-cyan-400 mb-3 flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Credit Risk
            </h3>
            <div className="space-y-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 text-xs w-full justify-center">
                {stock.detailedInfo.riskAssessment.creditRisk.level}
              </Badge>
              <div className="text-xs text-slate-400">
                NPL: {stock.detailedInfo.riskAssessment.creditRisk.nplRatio}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border border-blue-400/30">
          <CardContent className="p-4">
            <h3 className="font-bold text-cyan-400 mb-3 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              Market Risk
            </h3>
            <div className="space-y-2">
              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs w-full justify-center">
                {stock.detailedInfo.riskAssessment.marketRisk.level}
              </Badge>
              <div className="text-xs text-slate-400">
                VaR: {stock.detailedInfo.riskAssessment.marketRisk.var}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border border-blue-400/30">
          <CardContent className="p-4">
            <h3 className="font-bold text-cyan-400 mb-3 flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4" />
              52W Range
            </h3>
            <div className="space-y-2">
              <div className="relative">
                <div className="h-2 bg-gradient-to-r from-red-400/30 via-yellow-400/30 to-emerald-400/30 rounded-full"></div>
                <div
                  className="absolute top-0 h-2 w-1 bg-white rounded-full transform -translate-x-1/2"
                  style={{
                    left: `${calculateMarketPosition(
                      stock.currentPrice,
                      stock.additionalMetrics.week52Low,
                      stock.additionalMetrics.week52High
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{stock.additionalMetrics.week52Low}</span>
                <span>{stock.additionalMetrics.week52High}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
