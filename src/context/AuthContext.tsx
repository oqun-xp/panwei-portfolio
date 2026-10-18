import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { api, clearToken, getToken, isTokenValid, setToken } from '../api/client';
import type { AuthUser } from '../types';

interface AuthContextValue {
  token: string;
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }
      if (!isTokenValid(token)) {
        clearToken();
        setTokenState('');
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await api.verifyToken();
        if (!cancelled) setUser(result.user);
      } catch (error) {
        if (!cancelled) {
          clearToken();
          setTokenState('');
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await api.login(username, password);
    setToken(result.token);
    setTokenState(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState('');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token) && isTokenValid(token),
      login,
      logout
    }),
    [token, user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return context;
}
