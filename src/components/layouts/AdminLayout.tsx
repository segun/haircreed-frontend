import React from "react";
import {
  Home,
  Package,
  ShoppingCart,
  BarChart2,
  Users,
  LogOut,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { User } from "../../types";

type AdminLayoutProps = {
  user: User;
  children: React.ReactNode;
  pageTitle: string;
  onLogout: () => void;
};

const getInitials = (name: string | undefined) => {
  if (!name) return "?";
  const names = name.split(" ");
  return names
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const SidebarLink = ({
  icon,
  text,
  active,
  to,
  disabled,
}: {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  to: string;
  disabled?: boolean;
}) => {
  const commonClasses =
    "w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";

  if (disabled) {
    return (
      <div
        className={`${commonClasses} cursor-not-allowed text-zinc-500 bg-zinc-800`}
      >
        {icon}
        <span className="ml-3">{text}</span>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`${commonClasses} ${
        active
          ? "bg-zinc-700 text-white"
          : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
      }`}
    >
      {icon}
      <span className="ml-3">{text}</span>
    </Link>
  );
};

const LogoutButton = ({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
  >
    {icon}
    <span className="ml-3">{text}</span>
  </button>
);

import { Toaster } from "react-hot-toast";

export default function AdminLayout({
  user,
  children,
  pageTitle,
  onLogout,
}: AdminLayoutProps) {
  const location = useLocation();
  const businessName = "HairCreed";

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Inventory", path: "/inventory", icon: <Package size={20} /> },
    { name: "Orders", path: "/orders", icon: <ShoppingCart size={20} /> },
    { name: "Reports", path: "/reports", icon: <BarChart2 size={20} /> },
    { name: "Users", path: "/users", icon: <Users size={20} /> },
    {
      name: "Attributes",
      path: "/inventory-attributes",
      icon: <Settings size={20} />,
    },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-100">
      <Toaster position="top-right" />
      <div className="fixed inset-y-0 left-0 bg-zinc-800 w-64 p-4 z-30 flex flex-col">
        <div className="flex items-center justify-center h-16 mb-6">
          <h1 className="text-2xl font-bold text-white">{businessName}</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <SidebarLink
              key={item.name}
              icon={item.icon}
              text={item.name}
              active={location.pathname === item.path}
              to={item.path}
              disabled={user?.role === "POS_OPERATOR" && item.path !== "/orders"}
            />
          ))}
        </nav>
        <div className="mt-auto">
          <LogoutButton
            icon={<LogOut size={20} />}
            text="Logout"
            onClick={onLogout}
          />
        </div>
      </div>

      <div className="ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-zinc-800">{pageTitle}</h2>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold">
                {getInitials(user?.fullName)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-zinc-900">
                  {user?.fullName}
                </p>
                <p className="text-xs text-zinc-500 capitalize">
                  {user?.role} Role
                </p>
              </div>
            </div>
          </div>
        </header>

        <main>
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
