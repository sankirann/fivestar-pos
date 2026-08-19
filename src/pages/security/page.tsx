import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { RestaurantSettings } from '../../types';
import { authStorage } from '../../utils/authStorage';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../../components/UserMenu';

const SecurityPage = () => {
  const { user, refreshUser } = useAuth();

  // Account form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  // Restaurant details form
  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurantName: '',
    ownerName: '',
    phone: '',
    address: '',
    logo: ''
  });
  const [settingsSuccess, setSettingsSuccess] = useState('');

  useEffect(() => {
    setSettings(authStorage.getSettings());
  }, []);

  useEffect(() => {
    if (user) setNewUsername(user.username);
  }, [user]);

  const handleAccountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');

    if (!user) return;

    if (!currentPassword) {
      setAccountError('Enter your current password to confirm changes');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setAccountError('New password and confirmation do not match');
      return;
    }
    if (newPassword && newPassword.length < 4) {
      setAccountError('New password must be at least 4 characters');
      return;
    }

    setSavingAccount(true);
    try {
      const verified = await authStorage.verifyLogin(user.username, currentPassword);
      if (!verified) {
        setAccountError('Current password is incorrect');
        setSavingAccount(false);
        return;
      }

      await authStorage.updateAdminCredentials(user.id, {
        username: newUsername !== user.username ? newUsername : undefined,
        password: newPassword || undefined
      });

      refreshUser();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setAccountSuccess('Account details updated successfully');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Failed to update account');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSettingsSubmit = (e: FormEvent) => {
    e.preventDefault();
    authStorage.saveSettings(settings);
    setSettingsSuccess('Restaurant details saved');
    setTimeout(() => setSettingsSuccess(''), 2500);
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSettings(prev => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">Security Settings</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">Manage your account and restaurant details</p>
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
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            <i className="ri-shield-keyhole-line text-blue-600"></i>
            Account Security
          </h2>
          <p className="text-sm text-gray-500 mb-6">Change your admin username and/or password</p>

          <form onSubmit={handleAccountSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password (required to confirm)</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {accountError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <i className="ri-error-warning-line"></i>
                {accountError}
              </div>
            )}
            {accountSuccess && (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg text-sm">
                <i className="ri-checkbox-circle-line"></i>
                {accountSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={savingAccount}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium disabled:opacity-60"
            >
              {savingAccount ? 'Saving...' : 'Save Account Changes'}
            </button>
          </form>
        </div>

        {/* Restaurant Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            <i className="ri-store-2-line text-green-600"></i>
            Restaurant Details
          </h2>
          <p className="text-sm text-gray-500 mb-6">Shown on printed bills and reports</p>

          <form onSubmit={handleSettingsSubmit} className="space-y-4 max-w-lg">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <i className="ri-image-line text-2xl text-gray-300"></i>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="text-sm text-gray-600 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Restaurant Name</label>
              <input
                type="text"
                value={settings.restaurantName}
                onChange={e => setSettings(prev => ({ ...prev, restaurantName: e.target.value }))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner Name</label>
              <input
                type="text"
                value={settings.ownerName}
                onChange={e => setSettings(prev => ({ ...prev, ownerName: e.target.value }))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <textarea
                value={settings.address}
                onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
              />
            </div>

            {settingsSuccess && (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg text-sm">
                <i className="ri-checkbox-circle-line"></i>
                {settingsSuccess}
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium"
            >
              Save Restaurant Details
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
