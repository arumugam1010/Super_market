import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  DollarSign,
  Package,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, ArcElement, PointElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

export default function Reports() {
  const { bills, medicines, customers, getLowStockMedicines, getExpiringMedicines } = useApp();
  const [reportType, setReportType] = useState<'sales' | 'gst' | 'profit' | 'inventory'>('sales');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date(now.setHours(23, 59, 59, 999)) };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : startOfMonth(now),
          end: customEndDate ? new Date(customEndDate) : endOfMonth(now)
        };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const filteredBills = useMemo(() => {
    const { start, end } = getDateRangeFilter();
    return bills.filter(bill => {
      const billDate = new Date(bill.date);
      return billDate >= start && billDate <= end;
    });
  }, [bills, dateRange, customStartDate, customEndDate]);

  // Sales Analytics
  const salesData = useMemo(() => {
    const totalSales = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalTransactions = filteredBills.length;
    const totalItems = filteredBills.reduce((sum, bill) => sum + bill.items.length, 0);
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Daily sales for chart
    const dailySales: { [key: string]: number } = {};
    filteredBills.forEach(bill => {
      const date = bill.date;
      dailySales[date] = (dailySales[date] || 0) + bill.totalAmount;
    });

    // Payment mode distribution
    const paymentModes: { [key: string]: number } = {};
    filteredBills.forEach(bill => {
      paymentModes[bill.paymentMode] = (paymentModes[bill.paymentMode] || 0) + 1;
    });

    return {
      totalSales,
      totalTransactions,
      totalItems,
      averageTransaction,
      dailySales,
      paymentModes
    };
  }, [filteredBills]);

  // GST Report
  const gstData = useMemo(() => {
    const gstCollected = filteredBills.reduce((sum, bill) => sum + bill.gstAmount, 0);
    const taxableAmount = filteredBills.reduce((sum, bill) => sum + (bill.totalAmount - bill.gstAmount), 0);
    
    const gstByRate: { [key: string]: { taxable: number; gst: number } } = {};
    filteredBills.forEach(bill => {
      bill.items.forEach(item => {
        const rate = `${item.gstRate}%`;
        if (!gstByRate[rate]) {
          gstByRate[rate] = { taxable: 0, gst: 0 };
        }
        const itemTaxable = item.total;
        const itemGst = itemTaxable * item.gstRate / 100;
        gstByRate[rate].taxable += itemTaxable;
        gstByRate[rate].gst += itemGst;
      });
    });

    return {
      gstCollected,
      taxableAmount,
      gstByRate
    };
  }, [filteredBills]);

  // Profit Analysis
  const profitData = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;

    filteredBills.forEach(bill => {
      bill.items.forEach(item => {
        const medicine = medicines.find(m => m.id === item.medicineId);
        if (medicine) {
          totalRevenue += item.total;
          totalCost += medicine.purchasePrice * item.quantity;
        }
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin
    };
  }, [filteredBills, medicines]);

  // Inventory Status
  const inventoryData = useMemo(() => {
    const totalMedicines = medicines.length;
    const lowStockCount = getLowStockMedicines().length;
    const expiringCount = getExpiringMedicines(30).length;
    const totalStockValue = medicines.reduce((sum, med) => sum + (med.stockQuantity * med.sellingPrice), 0);

    // Category wise stock
    const categoryStock: { [key: string]: number } = {};
    medicines.forEach(med => {
      const category = med.category || 'Other';
      categoryStock[category] = (categoryStock[category] || 0) + med.stockQuantity;
    });

    return {
      totalMedicines,
      lowStockCount,
      expiringCount,
      totalStockValue,
      categoryStock
    };
  }, [medicines, getLowStockMedicines, getExpiringMedicines]);

  // Chart configurations
  const salesChartData = {
    labels: Object.keys(salesData.dailySales),
    datasets: [
      {
        label: 'Daily Sales',
        data: Object.values(salesData.dailySales),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const paymentModeData = {
    labels: Object.keys(salesData.paymentModes),
    datasets: [
      {
        data: Object.values(salesData.paymentModes),
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(147, 51, 234, 0.5)',
          'rgba(249, 115, 22, 0.5)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(147, 51, 234)',
          'rgb(249, 115, 22)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryStockData = {
    labels: Object.keys(inventoryData.categoryStock),
    datasets: [
      {
        data: Object.values(inventoryData.categoryStock),
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(249, 115, 22, 0.5)',
          'rgba(147, 51, 234, 0.5)',
          'rgba(239, 68, 68, 0.5)',
          'rgba(107, 114, 128, 0.5)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(147, 51, 234)',
          'rgb(239, 68, 68)',
          'rgb(107, 114, 128)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'sales':
        return (
          <div className="space-y-6">
            {/* Sales Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-green-600">₹{salesData.totalSales.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-blue-600">{salesData.totalTransactions}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Items Sold</p>
                    <p className="text-2xl font-bold text-purple-600">{salesData.totalItems}</p>
                  </div>
                  <Package className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Transaction</p>
                    <p className="text-2xl font-bold text-orange-600">₹{salesData.averageTransaction.toFixed(0)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Daily Sales Trend</h3>
                <Bar data={salesChartData} options={chartOptions} />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                <Doughnut data={paymentModeData} options={chartOptions} />
              </div>
            </div>
          </div>
        );

      case 'gst':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">GST Collected</p>
                <p className="text-2xl font-bold text-blue-600">₹{gstData.gstCollected.toLocaleString()}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Taxable Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{gstData.taxableAmount.toLocaleString()}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Effective Tax Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {gstData.taxableAmount > 0 ? ((gstData.gstCollected / gstData.taxableAmount) * 100).toFixed(2) : 0}%
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">GST Breakdown by Rate</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">GST Rate</th>
                      <th className="text-right py-2">Taxable Amount</th>
                      <th className="text-right py-2">GST Amount</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gstData.gstByRate).map(([rate, data]) => (
                      <tr key={rate} className="border-b">
                        <td className="py-2">{rate}</td>
                        <td className="text-right py-2">₹{data.taxable.toLocaleString()}</td>
                        <td className="text-right py-2">₹{data.gst.toLocaleString()}</td>
                        <td className="text-right py-2 font-semibold">₹{(data.taxable + data.gst).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'profit':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">₹{profitData.totalRevenue.toLocaleString()}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-red-600">₹{profitData.totalCost.toLocaleString()}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Gross Profit</p>
                <p className="text-2xl font-bold text-green-600">₹{profitData.grossProfit.toLocaleString()}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-600">{profitData.profitMargin.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Medicines</p>
                    <p className="text-2xl font-bold text-blue-600">{inventoryData.totalMedicines}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-red-600">{inventoryData.lowStockCount}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-orange-600">{inventoryData.expiringCount}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stock Value</p>
                    <p className="text-2xl font-bold text-green-600">₹{inventoryData.totalStockValue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Stock by Category</h3>
              <Doughnut data={categoryStockData} options={chartOptions} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and analytics</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Report Type */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sales">Sales Report</option>
              <option value="gst">GST Report</option>
              <option value="profit">Profit & Loss</option>
              <option value="inventory">Inventory Report</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </>
          )}
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
}