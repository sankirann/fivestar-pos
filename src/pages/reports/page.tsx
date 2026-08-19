
import { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import { Bill } from '../../types';
import BillReport from './components/BillReport';
import ItemSalesReport from './components/ItemSalesReport';
import DayReport from './components/DayReport';
import SalesSummary from './components/SalesSummary';
import InventorySummary from './components/InventorySummary';
import MonthlySalesReport from './components/MonthlySalesReport';
import UserMenu from '../../components/UserMenu';

type ReportTab = 'bills' | 'items' | 'day' | 'summary' | 'inventory' | 'monthly';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [bills, setBills] = useState<Bill[]>([]);
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = () => {
    try {
      const allBills = storage.getBills();
      setBills(allBills);
    } catch (error) {
      console.error('Failed to load bills:', error);
      setBills([]);
    }
  };

  const handleDeleteBill = (billId: string) => {
    try {
      const updatedBills = storage.deleteBill(billId);
      setBills(updatedBills);
    } catch (error) {
      console.error('Failed to delete bill:', error);
    }
  };

  const tabs = [
    { id: 'summary' as const, label: 'Sales Summary', icon: 'ri-dashboard-line' },
    { id: 'monthly' as const, label: 'Monthly Sales', icon: 'ri-calendar-2-line' },
    { id: 'bills' as const, label: 'Bill Report', icon: 'ri-file-list-line' },
    { id: 'items' as const, label: 'Item Sales', icon: 'ri-shopping-bag-line' },
    { id: 'day' as const, label: 'Day Report', icon: 'ri-calendar-line' },
    { id: 'inventory' as const, label: 'Inventory', icon: 'ri-archive-line' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <img 
                src="https://static.readdy.ai/image/b16a36712d4489a09c619c16397ad1bd/eecd6a122e7383b98d5c713792cdcbed.jpeg" 
                alt="Five Star Chicken" 
                className="w-10 h-10 md:w-16 md:h-16 object-contain shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">Reports & Analytics</h1>
                <p className="text-xs md:text-sm text-gray-600 truncate">Track your business performance</p>
              </div>
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
              <a 
                href="/inventory" 
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base"
              >
                <i className="ri-archive-line mr-2"></i>
                Inventory
              </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        {activeTab !== 'monthly' && activeTab !== 'inventory' && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">Filter by Date:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                Today
              </button>
            </div>
          </div>
        )}

        {/* Report Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'summary' && <SalesSummary bills={bills} dateFilter={dateFilter} />}
          {activeTab === 'monthly' && <MonthlySalesReport bills={bills} />}
          {activeTab === 'bills' && <BillReport bills={bills} dateFilter={dateFilter} onDeleteBill={handleDeleteBill} />}
          {activeTab === 'items' && <ItemSalesReport bills={bills} dateFilter={dateFilter} />}
          {activeTab === 'day' && <DayReport bills={bills} dateFilter={dateFilter} />}
          {activeTab === 'inventory' && <InventorySummary bills={bills} />}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
