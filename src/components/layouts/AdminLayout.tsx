import React, { useState, useEffect } from "react";
import {
  Home,
  Package,
  ShoppingCart,
  BarChart2,
  Users,
  LogOut,
  Settings,
  User as UserIcon,
  Menu,
  X,
  UserCircle,
  ChevronDown,
  ChevronUp,
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
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  to: string;
  disabled?: boolean;
  onClick?: () => void;
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
      onClick={onClick}
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
import db from "../../instant";

export default function AdminLayout({
  user,
  children,
  pageTitle,
  onLogout,
}: AdminLayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const {
    data: appSettings,
  } = db.useQuery({
    AppSettings: {},
  });

  const businessName = appSettings?.AppSettings?.[0]?.settings?.businessName || "HairCreed";
  const businessLogo = appSettings?.AppSettings?.[0]?.settings?.businessLogo;

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Inventory", path: "/inventory", icon: <Package size={20} /> },
    { name: "Point of Sale", path: "/orders", icon: <ShoppingCart size={20} /> },
    { name: "View Orders", path: "/view-orders", icon: <ShoppingCart size={20} /> },
    { name: "Reports", path: "/reports", icon: <BarChart2 size={20} /> },
    {
      name: "Attributes",
      path: "/inventory-attributes",
      icon: <Settings size={20} />,
    },
  ];

  const settingsItems = [
    { name: "System Settings", path: "/settings", icon: <Settings size={20} /> },
    { name: "Customers", path: "/customers", icon: <UserCircle size={20} /> },
    { name: "Users", path: "/users", icon: <Users size={20} /> },
  ];

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSidebarOpen]);

  const handleSidebarLinkClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Toaster position="top-right" />
      
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-zinc-800 w-64 p-4 z-30 flex flex-col transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between h-16 mb-6 flex-shrink-0">
          <div className="flex items-center">
            {businessLogo && (
              <img src={businessLogo} alt="Business Logo" className="h-8 w-auto mr-2 rounded-full" />
            )}
            <h1 className="ml-2 text-2xl font-bold text-white">{businessName}</h1>
          </div>
          <button 
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto min-h-0 pb-4">
          {navigation.map((item) => (
            <SidebarLink
              key={item.name}
              icon={item.icon}
              text={item.name}
              active={location.pathname === item.path}
              to={item.path}
              disabled={user?.role === "POS_OPERATOR" && item.path !== "/orders"}
              onClick={handleSidebarLinkClick}
            />
          ))}
          
          {/* Collapsible Settings Section */}
          <div className="space-y-1">
            <button
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              disabled={user?.role === "POS_OPERATOR"}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                user?.role === "POS_OPERATOR"
                  ? "cursor-not-allowed text-zinc-500 bg-zinc-800"
                  : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <Settings size={20} />
                <span className="ml-3">Settings</span>
              </div>
              {user?.role !== "POS_OPERATOR" && (
                isSettingsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>
            
            {isSettingsExpanded && user?.role !== "POS_OPERATOR" && (
              <div className="ml-4 space-y-1 border-l-2 border-zinc-700 pl-2">
                {settingsItems.map((item) => (
                  <SidebarLink
                    key={item.name}
                    icon={item.icon}
                    text={item.name}
                    active={location.pathname === item.path}
                    to={item.path}
                    onClick={handleSidebarLinkClick}
                  />
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="space-y-2 flex-shrink-0 pt-4 border-t border-zinc-700">
          <SidebarLink
            icon={<UserIcon size={20} />}
            text="Profile Settings"
            active={location.pathname === "/user-settings"}
            to="/user-settings"
            onClick={handleSidebarLinkClick}
          />
          <LogoutButton
            icon={<LogOut size={20} />}
            text="Logout"
            onClick={() => {
              onLogout();
              handleSidebarLinkClick();
            }}
          />
        </div>
      </div>

      <div className="md:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-4 text-zinc-600 hover:text-zinc-900"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-semibold text-zinc-800">{pageTitle}</h2>
            </div>
            <div className="flex items-center">
              <Link 
                to="/user-settings"
                className="flex items-center hover:bg-zinc-50 rounded-lg p-2 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold">
                  {getInitials(user?.fullName)}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-medium text-zinc-900">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-zinc-500 capitalize">
                    {user?.role} Role
                  </p>
                </div>
              </Link>
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
