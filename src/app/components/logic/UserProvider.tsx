"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, ApiClientError } from "@/lib/api/client";

export interface PublicUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  birth_date: string;
}

interface UserContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

async function fetchCurrentUser(signal?: AbortSignal): Promise<PublicUser | null> {
  try {
    return await apiFetch<PublicUser>("/api/auth/me", { signal });
  } catch (err) {
    if (err instanceof ApiClientError && (err.status === 401 || err.status === 403)) {
      return null;
    }
    throw err;
  }
}

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      setUser(await fetchCurrentUser());
    } catch (error) {
      console.error("Failed to fetch current user", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadUser() {
      setIsLoading(true);
      try {
        const currentUser = await fetchCurrentUser(abortController.signal);
        if (!abortController.signal.aborted) setUser(currentUser);
      } catch (error) {
        if (abortController.signal.aborted) return;
        console.error("Failed to fetch current user", error);
        setUser(null);
      } finally {
        if (!abortController.signal.aborted) setIsLoading(false);
      }
    }

    void loadUser();
    return () => abortController.abort();
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: user !== null, refreshUser }),
    [isLoading, refreshUser, user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
