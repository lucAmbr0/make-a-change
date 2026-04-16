"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    signal,
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to fetch current user (${response.status})`);
  }

  const data = (await response.json()) as PublicUser;
  return data;
}

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
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
        setUser(currentUser);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }
        console.error("Failed to fetch current user", error);
        setUser(null);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      abortController.abort();
    };
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