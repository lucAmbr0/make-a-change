"use client";

import { useCallback, useState } from "react";
import { ApiClientError } from "./client";

export interface UseApiActionState<T> {
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  status: number | null;
  data: T | null;
}

export interface UseApiActionResult<TArgs extends unknown[], T>
  extends UseApiActionState<T> {
  run: (...args: TArgs) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Wraps an async function (typically an apiFetch call) with loading/error state.
 *
 * Errors are coerced to a user-facing string. ApiClientError exposes status +
 * code so callers can branch on 401, etc.
 *
 *   const submit = useApiAction(async (text: string) =>
 *     apiFetch(`/api/campaign/${id}/comments`, { method: "POST", body: { text } })
 *   );
 *   submit.run("hello");
 */
export function useApiAction<TArgs extends unknown[], T>(
  fn: (...args: TArgs) => Promise<T>,
  options: {
    onSuccess?: (value: T) => void;
    onError?: (err: unknown) => void;
  } = {},
): UseApiActionResult<TArgs, T> {
  const [state, setState] = useState<UseApiActionState<T>>({
    isLoading: false,
    error: null,
    errorCode: null,
    status: null,
    data: null,
  });

  const run = useCallback(
    async (...args: TArgs) => {
      setState((s) => ({ ...s, isLoading: true, error: null, errorCode: null }));
      try {
        const data = await fn(...args);
        setState({
          isLoading: false,
          error: null,
          errorCode: null,
          status: null,
          data,
        });
        options.onSuccess?.(data);
        return data;
      } catch (err) {
        const isApi = err instanceof ApiClientError;
        const message =
          err instanceof Error ? err.message : "Request failed";
        setState({
          isLoading: false,
          error: message,
          errorCode: isApi ? err.code : null,
          status: isApi ? err.status : null,
          data: null,
        });
        options.onError?.(err);
        return undefined;
      }
    },
    [fn, options],
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      errorCode: null,
      status: null,
      data: null,
    });
  }, []);

  return { ...state, run, reset };
}
