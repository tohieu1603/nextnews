import { stockDatabase } from "../../constants/stockDatabase";

export const getStockAnalysis = (code: string) => {
  return stockDatabase[code as keyof typeof stockDatabase] || stockDatabase.VSC;
};

export const calculateMarketPosition = (currentPrice: string, week52Low: string, week52High: string) => {
  const current = parseFloat(currentPrice?.replace(/,/g, ''));
  const low = parseFloat(week52Low?.replace(/,/g, ''));
  const high = parseFloat(week52High?.replace(/,/g, ''));
  return ((current - low) / (high - low)) * 100;
};

export const getAnimatedValues = (stock: any) => {
  return {
    pe: (parseFloat(stock.pe) / 20) * 100,
    pb: (parseFloat(stock.pb) / 3) * 100,
    roe: parseFloat(stock.roe.replace('%', '')),
    beta: (parseFloat(stock.riskMetrics.beta) / 2) * 100,
    analystScore: ((stock.detailedInfo.analystConsensus.strongBuy * 5 + 
                   stock.detailedInfo.analystConsensus.buy * 4 + 
                   stock.detailedInfo.analystConsensus.hold * 3) / 
                  (stock.detailedInfo.analystConsensus.totalAnalysts * 5)) * 100
  };
};