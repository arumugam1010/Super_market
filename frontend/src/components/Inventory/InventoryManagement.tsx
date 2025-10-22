import { useState } from 'react';
import { 
  RefreshCw,
  History,
  Plus,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

export default function InventoryManagement() {
  const { 
    medicines, 
    updateMedicine,
    addStockTransaction,
    suppliers,
    purchases,
    addPurchase
  } = useApp();

  const [showStockUpdate, setShowStockUpdate] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [stockUpdateData, setStockUpdateData] = useState({
    type: 'adjustment' as 'adjustment' | 'purchase' | 'return',
    quantity: 0
  });

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasePreview, setPurchasePreview] = useState<any | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    items: [
      { medicineId: '', quantity: 0, purchasePrice: 0 }
    ] as Array<{ medicineId: string; quantity: number; purchasePrice: number }>
  });

  const handleStockUpdate = () => {
    if (!selectedMedicine || stockUpdateData.quantity === 0) {
      useApp().showError('Please select a medicine and enter quantity', 'Validation Error');
      return;
    }

    const newStock = selectedMedicine.stockQuantity + stockUpdateData.quantity;
    if (newStock < 0) {
      useApp().showError('Cannot reduce stock below zero', 'Stock Error');
      return;
    }

    // Update medicine stock
    updateMedicine(selectedMedicine.id, { stockQuantity: newStock });

    // Add stock transaction
    addStockTransaction({
      type: stockUpdateData.type,
      medicineId: selectedMedicine.id,
      medicineName: selectedMedicine.name,
      quantity: stockUpdateData.quantity,
      date: new Date().toISOString().split('T')[0],
      reference: `ADJ-${Date.now()}`,
    });

    // Reset form
    setShowStockUpdate(false);
    setSelectedMedicine(null);
    
    useApp().showSuccess('Stock updated successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage stock and supplier purchase bills</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowStockUpdate(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Stock</span>
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier Bill</span>
          </button>
        </div>
      </div>

      {/* Add Supplier Bill Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add Supplier Bill</h2>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ×
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const supplier = suppliers.find(s => s.id === purchaseForm.supplierId);
              if (!supplier) {
                return useApp().showError('Please select a supplier', 'Validation Error');
              }
              if (!purchaseForm.invoiceNo) {
                return useApp().showError('Please enter invoice number', 'Validation Error');
              }
              if (purchaseForm.items.length === 0 || purchaseForm.items.some(i => !i.medicineId || i.quantity <= 0 || i.purchasePrice <= 0)) {
                return useApp().showError('Please add at least one valid item', 'Validation Error');
              }

              const items = purchaseForm.items.map(i => {
                const med = medicines.find(m => m.id === i.medicineId)!;
                return {
                  medicineId: med.id,
                  medicineName: med.name,
                  quantity: i.quantity,
                  purchasePrice: i.purchasePrice,
                  batchNo: med.batchNo,
                  expiryDate: med.expiryDate
                };
              });

              const totalAmount = items.reduce((sum, it) => sum + it.quantity * it.purchasePrice, 0);

              addPurchase({
                supplierName: supplier.name,
                invoiceNo: purchaseForm.invoiceNo,
                date: purchaseForm.date,
                items,
                totalAmount
              });

              setShowPurchaseModal(false);
              setPurchaseForm({ supplierId: '', invoiceNo: '', date: new Date().toISOString().split('T')[0], items: [{ medicineId: '', quantity: 0, purchasePrice: 0 }] });
              useApp().showSuccess('Purchase bill added');
            }} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={purchaseForm.supplierId}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
                  <input
                    type="text"
                    value={purchaseForm.invoiceNo}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={purchaseForm.date}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Items</label>
                  <button
                    type="button"
                    onClick={() => setPurchaseForm({ ...purchaseForm, items: [...purchaseForm.items, { medicineId: '', quantity: 0, purchasePrice: 0 }] })}
                    className="text-blue-600 text-sm hover:underline flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {purchaseForm.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <select
                        value={item.medicineId}
                        onChange={(e) => {
                          const items = [...purchaseForm.items];
                          items[idx] = { ...items[idx], medicineId: e.target.value };
                          setPurchaseForm({ ...purchaseForm, items });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Item name</option>
                        {medicines.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        placeholder="Quantity"
                        value={item.quantity || ''}
                        onChange={(e) => {
                          const items = [...purchaseForm.items];
                          items[idx] = { ...items[idx], quantity: parseInt(e.target.value) || 0 };
                          setPurchaseForm({ ...purchaseForm, items });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Purchase price"
                        value={item.purchasePrice || ''}
                        onChange={(e) => {
                          const items = [...purchaseForm.items];
                          items[idx] = { ...items[idx], purchasePrice: parseFloat(e.target.value) || 0 };
                          setPurchaseForm({ ...purchaseForm, items });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Preview Modal */}
      {purchasePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Purchase Bill</h2>
              <button
                onClick={() => setPurchasePreview(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 mb-4">
              <p className="font-medium">{purchasePreview.supplierName}</p>
              <p className="text-sm text-gray-600">Invoice: {purchasePreview.invoiceNo}</p>
              <p className="text-sm text-gray-600">Date: {format(new Date(purchasePreview.date), 'MMM d, yyyy')}</p>
            </div>
            <div className="border border-gray-200 rounded-lg">
              <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                <div className="col-span-2">Item</div>
                <div>Qty</div>
                <div className="text-right">Price</div>
              </div>
              <div className="divide-y divide-gray-200">
                {purchasePreview.items.map((it: any, i: number) => (
                  <div key={i} className="grid grid-cols-4 gap-2 px-4 py-2 text-sm">
                    <div className="col-span-2">{it.medicineName}</div>
                    <div>{it.quantity}</div>
                    <div className="text-right">₹{(it.quantity * it.purchasePrice).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-medium">Total</span>
                <span className="font-semibold">₹{purchasePreview.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setPurchasePreview(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Purchase Bills List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Supplier Purchase Bills</h3>
        {purchases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No purchase bills yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{p.supplierName}</p>
                  <p className="text-sm text-gray-600">Invoice: {p.invoiceNo}</p>
                  <p className="text-xs text-gray-500">{format(new Date(p.date), 'MMM d, yyyy')}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-semibold text-gray-900">₹{p.totalAmount.toLocaleString()}</p>
                  <button
                    onClick={() => setPurchasePreview(p)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {showStockUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Update Stock</h2>
              <button
                onClick={() => {
                  setShowStockUpdate(false);
                  setSelectedMedicine(null);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                ×
              </button>
            </div>

            {selectedMedicine && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedMedicine.name}</p>
                <p className="text-sm text-gray-600">Current Stock: {selectedMedicine.stockQuantity} units</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleStockUpdate(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={stockUpdateData.type}
                  onChange={(e) => setStockUpdateData({...stockUpdateData, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="adjustment">Stock Adjustment</option>
                  <option value="purchase">Purchase Entry</option>
                  <option value="return">Customer Return</option>
                </select>
              </div>

              {!selectedMedicine && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Medicine
                  </label>
                  <select
                    value={selectedMedicine?.id || ''}
                    onChange={(e) => {
                      const medicine = medicines.find(m => m.id === e.target.value);
                      if (medicine) setSelectedMedicine(medicine);
                    }}
                    className="w-full px-3 py-2 border border-gra y-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a medicine</option>
                    {medicines.map(medicine => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.name} - {medicine.batchNo} (Stock: {medicine.stockQuantity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (use negative for reduction)
                </label>
                <input
                  type="number"
                  value={stockUpdateData.quantity}
                  onChange={(e) => setStockUpdateData({...stockUpdateData, quantity: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowStockUpdate(false);
                    setSelectedMedicine(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}