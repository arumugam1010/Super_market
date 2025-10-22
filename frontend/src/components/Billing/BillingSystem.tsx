import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Customer, Bill, BillItem } from '../../types';
import { Search, Plus, Minus, ShoppingCart, User, Receipt, Eye, History, FileText, PlusCircle, RotateCcw } from 'lucide-react';
import { generatePDF } from '../../utils/pdfGenerator';
import { ReturnModal } from './ReturnModal';
import { BillView } from './BillView';

export const BillingSystem: React.FC = () => {
  const { products, customers, bills, addBill, addCustomer } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>({
    id: 'walk-in',
    name: 'Walk-in Customer',
    phone: 'N/A',
    address: '',
    totalPurchases: 0,
    registrationDate: new Date().toISOString()
  });
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [returnItems, setReturnItems] = useState<BillItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi' | 'wallet'>('cash');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showBillConfirmation, setShowBillConfirmation] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showCustomerHistory, setShowCustomerHistory] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showBillViewModal, setShowBillViewModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [isCreatingBill, setIsCreatingBill] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.batchNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToBill = (product: Product) => {
    const existingItem = billItems.find(item => item.productId === product.id);
    if (existingItem) {
      setBillItems(billItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setBillItems([...billItems, {
        productId: product.id,
        productName: product.name,
        batchNo: product.batchNo || '',
        quantity: 1,
        mrp: product.sellingPrice,
        sellingPrice: product.sellingPrice,
        discount: 0,
        gstRate: 18,
        total: product.sellingPrice
      }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setBillItems(billItems.filter(item => item.productId !== productId));
    } else {
      setBillItems(billItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };



  const calculateItemTotal = (item: BillItem) => {
    const subtotal = item.sellingPrice * item.quantity;
    const discount = (subtotal * item.discount) / 100;
    return subtotal - discount;
  };

  const calculateBillTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const billDiscount = (subtotal * discountPercentage) / 100;
    const afterDiscount = subtotal - billDiscount;
    const gstAmount = (afterDiscount * gstPercentage) / 100;
    const returnAmount = returnItems.reduce((sum, item) => sum + Math.abs(item.total), 0);
    const finalTotal = afterDiscount + gstAmount - returnAmount;
    const totalSavings = billItems.reduce((sum, item) => {
      const itemSubtotal = item.sellingPrice * item.quantity;
      const itemDiscount = (itemSubtotal * item.discount) / 100;
      return sum + itemDiscount;
    }, 0) + billDiscount;

    return {
      subtotal,
      billDiscount,
      afterDiscount,
      gstAmount,
      returnAmount,
      finalTotal,
      totalSavings
    };
  };

  const createNewCustomer = () => {
    if (newCustomer.name && newCustomer.phone) {
      const customer: Customer = {
        id: Date.now().toString(),
        name: newCustomer.name,
        phone: newCustomer.phone,
        address: newCustomer.address,
        totalPurchases: 0,
        registrationDate: new Date().toISOString()
      };
      addCustomer(customer);
      setSelectedCustomer(customer);
      setNewCustomer({ name: '', phone: '', address: '' });
      setShowNewCustomer(false);
    }
  };

  const processBill = () => {
    if (billItems.length === 0 || !selectedCustomer) return;

    const totals = calculateBillTotals();
    const now = new Date();
    const bill: Omit<Bill, 'id'> = {
      billNumber: `BILL-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      customerId: selectedCustomer.id === 'walk-in' ? undefined : selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: billItems,
      returnItems: returnItems.length > 0 ? returnItems : undefined,
      subtotal: totals.subtotal,
      totalDiscount: totals.billDiscount,
      gstAmount: totals.gstAmount,
      returnAmount: totals.returnAmount > 0 ? totals.returnAmount : undefined,
      totalAmount: totals.finalTotal,
      paymentMode,
      paidAmount: totals.finalTotal,
      changeAmount: 0,
      staffId: 'current-user',
      staffName: 'Current User'
    };

    addBill(bill);
    
    // Store the current bill for confirmation popup
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString()
    };
    setCurrentBill(newBill);
    setShowBillConfirmation(true);
    
    // Reset form
    setBillItems([]);
    setDiscountPercentage(0);
    setSelectedCustomer({
      id: 'walk-in',
      name: 'Walk-in Customer',
      phone: 'N/A',
      address: '',
      totalPurchases: 0,
      registrationDate: new Date().toISOString()
    });
    setShowPreview(false);
  };

  const getCustomerHistory = () => {
    if (!selectedCustomer) return { bills: [], products: [] };

    const customerBills = bills.filter(bill => bill.customerId === selectedCustomer.id);
    const purchasedProducts = customerBills.flatMap(bill => bill.items);

    return { bills: customerBills, products: purchasedProducts };
  };

  const totals = calculateBillTotals();
  const { bills: customerBills, products: customerProducts } = getCustomerHistory();

  const startNewBill = () => {
    setIsCreatingBill(true);
    // Reset form state
    setBillItems([]);
    setDiscountPercentage(0);
    setSelectedCustomer({
      id: 'walk-in',
      name: 'Walk-in Customer',
      phone: 'N/A',
      address: '',
      totalPurchases: 0,
      registrationDate: new Date().toISOString()
    });
  };

  const cancelBillCreation = () => {
    setIsCreatingBill(false);
    // Reset form state
    setBillItems([]);
    setReturnItems([]);
    setDiscountPercentage(0);
    setSelectedCustomer({
      id: 'walk-in',
      name: 'Walk-in Customer',
      phone: 'N/A',
      address: '',
      totalPurchases: 0,
      registrationDate: new Date().toISOString()
    });
  };

  const handleReturnItems = (items: BillItem[]) => {
    setReturnItems(items);
  };

  // Filter out return bills (those starting with PURCHASE- or CUSTOMER-)
  const regularBills = bills.filter(bill => 
    !bill.billNumber.startsWith('PURCHASE-') && !bill.billNumber.startsWith('CUSTOMER-')
  );
  
  // Sort bills by date (newest first)
  const sortedBills = [...regularBills].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  if (!isCreatingBill) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <ShoppingCart className="mr-3 text-blue-600" />
              Billing System
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={startNewBill}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add New Bill
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2" />
              Recent Bills
            </h3>
            
            {sortedBills.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bills created yet</p>
                <p className="text-sm text-gray-400 mt-2">Click "Add New Bill" to create your first bill</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedBills.slice(0, 6).map((bill) => (
                  <div 
                    key={bill.id} 
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">Bill #{bill.billNumber}</h4>
                        <p className="text-sm text-gray-600">{bill.customerName}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">₹{bill.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>{new Date(bill.date).toLocaleDateString()} at {bill.time}</p>
                      <p className="capitalize">{bill.paymentMode}</p>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-xs text-gray-400">
                        {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedBill(bill);
                          setShowBillViewModal(true);
                        }}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {sortedBills.length > 6 && (
              <div className="mt-4 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  View All Bills ({sortedBills.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="mr-3 text-blue-600" />
            Create New Bill
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Return
            </button>
            <button
              onClick={cancelBillCreation}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Product Selection */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, brand, or batch..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => addToBill(product)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{product.name}</h4>
                      {product.brand && (
                        <p className="text-sm text-blue-600">{product.brand}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Batch: {product.batchNo} | Stock: {product.stockQuantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">₹{product.sellingPrice}</p>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Bill */}
          <div className="space-y-4">
            {/* Customer Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <User className="mr-2" />
                Customer
              </h3>
              
              {selectedCustomer ? (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                  </div>
                  <div className="flex space-x-2">
                    {selectedCustomer.id !== 'walk-in' && (
                      <button
                        onClick={() => setShowCustomerHistory(true)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
                      >
                        <History className="h-4 w-4 mr-1" />
                        History
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) => {
                      if (e.target.value === 'walk-in') {
                        setSelectedCustomer({
                          id: 'walk-in',
                          name: 'Walk-in Customer',
                          phone: 'N/A',
                          address: '',
                          totalPurchases: 0,
                          registrationDate: new Date().toISOString()
                        });
                      } else {
                        const customer = customers.find(c => c.id === e.target.value);
                        setSelectedCustomer(customer || null);
                      }
                    }}
                  >
                    <option value="">Select Customer</option>
                    <option value="walk-in" selected>Walk-in Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowNewCustomer(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add New Customer
                  </button>
                </div>
              )}
            </div>

            {/* Bill Items */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Bill Items</h3>
              
              {billItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items added</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {billItems.map((item) => (
                    <div key={item.productId} className="bg-white p-3 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                        <h4 className="font-medium">{item.productName}</h4>
                        {item.batchNo && (
                          <p className="text-sm text-blue-600">Batch: {item.batchNo}</p>
                        )}
                        </div>
                        <p className="font-semibold">₹{calculateItemTotal(item).toFixed(2)}</p>
                      </div>

                      <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
  {/* ➖ Decrease */}
  <button
    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
    className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
  >
    <Minus className="h-3 w-3" />
  </button>

  {/* 🔢 Editable Input instead of span */}
  <input
    type="number"
    value={item.quantity}
    onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
    className="w-14 text-center px-2 py-1 bg-gray-100 rounded border border-gray-300"
    min="0"
  />

  {/* ➕ Increase */}
  <button
    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
    className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
  >
    <Plus className="h-3 w-3" />
  </button>
</div>


                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Return Items Section */}
            {returnItems && returnItems.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Return Items
                </h3>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {returnItems.map((item) => (
                    <div key={item.productId} className="bg-white p-3 rounded-md border border-red-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-red-800">{item.productName}</h4>
                          <p className="text-sm text-red-600">Qty: -{item.quantity}</p>
                        </div>
                        <p className="font-semibold text-red-600">-₹{Math.abs(item.total).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bill Summary */}
            {billItems.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Bill Discount:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                      />
                      <span className="text-sm">%</span>
                      <span>₹{totals.billDiscount.toFixed(2)}</span>
                    </div> 
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>GST:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                        value={gstPercentage}
                        onChange={(e) => setGstPercentage(Number(e.target.value))}
                      />
                      <span className="text-sm">%</span>
                      <span>₹{totals.gstAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {totals.returnAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Return Amount:</span>
                      <span>-₹{totals.returnAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Final Total:</span>
                      <span>₹{totals.finalTotal.toFixed(2)}</span>
                    </div>
                    {totals.totalSavings > 0 && (
                      <p className="text-green-600 text-sm text-right">
                        You have saved ₹{totals.totalSavings.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="wallet">Wallet</option>
                  </select>

                  <button
                    onClick={processBill}
                    disabled={!selectedCustomer}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Process Bill
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      {showNewCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Customer</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              />
              <textarea
                placeholder="Address (Optional)"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
              />
              <div className="flex space-x-2">
                <button
                  onClick={createNewCustomer}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Customer
                </button>
                <button
                  onClick={() => setShowNewCustomer(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Bill Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="border-b pb-2">
                <p><strong>Customer:</strong> {selectedCustomer?.name}</p>
                <p><strong>Phone:</strong> {selectedCustomer?.phone}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-1">
                {billItems.map(item => (
                  <div key={item.productId} className="flex justify-between">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>₹{calculateItemTotal(item).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount ({discountPercentage}%):</span>
                  <span>-₹{totals.billDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({gstPercentage}%):</span>
                  <span>₹{totals.gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Final Total:</span>
                  <span>₹{totals.finalTotal.toFixed(2)}</span>
                </div>
                {totals.totalSavings > 0 && (
                  <p className="text-green-600 text-center">
                    You have saved ₹{totals.totalSavings.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => {
                const bill: Bill = {
                  id: `BILL-${Date.now()}`,
                  billNumber: `BILL-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toTimeString().split(' ')[0],
                  customerId: selectedCustomer!.id === 'walk-in' ? undefined : selectedCustomer!.id,
                  customerName: selectedCustomer!.name,
                  items: billItems,
                  subtotal: totals.subtotal,
                  totalDiscount: totals.billDiscount,
                  gstAmount: totals.gstAmount,
                  totalAmount: totals.finalTotal,
                  paymentMode,
                  paidAmount: totals.finalTotal,
                  changeAmount: 0,
                  staffId: 'current-user',
                  staffName: 'Current User'
                };
                generatePDF(bill, selectedCustomer);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Print PDF
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer History Modal */}
      {showCustomerHistory && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-2/3 max-w-4xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Purchase History - {selectedCustomer.name}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Past Bills</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerBills.map(bill => (
                    <div key={bill.id} className="p-2 bg-gray-50 rounded">
                      <p className="font-medium">Bill #{bill.billNumber}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(bill.date).toLocaleDateString()} - ₹{bill.totalAmount.toFixed(2)}
                    </p>
                    </div>
                  ))}
                  {customerBills.length === 0 && (
                    <p className="text-gray-500">No previous bills</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Previously Purchased Products</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerProducts.map((item, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} - ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {customerProducts.length === 0 && (
                    <p className="text-gray-500">No previous purchases</p>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowCustomerHistory(false)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bill Confirmation Modal */}
      {showBillConfirmation && currentBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-green-600">Bill Created Successfully!</h3>
            <div className="space-y-2 text-sm">
              <div className="border-b pb-2">
                <p><strong>Bill No:</strong> {currentBill.billNumber}</p>
                <p><strong>Customer:</strong> {currentBill.customerName}</p>
                <p><strong>Date:</strong> {new Date(currentBill.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {currentBill.time}</p>
              </div>
              
              <div className="space-y-1">
                {currentBill.items.map(item => (
                  <div key={item.productId} className="flex justify-between">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>₹{(item.sellingPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span>₹{currentBill.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="capitalize">{currentBill.paymentMode}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => {
                  generatePDF(currentBill, selectedCustomer);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Print Bill
              </button>
              <button
                onClick={() => {
                  setShowBillConfirmation(false);
                  setIsCreatingBill(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      <ReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onReturn={handleReturnItems}
        products={products}
      />

      {/* Bill View Modal */}
      {selectedBill && (
        <BillView
          bill={selectedBill}
          customer={selectedBill.customerId ? customers.find(c => c.id === selectedBill.customerId) || null : null}
          isOpen={showBillViewModal}
          onClose={() => {
            setShowBillViewModal(false);
            setSelectedBill(null);
          }}
        />
      )}
    </div>
  );
};
