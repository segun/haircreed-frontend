import AdminLayout from '../components/layouts/AdminLayout';
import { getDashboard } from '../api/databaseReads';
import type { User } from "../types";
import { useCurrency } from '../context/CurrencyContext';
import { useApiQuery } from '../hooks/useApiQuery';
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
    const { formatCurrency } = useCurrency();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data: dashboardDetails, error, isLoading } = useApiQuery(
        `dashboard-${timezone}`,
        (signal) => getDashboard({ timezone, bucket: 'day' }, signal),
    );

  return (
    <AdminLayout 
        user={user} 
        onLogout={onLogout}
        pageTitle="Dashboard"
    >
        {isLoading ? (
            <p>Loading...</p>
        ) : error ? (
            <p>Error: {error.message}</p>
        ) : dashboardDetails && (
            <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Sales" value={formatCurrency(dashboardDetails.summary.totalSales)} change={`${dashboardDetails.summary.salesPercentageChange}% from last month`} />
                    <StatCard title="New Orders" value={dashboardDetails.summary.newOrders.toString()} change={`${dashboardDetails.summary.newOrdersChange} from yesterday`} />
                    <StatCard title="Pending Payments" value={dashboardDetails.summary.pendingPayments.toString()} />
                    <StatCard title="Inventory Items" value={dashboardDetails.summary.inventoryItems.toString()} />
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <SalesOverTimeChart data={dashboardDetails.charts.salesOverTime} />
                    </div>
                    <PaymentStatusBreakdownChart data={dashboardDetails.charts.paymentStatus} />
                    <DiscountVsFullPriceChart data={dashboardDetails.charts.discountVsFullPrice} />
                    <OrderStatusDistributionChart data={dashboardDetails.charts.orderStatus} />
                    <SalesByPosOperatorChart data={dashboardDetails.charts.salesByPosOperator} />
                    <DeliveryMethodChart data={dashboardDetails.charts.deliveryMethod} />
                </div>

                <div className="mt-8">
                    <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
                        <h3 className="text-lg font-semibold text-zinc-800">Recent Activity</h3>
                        <ul className="mt-4 space-y-4">
                            {dashboardDetails.recentActivity.map(activity => (
                                <li key={activity.id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between">
                                        <p className="font-semibold">{activity.customer?.fullName || 'Unknown customer'}</p>
                                        <p className="text-sm text-zinc-500">{new Date(activity.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <p>Order #{activity.orderNumber} - {activity.orderStatus}</p>
                                    <p>Total: {formatCurrency(activity.totalAmount)}</p>
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
