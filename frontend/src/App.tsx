import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import Login from './components/Auth/Login';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import { BillingSystem } from './components/Billing/BillingSystem';
import SalesReturnPage from './components/SalesReturn/SalesReturnPage';
import CustomerList from './components/Customers/CustomerList';
import Reports from './components/Reports/Reports';
import InventoryManagement from './components/Inventory/InventoryManagement';
import NotificationToast from './components/Notifications/NotificationToast';
import SupplierList from './components/suppliers/supplierList';

function AppContent() {
  const { currentUser } = useApp();
  const { notifications, removeNotification } = useNotifications();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Sidebar />
        <div className="ml-60">
          <Header />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/billing" element={<BillingSystem />} />
              <Route path="/sales-return" element={<SalesReturnPage />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/suppliers" element={<SupplierList />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        
        {/* Notification Toasts */}
        {notifications.slice(0, 3).map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AppProvider>
  );
}

export default App;