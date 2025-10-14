import { useState } from 'react';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import InventoryAttributesPage from './pages/InventoryAttributesPage';
import UserManagementPage from './pages/UserManagementPage';
import PasswordResetPage from './pages/PasswordResetPage';
import type { User } from "./types";
import { updateUser } from './api/users';
import OrderPage from "./pages/OrderPage";

export type Page = 'dashboard' | 'inventory-attributes' | 'inventory' | 'orders' | 'reports' | 'users';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);

  const handleLoginSuccess = (userData: User) => {
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
      setUser(updatedUser);
      setNeedsPasswordReset(false);
      setCurrentPage('dashboard');
    }
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (needsPasswordReset) {
    return <PasswordResetPage onPasswordReset={handlePasswordReset} />;
  }

  const renderPage = () => {
    if (user?.role === 'POS_OPERATOR') {
      return <OrderPage user={user} setCurrentPage={setCurrentPage}/>;
    }
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage user={user} setCurrentPage={setCurrentPage} />;
      case 'inventory-attributes':
        return <InventoryAttributesPage user={user} setCurrentPage={setCurrentPage} />;
      case 'users':
        return <UserManagementPage user={user} setCurrentPage={setCurrentPage}/>;
      case 'orders':
        return <OrderPage user={user} setCurrentPage={setCurrentPage}/>;
      default:
        return <DashboardPage user={user} setCurrentPage={setCurrentPage} />;
    }
  };

  return <>{renderPage()}</>;
}

export default App;


