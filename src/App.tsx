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
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLoginSuccess = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handlePasswordReset = async (newPassword: string) => {
    if (user) {
      const updatedUser = await updateUser(user.id, {
        passwordHash: newPassword,
        requiresPasswordReset: false,
      });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
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
    <Routes>
      <Route path="/dashboard" element={<DashboardPage user={user} onLogout={handleLogout} />} />
      <Route path="/inventory-attributes" element={<InventoryAttributesPage user={user} onLogout={handleLogout} />} />
      <Route path="/inventory" element={<InventoryPage user={user} onLogout={handleLogout} />} />
      <Route path="/users" element={<UserManagementPage user={user} onLogout={handleLogout} />} />
      <Route path="/orders" element={<OrderPage user={user} onLogout={handleLogout} />} />
      <Route path="/view-orders" element={<ViewOrdersPage user={user} onLogout={handleLogout} />} />
      <Route path="/reports" element={<ReportsPage user={user} onLogout={handleLogout} />} />
      <Route path="/settings" element={<AppSettingsPage user={user} onLogout={handleLogout}/>} />
      <Route path="/user-settings" element={<UserSettingsPage user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />} />
      <Route path="*" element={<DashboardPage user={user} onLogout={handleLogout} />} />
    </Routes>
  );
}

export default App;
