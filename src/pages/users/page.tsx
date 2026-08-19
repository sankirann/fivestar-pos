import { useState, useEffect, FormEvent } from 'react';
import { AppUser, Permission } from '../../types';
import { authStorage } from '../../utils/authStorage';
import { MANAGER_ASSIGNABLE_PERMISSIONS, PERMISSION_META } from '../../utils/permissions';
import UserMenu from '../../components/UserMenu';

const UsersPage = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AppUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(authStorage.getUsers());
  };

  const managers = users.filter(u => u.role === 'manager');

  const handleToggleEnabled = (user: AppUser) => {
    authStorage.updateManager(user.id, { enabled: !user.enabled });
    loadUsers();
  };

  const handleDelete = (user: AppUser) => {
    const confirmed = window.confirm(`Delete Manager account "${user.username}"? This cannot be undone.`);
    if (confirmed) {
      authStorage.deleteManager(user.id);
      loadUsers();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">User Management</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">Create and manage Manager accounts</p>
            </div>
            <div className="shrink-0">
              <UserMenu />
            </div>
          </div>
          <div className="flex gap-2 md:gap-3 mt-3 md:mt-4 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-1 scrollbar-hide">
              <a
                href="/"
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Billing
              </a>
              <button
                onClick={() => setShowCreateModal(true)}
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base"
              >
                <i className="ri-user-add-line mr-2"></i>
                New Manager
              </button>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {managers.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <i className="ri-team-line text-5xl mb-3 block"></i>
              No Manager accounts yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {managers.map(manager => (
                <div
                  key={manager.id}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold uppercase">
                      {manager.username.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{manager.username}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            manager.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {manager.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {manager.permissions.length === 0
                          ? 'No permissions granted'
                          : manager.permissions.map(p => PERMISSION_META[p].label).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setEditingUser(manager)}
                      className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer text-sm whitespace-nowrap"
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => setResetPasswordUser(manager)}
                      className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer text-sm whitespace-nowrap"
                    >
                      <i className="ri-key-2-line mr-1"></i>
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleToggleEnabled(manager)}
                      className={`px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm whitespace-nowrap ${
                        manager.enabled
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      <i className={`${manager.enabled ? 'ri-lock-line' : 'ri-lock-unlock-line'} mr-1`}></i>
                      {manager.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(manager)}
                      className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors cursor-pointer text-sm whitespace-nowrap"
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateManagerModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadUsers();
          }}
        />
      )}

      {editingUser && (
        <EditManagerModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null);
            loadUsers();
          }}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal user={resetPasswordUser} onClose={() => setResetPasswordUser(null)} />
      )}
    </div>
  );
};

// ---------------- Create Manager Modal ----------------

const CreateManagerModal = ({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const togglePermission = (permission: Permission) => {
    setPermissions(prev => (prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authStorage.createManager(username, password, permissions);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create manager');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <h3 className="text-xl font-bold">New Manager Account</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="e.g. manager1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Minimum 4 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {MANAGER_ASSIGNABLE_PERMISSIONS.map(permission => (
                <label
                  key={permission}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="cursor-pointer"
                  />
                  <i className={`${PERMISSION_META[permission].icon} text-gray-500`}></i>
                  <span className="text-sm text-gray-800">{PERMISSION_META[permission].label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <i className="ri-error-warning-line"></i>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Manager'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- Edit Manager Modal ----------------

const EditManagerModal = ({
  user,
  onClose,
  onSaved
}: {
  user: AppUser;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [username, setUsername] = useState(user.username);
  const [permissions, setPermissions] = useState<Permission[]>(user.permissions);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const togglePermission = (permission: Permission) => {
    setPermissions(prev => (prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (authStorage.usernameExists(username, user.id)) {
      setError('Username already exists');
      return;
    }

    setSubmitting(true);
    authStorage.updateManager(user.id, { username, permissions });
    setSubmitting(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <h3 className="text-xl font-bold">Edit Manager</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {MANAGER_ASSIGNABLE_PERMISSIONS.map(permission => (
                <label
                  key={permission}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="cursor-pointer"
                  />
                  <i className={`${PERMISSION_META[permission].icon} text-gray-500`}></i>
                  <span className="text-sm text-gray-800">{PERMISSION_META[permission].label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <i className="ri-error-warning-line"></i>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- Reset Password Modal ----------------

const ResetPasswordModal = ({ user, onClose }: { user: AppUser; onClose: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authStorage.resetManagerPassword(user.id, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl flex items-center justify-between">
          <h3 className="text-xl font-bold">Reset Password</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <i className="ri-checkbox-circle-line text-5xl text-green-600 mb-3 block"></i>
            <p className="text-gray-700 mb-6">Password for "{user.username}" has been reset.</p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Set a new password for <span className="font-semibold">{user.username}</span>.
            </p>
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="New password (min 4 characters)"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <i className="ri-error-warning-line"></i>
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer font-medium disabled:opacity-60"
              >
                {submitting ? 'Saving...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
