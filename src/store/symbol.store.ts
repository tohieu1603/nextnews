"use client";

import { create } from "zustand";

interface SymbolState {
  symbolMap: Record<string, string>; // name -> id
  setSymbolMap: (list: { id: string; name: string }[]) => void;
}

export const useSymbolStore = create<SymbolState>()((set) => ({
  symbolMap: {},
  setSymbolMap: (list) =>
    set({
      symbolMap: Object.fromEntries(
        (Array.isArray(list) ? list : [])
          .filter((item) => item && item.name != null && item.id != null)
          .map((s) => [
            String(s.name).trim().toUpperCase(),
            String(s.id),
          ])
      ),
    }),
}));
