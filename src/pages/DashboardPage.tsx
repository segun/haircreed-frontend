import { useEffect, useState } from 'react';
import AdminLayout from '../components/layouts/AdminLayout';
import { getDashboardDetails } from '../api/dashboard';
import type { DashboardDetails, User } from "../types";
import SalesOverTimeChart from '../components/charts/SalesOverTimeChart';
import PaymentStatusBreakdownChart from '../components/charts/PaymentStatusBreakdownChart';
import DiscountVsFullPriceChart from '../components/charts/DiscountVsFullPriceChart';
import OrderStatusDistributionChart from '../components/charts/OrderStatusDistributionChart';
import SalesByPosOperatorChart from '../components/charts/SalesByPosOperatorChart';
import DeliveryMethodChart from '../components/charts/DeliveryMethodChart';

// A simple placeholder card
const StatCard = ({ title, value, change }: { title: string; value: string; change?: string; }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-zinc-900">{value}</p>
        {change && <p className="mt-1 text-sm text-green-600">{change}</p>}
    </div>
);

type DashboardPageProps = {
    user: User;
    onLogout: () => void;
};

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
    const [dashboardDetails, setDashboardDetails] = useState<DashboardDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardDetails = async () => {
            try {
                const details = await getDashboardDetails();
                setDashboardDetails(details);
            } catch (error) {
                console.error('Failed to fetch dashboard details', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardDetails();
    }, []);

  return (
    <AdminLayout 
        user={user} 
        onLogout={onLogout}
        pageTitle="Dashboard"
    >
        {loading ? (
            <p>Loading...</p>
        ) : dashboardDetails && (
            <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Sales" value={`${dashboardDetails.totalSales.toFixed(2)}`} change={`${dashboardDetails.salesPercentageChange}% from last month`} />
                    <StatCard title="New Orders" value={dashboardDetails.newOrders.toString()} change={`${dashboardDetails.newOrdersChange} from yesterday`} />
                    <StatCard title="Pending Payments" value={dashboardDetails.pendingPayments.toString()} />
                    <StatCard title="Inventory Items" value={dashboardDetails.inventoryItems.toString()} />
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <SalesOverTimeChart />
                    </div>
                    <PaymentStatusBreakdownChart />
                    <DiscountVsFullPriceChart />
                    <OrderStatusDistributionChart />
                    <SalesByPosOperatorChart />
                    <DeliveryMethodChart />
                </div>

                <div className="mt-8">
                    <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
                        <h3 className="text-lg font-semibold text-zinc-800">Recent Activity</h3>
                        <ul className="mt-4 space-y-4">
                            {dashboardDetails.recentActivity.map(activity => (
                                <li key={activity.id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between">
                                        <p className="font-semibold">{activity.customer.fullName}</p>
                                        <p className="text-sm text-zinc-500">{new Date(activity.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <p>Order #{activity.orderNumber} - {activity.orderStatus}</p>
                                    <p>Total: ${activity.totalAmount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </>
        )}
    </AdminLayout>
  );
}
