"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SearchResultsPage } from "../viewdetails/[id]/components/tabs/SearchResultsPage";

const loadingFallback = <p>Loading search results...</p>;

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const handleBack = () => {
    router.push("/");
  };

  const handleDetailedAnalysis = (stockId: string) => {
    router.push(`/viewdetails/${stockId}`);
  };

  return (
    <SearchResultsPage
      searchQuery={query}
      onBack={handleBack}
      onDetailedAnalysis={handleDetailedAnalysis}
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={loadingFallback}>
      <SearchPageContent />
    </Suspense>
  );
}
