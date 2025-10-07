// Danh sách mã cổ phiếu phổ biến cho gợi ý tìm kiếm
export interface StockSuggestion {
  code: string;
  name: string;
  sector: string;
}

export const stockSuggestions: StockSuggestion[] = [
  // Ngân hàng
  { code: "VCB", name: "Vietcombank", sector: "Ngân hàng" },
  { code: "CTG", name: "VietinBank", sector: "Ngân hàng" },
  { code: "TCB", name: "Techcombank", sector: "Ngân hàng" },
  { code: "BID", name: "BIDV", sector: "Ngân hàng" },
  { code: "ACB", name: "ACB", sector: "Ngân hàng" },
  { code: "TPB", name: "TPBank", sector: "Ngân hàng" },
  { code: "MBB", name: "MB Bank", sector: "Ngân hàng" },
  { code: "STB", name: "Sacombank", sector: "Ngân hàng" },
  { code: "VPB", name: "VPBank", sector: "Ngân hàng" },
  { code: "SHB", name: "SHB", sector: "Ngân hàng" },

  // Bất động sản
  { code: "VHM", name: "Vinhomes", sector: "Bất động sản" },
  { code: "VIC", name: "Vingroup", sector: "Bất động sản" },
  { code: "BCM", name: "Becamex IDC", sector: "Bất động sản" },
  { code: "DXG", name: "Đất Xanh Group", sector: "Bất động sản" },
  { code: "NLG", name: "Nam Long", sector: "Bất động sản" },
  { code: "KDH", name: "Khang Điền", sector: "Bất động sản" },
  { code: "PDR", name: "Phát Đạt", sector: "Bất động sản" },

  // Thép và Kim loại
  { code: "HPG", name: "Hoa Phat Group", sector: "Thép" },
  { code: "HSG", name: "Hoa Sen Group", sector: "Thép" },
  { code: "NKG", name: "Nam Kim Steel", sector: "Thép" },
  { code: "TLH", name: "Thép Tiến Lên", sector: "Thép" },

  // Dầu khí
  { code: "GAS", name: "PetroVietnam Gas", sector: "Dầu khí" },
  { code: "PLX", name: "Petrolimex", sector: "Dầu khí" },
  { code: "POW", name: "PetroVietnam Power", sector: "Điện" },
  { code: "BSR", name: "Binh Son Refining", sector: "Dầu khí" },

  // Bán lẻ và Tiêu dùng
  { code: "MWG", name: "Mobile World", sector: "Bán lẻ" },
  { code: "FRT", name: "FPT Retail", sector: "Bán lẻ" },
  { code: "PNJ", name: "PNJ", sector: "Trang sức" },
  { code: "MSN", name: "Masan Group", sector: "Tiêu dùng" },
  { code: "VNM", name: "Vinamilk", sector: "Thực phẩm" },
  { code: "SAB", name: "Sabeco", sector: "Bia rượu" },

  // Công nghệ
  { code: "FPT", name: "FPT Corporation", sector: "Công nghệ" },
  { code: "CMG", name: "CMC", sector: "Công nghệ" },
  { code: "ELC", name: "Elcom", sector: "Công nghệ" },

  // Hàng không và Du lịch
  { code: "HVN", name: "Vietnam Airlines", sector: "Hàng không" },
  { code: "VJC", name: "VietJet Air", sector: "Hàng không" },

  // Dệt may
  { code: "VGT", name: "Viglacera", sector: "Vật liệu xây dựng" },
  { code: "GEX", name: "Gelex", sector: "Đầu tư" },
  { code: "VRE", name: "Vincom Retail", sector: "Bán lẻ" },

  // Nông nghiệp
  { code: "HAG", name: "HAGL Agrico", sector: "Nông nghiệp" },
  { code: "SBT", name: "Sao Bắc", sector: "Thủy sản" },

  // Vận tải
  { code: "GMD", name: "Gemadept", sector: "Vận tải biển" },
  { code: "HAH", name: "Hàng không Hải Âu", sector: "Vận tải" },

  // Chứng khoán
  { code: "SSI", name: "SSI Securities", sector: "Chứng khoán" },
  { code: "VCI", name: "Vietcap", sector: "Chứng khoán" },
  { code: "HCM", name: "HCMC Securities", sector: "Chứng khoán" },
  { code: "VND", name: "VnDirect", sector: "Chứng khoán" },

  // Điện lực
  { code: "REE", name: "REE Corporation", sector: "Điện" },
  { code: "PC1", name: "PC1", sector: "Xây dựng điện" },

  // Y tế
  { code: "DHG", name: "Dược Hậu Giang", sector: "Dược phẩm" },
  { code: "IMP", name: "Imexpharm", sector: "Dược phẩm" },

  // Khác
  { code: "VCG", name: "Viettel Construction", sector: "Xây dựng" },
  { code: "CTD", name: "Coteccons", sector: "Xây dựng" },
  { code: "HDB", name: "HDBank", sector: "Ngân hàng" },
  { code: "LPB", name: "LienVietPostBank", sector: "Ngân hàng" },
  { code: "OCB", name: "Orient Commercial Bank", sector: "Ngân hàng" },
];

// Hàm tìm kiếm gợi ý
export const searchStockSuggestions = (query: string, limit: number = 6): StockSuggestion[] => {
  if (!query || query.length < 1) return [];

  const searchTerm = query.toLowerCase().trim();

  // Tìm kiếm theo code và name
  const results = stockSuggestions.filter(stock => {
    const codeMatch = stock.code.toLowerCase().includes(searchTerm);
    const nameMatch = stock.name.toLowerCase().includes(searchTerm);
    return codeMatch || nameMatch;
  });

  // Sắp xếp: ưu tiên code match trước, sau đó name match
  const sorted = results.sort((a, b) => {
    const aCodeMatch = a.code.toLowerCase().startsWith(searchTerm);
    const bCodeMatch = b.code.toLowerCase().startsWith(searchTerm);

    if (aCodeMatch && !bCodeMatch) return -1;
    if (!aCodeMatch && bCodeMatch) return 1;

    return a.code.localeCompare(b.code);
  });

  return sorted.slice(0, limit);
};