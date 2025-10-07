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
      symbolMap: Object.fromEntries(list.map((s) => [s.name, s.id])),
    }),
}));
