// 🔧 UPDATED: src/hooks/useMinimumLoading.ts
// Longer display times so users can enjoy the animations!

import { useState, useEffect } from 'react';

export function useMinimumLoading(minimumMs: number = 3000) {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowContent, setShouldShowContent] = useState(false);

  useEffect(() => {
    // Always show loading for at least the minimum duration
    const timer = setTimeout(() => {
      setShouldShowContent(true);
      setIsLoading(false);
    }, minimumMs);

    return () => clearTimeout(timer);
  }, [minimumMs]);

  return {
    isLoading,
    shouldShowContent,
    // For compatibility with existing code
    shouldHideContent: !shouldShowContent,
    startLoading: () => {}, // No-op since we auto-start
    finishLoading: () => {} // No-op since we auto-finish
  };
}

// 🎨 Updated pre-configured hooks with faster, more responsive times
export function useDashboardLoading() {
  return useMinimumLoading(1500); // 1.5 seconds - quick but smooth
}

export function useResumeLoading() {
  return useMinimumLoading(1200); // 1.2 seconds - fast response
}

export function useJobDescriptionLoading() {
  return useMinimumLoading(1000); // 1 second - snappy
}

export function useFinalizeLoading() {
  return useMinimumLoading(1200); // 1.2 seconds - quick transition
}