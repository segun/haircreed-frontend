import { useState } from 'react';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import InventoryAttributesPage from './pages/InventoryAttributesPage';
import UserManagementPage from './pages/UserManagementPage';
import InventoryPage from './pages/InventoryPage';
import PasswordResetPage from './pages/PasswordResetPage';
import type { User } from "./types";
import { updateUser } from './api/users';
import OrderPage from "./pages/OrderPage";

export type Page = 'dashboard' | 'inventory-attributes' | 'inventory' | 'orders' | 'reports' | 'users';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);

  const handleLoginSuccess = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.requiresPasswordReset) {
      setNeedsPasswordReset(true);
    } else if (userData.role === 'POS_OPERATOR') {
      setCurrentPage('orders');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handlePasswordReset = async (newPassword: string) => {
    if (user) {
      const updatedUser = await updateUser(user.id, {
        passwordHash: newPassword,
        requiresPasswordReset: false,
      });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setNeedsPasswordReset(false);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Optional: redirect to login or show a logged out message
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (needsPasswordReset) {
    return <PasswordResetPage onPasswordReset={handlePasswordReset} />;
  }

  const renderPage = () => {
    if (user?.role === 'POS_OPERATOR') {
      return <OrderPage user={user} setCurrentPage={setCurrentPage} onLogout={handleLogout} />;
    }
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage user={user} setCurrentPage={setCurrentPage} onLogout={handleLogout} />;
      case 'inventory-attributes':
        return <InventoryAttributesPage user={user} setCurrentPage={setCurrentPage} onLogout={handleLogout} />;
      case 'inventory':
        return <InventoryPage user={user} setCurrentPage={setCurrentPage} onLogout={handleLogout} />;
      case 'users':
        return <UserManagementPage user={user} setCurrentPage={setCurrentPage} onLogout={handleLogout} />;
      case 'orders':
        return <OrderPage user={user} setCurrentPage={setCurrentPage} onLogout={handleLogout} />;
      default:
        return <DashboardPage user={user} setCurrentPage={setCurrentPage} onLogout={handleLogout} />;
    }
  };

  return <>{renderPage()}</>;
}

export default App;
