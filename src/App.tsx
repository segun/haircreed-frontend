import { useState } from 'react';
import './App.css'
import DashboardPage from './pages/DashboardPage';
import LoginPage from "./pages/LoginPage"
import InventoryAttributesPage from './pages/InventoryAttributesPage';

// Define a type for our user state for better type safety
export type User = {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'pos';
};

// Define the available pages in the app
export type Page = 'dashboard' | 'inventory-attributes' | 'inventory' | 'orders' | 'reports' | 'users';


function App() {
  const [user, setUser] = useState<User | null>(null);
  // State to manage the current active page
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard'); // Go to dashboard after login
  };

  useState(() => {
    if (!user) {
      setUser({
        id: 'user-1',
        username: 'admin',
        fullName: 'Admin User',
        role: 'admin',
      });
    }
  });

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }
 
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage user={user} setCurrentPage={setCurrentPage} />;
      case 'inventory-attributes':
        return <InventoryAttributesPage user={user} setCurrentPage={setCurrentPage} />;
      default:
        return <DashboardPage user={user} setCurrentPage={setCurrentPage} />;
    }
  }

  return <>{renderPage()}</>;
}

export default App

