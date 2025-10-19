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
import AppSettingsPage from './pages/AppSettingsPage';

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
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && user.requiresPasswordReset) {
      setNeedsPasswordReset(true);
    } else if (user && location.pathname === '/') {
        if (user.role === 'POS_OPERATOR') {
            navigate('/orders');
        } else {
            navigate('/dashboard');
        }
    }
  }, [user, navigate, location.pathname]);

  const handleLoginSuccess = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.requiresPasswordReset) {
      setNeedsPasswordReset(true);
    } else if (userData.role === 'POS_OPERATOR') {
      navigate('/orders');
    } else {
      navigate('/dashboard');
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
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (needsPasswordReset) {
    return <PasswordResetPage onPasswordReset={handlePasswordReset} />;
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage user={user} onLogout={handleLogout} />} />
      <Route path="/inventory-attributes" element={<InventoryAttributesPage user={user} onLogout={handleLogout} />} />
      <Route path="/inventory" element={<InventoryPage user={user} onLogout={handleLogout} />} />
      <Route path="/users" element={<UserManagementPage user={user} onLogout={handleLogout} />} />
      <Route path="/orders" element={<OrderPage user={user} onLogout={handleLogout} />} />
      <Route path="/reports" element={<div>Reports Page</div>} />
      <Route path="/settings" element={<AppSettingsPage />} />
      <Route path="*" element={<DashboardPage user={user} onLogout={handleLogout} />} />
    </Routes>
  );
}

export default App;
