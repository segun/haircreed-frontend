import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import ViewOrdersPage from './pages/ViewOrdersPage';
import AppSettingsPage from './pages/AppSettingsPage';
import ReportsPage from './pages/ReportsPage';
import UserSettingsPage from './pages/UserSettingsPage';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import AuditsPage from './pages/AuditsPage';
import ReceiptsPage from './pages/ReceiptsPage';
import ReceiptEditorPage from './pages/ReceiptEditorPage';
import type { LoginResult } from './api/auth';
import { clearAuthSession, setAuthSession, subscribeToSessionInvalidation } from './api/authSession';
import { CurrencyProvider } from './context/CurrencyContext';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.removeItem('user');
    return subscribeToSessionInvalidation(() => {
      setUser(null);
      navigate('/');
    });
  }, [navigate]);

  useEffect(() => {
    if (user && user.requiresPasswordReset) {
      navigate('/password-reset');
      return;
    }

    if (user) {
      const isPosOperator = user.role === 'POS_OPERATOR';
      const currentPath = location.pathname;

      if (isPosOperator && currentPath !== '/orders') {
        navigate('/orders');
      } else if (currentPath === '/') {
        navigate('/dashboard');
      }
    }
  }, [user, location.pathname, navigate]);

  const handleLoginSuccess = ({ user: userData, accessToken, expiresIn }: LoginResult) => {
    setAuthSession(accessToken, expiresIn);
    setUser(userData);
  };

  const handlePasswordReset = async (newPassword: string) => {
    if (user) {
      const updatedUser = await updateUser(user.id, {
        passwordHash: newPassword,
        requiresPasswordReset: false,
      });
      setUser(updatedUser);
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    navigate('/');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
      </Routes>
    );
  }

  if (user.requiresPasswordReset) {
    return <PasswordResetPage onPasswordReset={handlePasswordReset} />;
  }

  return (
    <CurrencyProvider>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage user={user} onLogout={handleLogout} />} />
        <Route path="/inventory-attributes" element={<InventoryAttributesPage user={user} onLogout={handleLogout} />} />
        <Route path="/inventory" element={<InventoryPage user={user} onLogout={handleLogout} />} />
        <Route path="/users" element={<UserManagementPage user={user} onLogout={handleLogout} />} />
        <Route path="/customers" element={<CustomersPage user={user} onLogout={handleLogout} />} />
        <Route path="/products" element={<ProductsPage user={user} onLogout={handleLogout} />} />
        <Route path="/audits" element={<AuditsPage user={user} onLogout={handleLogout} />} />
        <Route path="/orders" element={<OrderPage user={user} onLogout={handleLogout} />} />
        <Route path="/view-orders" element={<ViewOrdersPage user={user} onLogout={handleLogout} />} />
        <Route path="/receipts" element={<ReceiptsPage user={user} onLogout={handleLogout} />} />
        <Route path="/receipts/:receiptId" element={<ReceiptEditorPage user={user} onLogout={handleLogout} />} />
        <Route path="/reports" element={<ReportsPage user={user} onLogout={handleLogout} />} />
        <Route path="/settings" element={<AppSettingsPage user={user} onLogout={handleLogout}/>} />
        <Route path="/user-settings" element={<UserSettingsPage user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />} />
        <Route path="*" element={<DashboardPage user={user} onLogout={handleLogout} />} />
      </Routes>
    </CurrencyProvider>
  );
}

export default App;
