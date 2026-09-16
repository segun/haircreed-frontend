import { useEffect, useRef, useState } from "react";

export const useApiQuery = <T>(
  queryKey: string,
  queryFn: (signal: AbortSignal) => Promise<T>,
  enabled = true,
) => {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    queryFnRef.current(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((queryError: unknown) => {
        if (!controller.signal.aborted) {
          setError(queryError instanceof Error ? queryError : new Error("Request failed"));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [enabled, queryKey, refreshIndex]);

  return {
    data,
    error,
    isLoading,
    refetch: () => setRefreshIndex((current) => current + 1),
  };
};