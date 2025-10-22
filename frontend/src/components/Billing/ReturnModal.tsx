import React, { useState } from 'react';
import { BillItem, Product } from '../../types';
import { X, RotateCcw } from 'lucide-react';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturn: (returnItems: BillItem[]) => void;
  products: Product[];
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  onReturn,
  products
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [returnItems, setReturnItems] = useState<BillItem[]>([]);

  const handleAddReturn = () => {
    if (!selectedProduct || returnQuantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Check if return quantity doesn't exceed available stock
    const existingReturn = returnItems.find(item => item.productId === selectedProduct);
    const totalReturned = existingReturn ? existingReturn.quantity + returnQuantity : returnQuantity;

    if (totalReturned > product.stockQuantity) {
      alert('Return quantity cannot exceed available stock');
      return;
    }

    const returnItem: BillItem = {
      productId: product.id,
      productName: product.name,
      batchNo: product.batchNo || '',
      quantity: returnQuantity,
      mrp: product.sellingPrice,
      sellingPrice: product.sellingPrice,
      discount: 0,
      gstRate: 18,
      total: -(product.sellingPrice * returnQuantity),
      isReturn: true
    };

    if (existingReturn) {
      setReturnItems(returnItems.map(item =>
        item.productId === selectedProduct
          ? { ...item, quantity: item.quantity + returnQuantity, total: -(product.sellingPrice * (item.quantity + returnQuantity)) }
          : item
      ));
    } else {
      setReturnItems([...returnItems, returnItem]);
    }

    setSelectedProduct('');
    setReturnQuantity(1);
  };

  const handleRemoveReturn = (productId: string) => {
    setReturnItems(returnItems.filter(item => item.productId !== productId));
  };

  const handleConfirmReturn = () => {
    if (returnItems.length === 0) {
      alert('Please add at least one return item');
      return;
    }
    onReturn(returnItems);
    onClose();
  };

  const getAvailableQuantity = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const existingReturn = returnItems.find(item => item.productId === productId);
    if (!product) return 0;
    return product.stockQuantity - (existingReturn?.quantity || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <RotateCcw className="mr-2 h-5 w-5" />
            Return Items
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Select Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a product...</option>
              {products.map(product => {
                const availableQty = getAvailableQuantity(product.id);
                if (availableQty <= 0) return null;
                return (
                  <option key={product.id} value={product.id}>
                    {product.name} - Stock: {availableQty} - ₹{product.sellingPrice}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Return Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Quantity
            </label>
            <input
              type="number"
              min="1"
              max={selectedProduct ? getAvailableQuantity(selectedProduct) : 1}
              value={returnQuantity}
              onChange={(e) => setReturnQuantity(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Add Return Button */}
          <button
            onClick={handleAddReturn}
            disabled={!selectedProduct || returnQuantity <= 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Add Return Item
          </button>

          {/* Return Items List */}
          {returnItems.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Return Items:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {returnItems.map(item => (
                  <div key={item.productId} className="flex justify-between items-center p-2 bg-red-50 rounded-md">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-red-600">Qty: -{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">₹{Math.abs(item.total).toFixed(2)}</p>
                      <button
                        onClick={() => handleRemoveReturn(item.productId)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Return Amount */}
          {returnItems.length > 0 && (
            <div className="border-t pt-2">
              <div className="flex justify-between font-medium">
                <span>Total Return Amount:</span>
                <span className="text-red-600">
                  ₹{Math.abs(returnItems.reduce((sum, item) => sum + item.total, 0)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReturn}
              disabled={returnItems.length === 0}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              Confirm Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
