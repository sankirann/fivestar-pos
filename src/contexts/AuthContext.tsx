import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Permission, SessionUser } from '../types';
import { authStorage } from '../utils/authStorage';

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Auto-creates Admin/Admin123 on first launch only; never overwrites
      // an existing admin account or any other stored data.
      await authStorage.ensureDefaultAdmin();
      setUser(authStorage.getSession());
      setLoading(false);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const found = await authStorage.verifyLogin(username, password);
    if (!found) {
      return { ok: false, error: 'Invalid username or password' };
    }
    authStorage.setSession(found);
    setUser(authStorage.getSession());
    return { ok: true };
  };

  const logout = () => {
    authStorage.clearSession();
    setUser(null);
  };

  const refreshUser = () => {
    setUser(authStorage.getSession());
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.enabled) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
