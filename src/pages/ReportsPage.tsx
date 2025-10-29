import React, { useState } from 'react';
import AdminLayout from '../components/layouts/AdminLayout';
import type { User } from '../types';
import DetailedSalesReport from '../components/admin/DetailedSalesReport';
import EndOfDayReport from '../components/admin/EndOfDayReport';
import SalesByItemReport from '../components/admin/SalesByItemReport';

interface ReportsPageProps {
  user: User;
  onLogout: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ user, onLogout }) => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const renderReport = () => {
    switch (selectedReport) {
      // Sales & Financial Reports
      case 'detailed-sales':
        return <DetailedSalesReport />;
      case 'end-of-day':
        return <EndOfDayReport />;
      case 'sales-by-item':
        return <SalesByItemReport />;
      case 'outstanding-payments':
        return <div>Outstanding Payments Report</div>;
      // Customer Reports
      case 'customer-purchase-history':
        return <div>Customer Purchase History</div>;
      case 'top-customers':
        return <div>Top Customers</div>;
      case 'new-customer-list':
        return <div>New Customer List</div>;
      // Inventory & Supplier Reports
      case 'current-stock-levels':
        return <div>Current Stock Levels</div>;
      case 'low-stock':
        return <div>Low Stock Report</div>;
      case 'inventory-valuation':
        return <div>Inventory Valuation Report</div>;
      // Operational Reports
      case 'staff-performance':
        return <div>Staff Performance Report</div>;
      case 'order-fulfillment':
        return <div>Order Fulfillment Report</div>;
      default:
        return <p>Select a report to view.</p>;
    }
  };

  return (
    <AdminLayout user={user} onLogout={onLogout} pageTitle="Reports">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Select a Report</h2>
            <ul className="space-y-2">
              <li className="font-bold text-lg">Sales & Financial</li>
              <li><button onClick={() => setSelectedReport('detailed-sales')} className="text-blue-500 hover:underline">Detailed Sales Report</button></li>
              <li><button onClick={() => setSelectedReport('end-of-day')} className="text-blue-500 hover:underline">End-of-Day Report</button></li>
              <li><button onClick={() => setSelectedReport('sales-by-item')} className="text-blue-500 hover:underline">Sales by Item Report</button></li>
              <li><button onClick={() => setSelectedReport('outstanding-payments')} className="text-blue-500 hover:underline">Outstanding Payments Report</button></li>

              <li className="font-bold text-lg pt-4">Customer</li>
              <li><button onClick={() => setSelectedReport('customer-purchase-history')} className="text-blue-500 hover:underline">Customer Purchase History</button></li>
              <li><button onClick={() => setSelectedReport('top-customers')} className="text-blue-500 hover:underline">Top Customers</button></li>
              <li><button onClick={() => setSelectedReport('new-customer-list')} className="text-blue-500 hover:underline">New Customer List</button></li>

              <li className="font-bold text-lg pt-4">Inventory & Supplier</li>
              <li><button onClick={() => setSelectedReport('current-stock-levels')} className="text-blue-500 hover:underline">Current Stock Levels</button></li>
              <li><button onClick={() => setSelectedReport('low-stock')} className="text-blue-500 hover:underline">Low Stock Report</button></li>
              <li><button onClick={() => setSelectedReport('inventory-valuation')} className="text-blue-500 hover:underline">Inventory Valuation Report</button></li>

              <li className="font-bold text-lg pt-4">Operational</li>
              <li><button onClick={() => setSelectedReport('staff-performance')} className="text-blue-500 hover:underline">Staff Performance Report</button></li>
              <li><button onClick={() => setSelectedReport('order-fulfillment')} className="text-blue-500 hover:underline">Order Fulfillment Report</button></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            {renderReport()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
