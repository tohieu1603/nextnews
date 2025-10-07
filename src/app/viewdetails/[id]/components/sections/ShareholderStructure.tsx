import { Users } from "lucide-react";
import { Badge } from "@/components/ui/bagde";
import { Progress } from "@/components/ui/progress";

interface ShareholderStructureProps {
  shareholderData: any;
  data?: any;
}

export function ShareholderStructure({
  shareholderData,
  data,
}: ShareholderStructureProps) {
  const largest = data?.symbolData?.company?.shareholders?.[0];
  const largest1 = data?.symbolData?.company?.shareholders?.[1];
  const largest2 = data?.symbolData?.company?.shareholders?.[2];
  const largest3 = data?.symbolData?.company?.shareholders?.[3];
  const largest4 = data?.symbolData?.company?.shareholders?.[4];
  const largest5 = data?.symbolData?.company?.shareholders?.[5];
  const largest6 = data?.symbolData?.company?.shareholders?.[6];
  //const pct = largest ? (largest.share_own_percent * 100).toFixed(2) : null;
  const pct = largest ? (largest.share_own_percent * 100).toFixed(2) : "0.00";
  const pct1 = largest1
    ? (largest1.share_own_percent * 100).toFixed(2)
    : "0.00";
  const pct2 = largest2
    ? (largest2.share_own_percent * 100).toFixed(2)
    : "0.00";
  const pct3 = largest3
    ? (largest3.share_own_percent * 100).toFixed(2)
    : "0.00";
  const pct4 = largest4
    ? (largest4.share_own_percent * 100).toFixed(2)
    : "0.00";
  const pct5 = largest5
    ? (largest5.share_own_percent * 100).toFixed(2)
    : "0.00";
  const pct6 = largest6
    ? (largest6.share_own_percent * 100).toFixed(2)
    : "0.00";

  return (
    <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl border-2 border-cyan-400/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-600/10 to-teal-600/10 rounded-full blur-2xl"></div>
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-6 flex items-center gap-3 text-cyan-300">
              <Users className="w-6 h-6" />
              Cơ cấu cổ đông
              <Badge
                variant="outline"
                className="text-cyan-400 border-cyan-400/50 bg-cyan-400/10"
              >
                Chi tiết
              </Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-lg font-semibold text-center text-slate-200 mb-4 tracking-wide">
                  Top cổ đông lớn
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-slate-700/30 to-cyan-500/20 rounded-xl border-2 border-cyan-400/30">
                  <div className="text-lg font-medium text-white mb-2">
                    {largest?.share_holder}
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {pct}%
                  </div>
                  <Progress
                    value={parseFloat(largest?.share_own_percent)}
                    className="h-1.5"
                  />
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-slate-700/30 to-cyan-500/20 rounded-xl border-2 border-cyan-400/30">
                  <div className="text-lg font-medium text-white mb-2">
                    {largest1?.share_holder}
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {pct1}%
                  </div>
                  <Progress
                    value={parseFloat(largest1?.share_own_percent)}
                    className="h-1.5"
                  />
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-slate-700/30 to-cyan-500/20 rounded-xl border-2 border-cyan-400/30">
                  <div className="text-lg font-medium text-white mb-2">
                    {largest2?.share_holder}
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {pct2}%
                  </div>
                  <Progress
                    value={parseFloat(largest2?.share_own_percent)}
                    className="h-1.5"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-slate-400 text-sm font-medium mb-3 block">
                  Cổ đông
                </span>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-cyan-400/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm mb-1">
                          {largest3?.share_holder}
                        </div>
                        <div className="text-pg font-bold text-cyan-400 mb-2">
                          {pct3}%
                        </div>
                        {/* <div className="text-xs text-slate-400">{largest3.share_own_percent}</div> */}
                      </div>
                      <div className="text-right">
                        {/* <div className="font-bold text-cyan-400">{largest4.share_holder}</div> */}
                        {/* <div className="text-xs text-slate-400">{largest4.share_own_percent}</div> */}
                      </div>
                    </div>
                    <Progress
                      value={parseFloat(largest3?.share_own_percent)}
                      className="h-1.5"
                    />
                  </div>

                  <div className="p-4 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-cyan-400/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm mb-1">
                          {largest4?.share_holder}
                        </div>
                        <div className="text-pg font-bold text-cyan-400 mb-2">
                          {pct4}%
                        </div>
                        {/* <div className="text-xs text-slate-400">{largest3.share_own_percent}</div> */}
                      </div>
                      <div className="text-right">
                        {/* <div className="font-bold text-cyan-400">{largest4.share_holder}</div> */}
                        {/* <div className="text-xs text-slate-400">{largest4.share_own_percent}</div> */}
                      </div>
                    </div>
                    <Progress
                      value={parseFloat(largest4?.share_own_percent)}
                      className="h-1.5"
                    />
                  </div>

                  <div className="p-4 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-cyan-400/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm mb-1">
                          {largest5?.share_holder}
                        </div>
                        <div className="text-pg font-bold text-cyan-400 mb-2">
                          {pct5}%
                        </div>
                        {/* <div className="text-xs text-slate-400">{largest3.share_own_percent}</div> */}
                      </div>
                      <div className="text-right">
                        {/* <div className="font-bold text-cyan-400">{largest4.share_holder}</div> */}
                        {/* <div className="text-xs text-slate-400">{largest4.share_own_percent}</div> */}
                      </div>
                    </div>
                    <Progress
                      value={parseFloat(largest5?.share_own_percent)}
                      className="h-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
