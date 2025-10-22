import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseEntry, Product as ProductType } from '../../types';

interface SalesReturnProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesReturn = (_props: SalesReturnProps) => {
  const { products, purchases, addStockTransaction, updateProduct, addBill, showSuccess, showError } = useApp();
  const [activeTab, setActiveTab] = useState<'purchase' | 'customer'>('purchase');
  const [selectedPurchase, setSelectedPurchase] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [returnQuantity, setReturnQuantity] = useState<number>(0);
  const [returnReason, setReturnReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePurchaseReturn = () => {
    if (!selectedPurchase || returnQuantity <= 0) {
      showError('Please select a purchase and enter valid quantity');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const purchase = purchases.find((p: PurchaseEntry) => p.id === selectedPurchase);
      if (!purchase) {
        showError('Purchase not found');
        return;
      }

      // Update stock for each item in the purchase
      purchase.items.forEach((item: { productId: string; productName: string; quantity: number }) => {
        const product = products.find((p: ProductType) => p.id === item.productId);
        if (product) {
          updateProduct(item.productId, {
            stockQuantity: product.stockQuantity - returnQuantity
          });
        }

        // Add stock transaction for return
        addStockTransaction({
          type: 'return',
          productId: item.productId,
          productName: item.productName,
          quantity: -returnQuantity,
          date: new Date().toISOString().split('T')[0],
          reference: `RET-${purchase.invoiceNo}`,
          notes: `Return to supplier: ${purchase.supplierName} - ${returnReason}`
        });
      });

      const newBill = {
        billNumber: `PURCHASE-${new Date().toISOString()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        items: purchase.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          batchNo: item.batchNo,
          quantity: returnQuantity,
          mrp: item.purchasePrice,
          sellingPrice: item.purchasePrice,
          discount: 0,
          gstRate: 0,
          total: returnQuantity * item.purchasePrice,
        })),
        subtotal: returnQuantity * purchase.items.reduce((acc, item) => acc + item.purchasePrice, 0),
        totalDiscount: 0,
        gstAmount: 0,
        totalAmount: returnQuantity * purchase.items.reduce((acc, item) => acc + item.purchasePrice, 0),
        paymentMode: 'cash' as const,
        paidAmount: 0,
        changeAmount: 0,
        staffId: '1', // Assuming a default staff ID
        staffName: 'Admin User', // Assuming a default staff name
      };
      addBill(newBill);
      showSuccess('Purchase return processed successfully');
      setSelectedPurchase('');
      setReturnQuantity(0);
      setReturnReason('');
    } catch (error) {
      showError('Failed to process purchase return');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerReturn = () => {
    if (!selectedProduct || returnQuantity <= 0) {
      showError('Please select a product and enter valid quantity');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const product = products.find((p: ProductType) => p.id === selectedProduct);
      if (!product) {
        showError('Product not found');
        return;
      }

      if (product.stockQuantity < returnQuantity) {
        showError('Insufficient stock for return');
        return;
      }

      // Update product stock
      updateProduct(selectedProduct, {
        stockQuantity: product.stockQuantity + returnQuantity
      });

      // Add stock transaction for customer return
      addStockTransaction({
        type: 'return',
        productId: selectedProduct,
        productName: product.name,
        quantity: returnQuantity,
        date: new Date().toISOString().split('T')[0],
        reference: 'CUST-RET',
        notes: `Customer return - ${returnReason}`
      });

      // Create a new bill for customer return
      const newBill = {
        billNumber: `CUSTOMER-${new Date().toISOString()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        items: [{
          productId: selectedProduct,
          productName: product.name,
          batchNo: product.batchNo || '',
          quantity: returnQuantity,
          mrp: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          discount: 0,
          gstRate: 0,
          total: returnQuantity * product.sellingPrice,
        }],
        subtotal: returnQuantity * product.sellingPrice,
        totalDiscount: 0,
        gstAmount: 0,
        totalAmount: returnQuantity * product.sellingPrice,
        paymentMode: 'cash' as const,
        paidAmount: 0,
        changeAmount: 0,
        staffId: '1', // Assuming a default staff ID
        staffName: 'Admin User', // Assuming a default staff name
      };
      addBill(newBill);

      showSuccess('Customer return processed successfully');
      setSelectedProduct('');
      setReturnQuantity(0);
      setReturnReason('');
    } catch (error) {
      showError('Failed to process customer return');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales Return</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'purchase'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('purchase')}
          >
            Purchase Return
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'customer'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('customer')}
          >
            Customer Return
          </button>
        </div>

        {/* Purchase Return Form */}
        {activeTab === 'purchase' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Purchase Bill
              </label>
              <select
                value={selectedPurchase}
                onChange={(e) => setSelectedPurchase(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a purchase bill</option>
                {purchases.map((purchase) => (
                  <option key={purchase.id} value={purchase.id}>
                    {purchase.invoiceNo} - {purchase.supplierName} - {purchase.date}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Return
              </label>
              <input
                type="number"
                min="1"
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Return
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter reason for return"
              />
            </div>

            <button
              onClick={handlePurchaseReturn}
              disabled={isSubmitting}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Process Purchase Return'}
            </button>
          </div>
        )}

        {/* Customer Return Form */}
        {activeTab === 'customer' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.batchNo || 'N/A'} (Stock: {product.stockQuantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Return
              </label>
              <input
                type="number"
                min="1"
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Return
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter reason for return"
              />
            </div>

            <button
              onClick={handleCustomerReturn}
              disabled={isSubmitting}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Process Customer Return'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReturn;
