import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, ShoppingCart, Package, Building2, Users, DollarSign, TrendingUp } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/products', label: 'Products', icon: ShoppingCart },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/suppliers', label: 'Suppliers', icon: Building2 },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/billing', label: 'Billing', icon: DollarSign },
    // { path: '/sales-return', label: 'Sales Return', icon: '🔄' },
    { path: '/reports', label: 'Reports', icon: TrendingUp },
  ];

  return (
    <div className="w-60 bg-white shadow-lg h-screen fixed left-0 top-0 border-r border-gray-200 z-10">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Supermarket</h2>
          <p className="text-xs text-gray-500 mt-1">Management System</p>
        </div>
        
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 text-center">
          <p>v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
