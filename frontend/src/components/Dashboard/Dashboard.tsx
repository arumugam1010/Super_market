import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { useCountAnimation } from '../../hooks/useAnimation';
import { BillView } from '../Billing/BillView';
import { Bill, Customer } from '../../types';

export default function Dashboard() {
  const {
    bills,
    products,
    customers,
    getLowStockProducts,
    getExpiringProducts
  } = useApp();

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillView, setShowBillView] = useState(false);

  // Calculate today's sales
  const today = new Date();
  const todaysBills = bills.filter(bill => 
    new Date(bill.date) >= startOfDay(today) && new Date(bill.date) <= endOfDay(today)
  );
  const todaysSales = todaysBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const todaysTransactions = todaysBills.length;

  // Calculate monthly sales
  const monthlyBills = bills.filter(bill => 
    new Date(bill.date) >= startOfMonth(today) && new Date(bill.date) <= endOfMonth(today)
  );
  const monthlySales = monthlyBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

  // Get alerts
  const lowStockProducts = getLowStockProducts();
  const expiringProducts = getExpiringProducts(30);

  const animatedTodaysSales = useCountAnimation(todaysSales);
  const animatedMonthlySales = useCountAnimation(monthlySales);
  const animatedProductsCount = useCountAnimation(products.length);
  const animatedCustomersCount = useCountAnimation(customers.length);

  const stats = [
    {
      title: "Today's Sales",
      value: `₹${animatedTodaysSales.toLocaleString()}`,
      change: `${todaysTransactions} transactions`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: "Monthly Sales",
      value: `₹${animatedMonthlySales.toLocaleString()}`,
      change: `${monthlyBills.length} total bills`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: "Total Products",
      value: animatedProductsCount.toString(),
      change: `${lowStockProducts.length} low stock`,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: "Total Customers",
      value: animatedCustomersCount.toString(),
      change: "Registered users",
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  const recentBills = bills
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">Your supermarket management summary</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-in-stagger">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 stats-card card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2 number-count">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg scale-in`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            Alerts & Notifications
          </h3>
          
          <div className="space-y-4">
            {lowStockProducts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800">Low Stock Alert</h4>
                <p className="text-sm text-red-600 mt-1">
                  {lowStockProducts.length} products are running low
                </p>
                <div className="mt-2 space-y-1">
                  {lowStockProducts.slice(0, 3).map(prod => (
                    <p key={prod.id} className="text-xs text-red-700">
                      {prod.name} - {prod.stockQuantity} left
                    </p>
                  ))}
                </div>
              </div>
            )}

            {expiringProducts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800">Expiry Alert</h4>
                <p className="text-sm text-yellow-600 mt-1">
                  {expiringProducts.length} products expiring within 30 days
                </p>
                <div className="mt-2 space-y-1">
                  {expiringProducts.slice(0, 3).map(prod => (
                    <p key={prod.id} className="text-xs text-yellow-700">
                      {prod.name} - Expires {format(new Date(prod.expiryDate!), 'MMM d, yyyy')}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {lowStockProducts.length === 0 && expiringProducts.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">All products are well-stocked and not expiring soon!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShoppingCart className="w-5 h-5 text-blue-500 mr-2" />
            Recent Bills
          </h3>
          
          {recentBills.length > 0 ? (
            <div className="space-y-4">
              {recentBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{bill.billNumber}</p>
                    <p className="text-sm text-gray-600">
                      {bill.customerName || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(`${bill.date}T${bill.time}`), 'MMM d, yyyy - h:mm a')}
                    </p>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <div>
                      <p className="font-semibold text-gray-900">₹{bill.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{bill.items.length} items</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {bill.paymentMode.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowBillView(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Bill"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent bills</p>
            </div>
          )}
        </div>
      </div>

      {/* Bill View Modal */}
      {selectedBill && (
        <BillView
          bill={selectedBill}
          customer={selectedBill.customerId ? customers.find(c => c.id === selectedBill.customerId) || null : null}
          isOpen={showBillView}
          onClose={() => {
            setShowBillView(false);
            setSelectedBill(null);
          }}
        />
      )}

        </div>
  );
}
