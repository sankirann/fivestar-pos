import { useState, useEffect, FormEvent } from 'react';
import { RestaurantTable } from '../../types';
import { tableStorage } from '../../utils/tableStorage';
import UserMenu from '../../components/UserMenu';

const TablesPage = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [newTableName, setNewTableName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  const load = () => setTables(tableStorage.getTables());

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      tableStorage.addTable(newTableName);
      setNewTableName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add table');
    }
  };

  const handleDelete = (table: RestaurantTable) => {
    if (table.status === 'occupied') {
      alert('This table is currently occupied. Free it before deleting.');
      return;
    }
    if (window.confirm(`Delete table "${table.name}"?`)) {
      tableStorage.deleteTable(table.id);
      load();
    }
  };

  const handleForceFree = (table: RestaurantTable) => {
    if (window.confirm(`Mark "${table.name}" as available? Use this only if it was left occupied by mistake.`)) {
      tableStorage.freeTable(table.id);
      load();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
      <div className="max-w-[1100px] mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">Table Management</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">Create tables and monitor their status</p>
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

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add Table</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="text"
              value={newTableName}
              onChange={e => setNewTableName(e.target.value)}
              placeholder="e.g. Table 1"
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer font-medium whitespace-nowrap"
            >
              <i className="ri-add-line mr-1"></i>
              Add Table
            </button>
          </form>
          {error && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <i className="ri-error-warning-line"></i>
              {error}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {tables.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <i className="ri-layout-grid-line text-5xl mb-3 block"></i>
              No tables yet. Add one above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tables.map(table => (
                <div
                  key={table.id}
                  className={`rounded-xl p-5 border-2 flex flex-col items-center text-center gap-2 ${
                    table.status === 'occupied'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <i
                    className={`ri-table-line text-3xl ${
                      table.status === 'occupied' ? 'text-red-500' : 'text-green-600'
                    }`}
                  ></i>
                  <p className="font-semibold text-gray-800">{table.name}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      table.status === 'occupied' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                    }`}
                  >
                    {table.status === 'occupied' ? `Occupied${table.currentOrderNo ? ` · ${table.currentOrderNo}` : ''}` : 'Available'}
                  </span>
                  <div className="flex gap-2 mt-1">
                    {table.status === 'occupied' && (
                      <button
                        onClick={() => handleForceFree(table)}
                        className="text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        title="Force free"
                      >
                        <i className="ri-lock-unlock-line"></i>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(table)}
                      className="text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      title="Delete table"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TablesPage;
