import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseEntry, Medicine as MedicineType } from '../../types';
import { X } from 'lucide-react';

interface SalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesReturnModal: React.FC<SalesReturnModalProps> = ({ isOpen, onClose }) => {
  const { medicines, purchases, addStockTransaction, updateMedicine, addBill, showSuccess, showError } = useApp();
  const [activeTab, setActiveTab] = useState<'purchase' | 'customer'>('purchase');
  const [selectedPurchase, setSelectedPurchase] = useState<string>('');
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
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
      purchase.items.forEach((item: { medicineId: string; medicineName: string; quantity: number }) => {
        const medicine = medicines.find((m: MedicineType) => m.id === item.medicineId);
        if (medicine) {
          updateMedicine(item.medicineId, {
            stockQuantity: medicine.stockQuantity - item.quantity
          });
        }

        // Add stock transaction for return
        addStockTransaction({
          type: 'return',
          medicineId: item.medicineId,
          medicineName: item.medicineName,
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
          medicineId: item.medicineId,
          medicineName: item.medicineName,
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
        staffId: '1',
        staffName: 'Admin User',
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
    if (!selectedMedicine || returnQuantity <= 0) {
      showError('Please select a medicine and enter valid quantity');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const medicine = medicines.find((m: MedicineType) => m.id === selectedMedicine);
      if (!medicine) {
        showError('Medicine not found');
        return;
      }

      if (medicine.stockQuantity < returnQuantity) {
        showError('Insufficient stock for return');
        return;
      }

      // Update medicine stock
      updateMedicine(selectedMedicine, {
        stockQuantity: medicine.stockQuantity + returnQuantity
      });

      // Add stock transaction for customer return
      addStockTransaction({
        type: 'return',
        medicineId: selectedMedicine,
        medicineName: medicine.name,
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
          medicineId: selectedMedicine,
          medicineName: medicine.name,
          batchNo: medicine.batchNo,
          quantity: returnQuantity,
          mrp: medicine.mrp,
          sellingPrice: medicine.sellingPrice,
          discount: 0,
          gstRate: 0,
          total: returnQuantity * medicine.sellingPrice,
        }],
        subtotal: returnQuantity * medicine.sellingPrice,
        totalDiscount: 0,
        gstAmount: 0,
        totalAmount: returnQuantity * medicine.sellingPrice,
        paymentMode: 'cash' as const,
        paidAmount: 0,
        changeAmount: 0,
        staffId: '1',
        staffName: 'Admin User',
      };
      addBill(newBill);

      showSuccess('Customer return processed successfully');
      setSelectedMedicine('');
      setReturnQuantity(0);
      setReturnReason('');
    } catch (error) {
      showError('Failed to process customer return');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sales Return</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
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
                Select Medicine
              </label>
              <select
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name} - {medicine.batchNo} (Stock: {medicine.stockQuantity})
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

export default SalesReturnModal;
