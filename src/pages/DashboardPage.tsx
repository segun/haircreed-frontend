import type { Page, User } from "../App";
import AdminLayout from '../components/layouts/AdminLayout';

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
    setCurrentPage: (page: Page) => void;
};

export default function DashboardPage({ user, setCurrentPage }: DashboardPageProps) {
  return (
    <AdminLayout 
        user={user} 
        currentPage="dashboard" 
        setCurrentPage={setCurrentPage}
        pageTitle="Dashboard"
    >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Sales" value="$12,345" change="+12% from last month" />
            <StatCard title="New Orders" value="64" change="+5 from yesterday" />
            <StatCard title="Pending Payments" value="8" />
            <StatCard title="Inventory Items" value="256" />
        </div>

        <div className="mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
                <h3 className="text-lg font-semibold text-zinc-800">Recent Activity</h3>
                <p className="mt-2 text-zinc-600">Activity feed will be displayed here...</p>
            </div>
        </div>
    </AdminLayout>
  );
}

