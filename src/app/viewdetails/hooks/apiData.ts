import { getSymbolData as apiGetSymbolData  } from "@/services/api";
import { useEffect, useState, useCallback } from "react";

interface SymbolData {
  [key: string]: unknown;
}

export const useApiData = (symbol: string = "AAPL") => {
  const [data, setData] = useState<SymbolData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGetSymbolData(symbol);
      setData(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    let active = true;
    // Wrap to avoid updating state if unmounted
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiGetSymbolData(symbol);
        if (active) setData(response);
      } catch (err: unknown) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [symbol]);

  return { data, loading, error,fetchData };
};


