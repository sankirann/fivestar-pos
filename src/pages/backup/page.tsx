import { useRef, useState } from 'react';
import { downloadBackup, restoreBackup, RestoreSummary } from '../../utils/backup';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../../components/UserMenu';

const BackupPage = () => {
  const { hasPermission } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const [restoreSummary, setRestoreSummary] = useState<RestoreSummary | null>(null);

  const handleExport = () => {
    setExporting(true);
    try {
      downloadBackup();
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError('');
    setRestoreSummary(null);
    setRestoring(true);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const summary = restoreBackup(reader.result as string);
        setRestoreSummary(summary);
      } catch (err) {
        setRestoreError(err instanceof Error ? err.message : 'Failed to restore backup');
      } finally {
        setRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setRestoreError('Could not read the selected file');
      setRestoring(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-[800px] mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">Backup &amp; Restore</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">Export or restore all app data</p>
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

        {hasPermission('backup') && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="ri-download-cloud-2-line text-blue-600"></i>
              Backup
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Download a single JSON file containing your bills, inventory, menu, users, tables, kitchen orders, and
              settings.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium disabled:opacity-60"
            >
              <i className="ri-download-2-line mr-2"></i>
              {exporting ? 'Preparing...' : 'Download Backup'}
            </button>
            {exportDone && (
              <p className="mt-3 text-sm text-green-700 flex items-center gap-1">
                <i className="ri-checkbox-circle-line"></i>
                Backup downloaded
              </p>
            )}
          </div>
        )}

        {hasPermission('restore') && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <i className="ri-upload-cloud-2-line text-green-600"></i>
              Restore
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Restoring merges safely - existing data is never overwritten or duplicated, only new records from the
              backup are added.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileSelected}
              className="hidden"
              id="restore-file-input"
            />
            <label
              htmlFor="restore-file-input"
              className={`inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium ${
                restoring ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              <i className="ri-file-upload-line mr-2"></i>
              {restoring ? 'Restoring...' : 'Choose Backup File'}
            </label>

            {restoreError && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <i className="ri-error-warning-line"></i>
                {restoreError}
              </div>
            )}

            {restoreSummary && (
              <div className="mt-4 px-4 py-4 bg-green-50 text-green-800 rounded-lg text-sm">
                <p className="font-medium mb-2 flex items-center gap-1">
                  <i className="ri-checkbox-circle-line"></i>
                  Restore complete
                </p>
                <ul className="space-y-0.5 text-green-700">
                  <li>{restoreSummary.billsAdded} new bills added</li>
                  <li>{restoreSummary.inventoryAdded} new inventory items added</li>
                  <li>{restoreSummary.menuAdded} new menu items added</li>
                  <li>{restoreSummary.usersAdded} new users added</li>
                  <li>{restoreSummary.tablesAdded} new tables added</li>
                  <li>{restoreSummary.kitchenOrdersAdded} new kitchen orders added</li>
                  {restoreSummary.settingsUpdated && <li>Restaurant details filled in from backup</li>}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupPage;
