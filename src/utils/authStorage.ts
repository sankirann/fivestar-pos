import { AppUser, Permission, RestaurantSettings, SessionUser } from '../types';
import { ALL_PERMISSIONS, MANAGER_ASSIGNABLE_PERMISSIONS } from './permissions';

const USERS_KEY = 'fivestar_users';
const SESSION_KEY = 'fivestar_session';
const SETTINGS_KEY = 'fivestar_restaurant_settings';

const DEFAULT_ADMIN_USERNAME = 'Admin';
const DEFAULT_ADMIN_PASSWORD = 'Admin123';

async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Extremely unlikely fallback for non-secure-context environments.
  return btoa(unescape(encodeURIComponent(password)));
}

function toSessionUser(user: AppUser): SessionUser {
  const { passwordHash, ...safe } = user;
  return safe;
}

export const authStorage = {
  // ---------- Users ----------
  getUsers(): AppUser[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users: AppUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Creates the default Admin/Admin123 account on first launch only.
  // Never overwrites an existing admin account.
  async ensureDefaultAdmin() {
    const users = authStorage.getUsers();
    const hasAdmin = users.some(u => u.role === 'admin');
    if (hasAdmin) return;

    const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
    const admin: AppUser = {
      id: 'admin-1',
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash,
      role: 'admin',
      permissions: ALL_PERMISSIONS,
      enabled: true,
      createdAt: new Date().toISOString()
    };
    authStorage.saveUsers([admin, ...users]);
  },

  async verifyLogin(username: string, password: string): Promise<AppUser | null> {
    const users = authStorage.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user || !user.enabled) return null;
    const hash = await hashPassword(password);
    return hash === user.passwordHash ? user : null;
  },

  usernameExists(username: string, excludeId?: string): boolean {
    return authStorage
      .getUsers()
      .some(u => u.id !== excludeId && u.username.toLowerCase() === username.trim().toLowerCase());
  },

  async createManager(username: string, password: string, permissions: Permission[]): Promise<AppUser> {
    const trimmed = username.trim();
    if (!trimmed) throw new Error('Username is required');
    if (authStorage.usernameExists(trimmed)) throw new Error('Username already exists');
    if (!password || password.length < 4) throw new Error('Password must be at least 4 characters');

    const passwordHash = await hashPassword(password);
    const manager: AppUser = {
      id: `mgr-${Date.now()}`,
      username: trimmed,
      passwordHash,
      role: 'manager',
      permissions: permissions.filter(p => MANAGER_ASSIGNABLE_PERMISSIONS.includes(p)),
      enabled: true,
      createdAt: new Date().toISOString()
    };
    authStorage.saveUsers([...authStorage.getUsers(), manager]);
    return manager;
  },

  updateManager(id: string, updates: { username?: string; permissions?: Permission[]; enabled?: boolean }): AppUser[] {
    const users = authStorage.getUsers();
    const updated = users.map(u => {
      if (u.id !== id || u.role !== 'manager') return u;
      return {
        ...u,
        username: updates.username !== undefined ? updates.username.trim() : u.username,
        permissions:
          updates.permissions !== undefined
            ? updates.permissions.filter(p => MANAGER_ASSIGNABLE_PERMISSIONS.includes(p))
            : u.permissions,
        enabled: updates.enabled !== undefined ? updates.enabled : u.enabled
      };
    });
    authStorage.saveUsers(updated);
    return updated;
  },

  async resetManagerPassword(id: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 4) throw new Error('Password must be at least 4 characters');
    const passwordHash = await hashPassword(newPassword);
    const updated = authStorage.getUsers().map(u => (u.id === id && u.role === 'manager' ? { ...u, passwordHash } : u));
    authStorage.saveUsers(updated);
  },

  deleteManager(id: string): AppUser[] {
    const updated = authStorage.getUsers().filter(u => !(u.id === id && u.role === 'manager'));
    authStorage.saveUsers(updated);
    return updated;
  },

  // Admin changes their own username/password from Security Settings.
  // currentPassword must be verified by the caller before invoking this.
  async updateAdminCredentials(id: string, updates: { username?: string; password?: string }): Promise<AppUser> {
    const users = authStorage.getUsers();
    const target = users.find(u => u.id === id && u.role === 'admin');
    if (!target) throw new Error('Admin account not found');

    const nextUsername = updates.username !== undefined ? updates.username.trim() : target.username;
    if (!nextUsername) throw new Error('Username is required');
    if (authStorage.usernameExists(nextUsername, id)) throw new Error('Username already exists');

    const nextHash = updates.password ? await hashPassword(updates.password) : target.passwordHash;

    const updatedUsers = users.map(u => (u.id === id ? { ...u, username: nextUsername, passwordHash: nextHash } : u));
    authStorage.saveUsers(updatedUsers);

    const updatedAdmin = updatedUsers.find(u => u.id === id)!;

    // Keep the active session in sync if this admin is currently logged in.
    const session = authStorage.getSession();
    if (session && session.id === id) {
      authStorage.setSession(toSessionUser(updatedAdmin));
    }

    return updatedAdmin;
  },

  // ---------- Session ----------
  getSession(): SessionUser | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  setSession(user: AppUser | SessionUser) {
    const safe = 'passwordHash' in user ? toSessionUser(user as AppUser) : user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  // ---------- Restaurant Settings ----------
  getSettings(): RestaurantSettings {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) return JSON.parse(data);
    return {
      restaurantName: 'Five Star Chicken',
      ownerName: '',
      phone: '',
      address: '',
      logo: ''
    };
  },

  saveSettings(settings: RestaurantSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
