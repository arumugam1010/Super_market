import React from 'react';
import { Bill, Customer } from '../../types';
import { X, Eye } from 'lucide-react';
import { generatePDF } from '../../utils/pdfGenerator';

interface BillViewProps {
  bill: Bill;
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BillView: React.FC<BillViewProps> = ({
  bill,
  customer,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const returnItems = bill.returnItems || [];
  const returnAmount = bill.returnAmount || 0;
  const subtotal = bill.subtotal;
  const finalTotal = bill.totalAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            Bill View
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 font-mono text-sm">
          {/* Bill Header */}
          <div className="text-center mb-4">
            <div className="border-b-2 border-black pb-2 mb-2">
              <h2 className="text-xl font-bold">My Shop Billing</h2>
            </div>
            <div className="border-b-2 border-black pb-2">
              <p>Bill No: {bill.billNumber}</p>
              <p>Date: {new Date(bill.date).toLocaleDateString()}</p>
              <p>Time: {bill.time}</p>
              <p>Customer: {customer?.name || 'Walk-in Customer'}</p>
              {customer?.phone && <p>Phone: {customer.phone}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <div className="grid grid-cols-4 gap-2 border-b border-black pb-1 mb-2">
              <div className="font-bold">Item</div>
              <div className="font-bold text-center">Qty</div>
              <div className="font-bold text-center">Price</div>
              <div className="font-bold text-right">Total</div>
            </div>
            
            {bill.items.map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 py-1">
                <div>{item.productName}</div>
                <div className="text-center">{item.quantity}</div>
                <div className="text-center">₹{item.sellingPrice.toFixed(2)}</div>
                <div className="text-right">₹{(item.sellingPrice * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Return Items Section */}
          {returnItems.length > 0 && (
            <div className="mb-4">
              <div className="border-b border-black pb-1 mb-2">
                <h3 className="font-bold">Return Items</h3>
              </div>
              
              {returnItems.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 py-1 text-red-600">
                  <div>{item.productName}</div>
                  <div className="text-center">-{item.quantity}</div>
                  <div className="text-center">₹{item.sellingPrice.toFixed(2)}</div>
                  <div className="text-right">-₹{Math.abs(item.total).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="border-t-2 border-black pt-2">
            <div className="flex justify-between mb-1">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            
            {returnAmount > 0 && (
              <div className="flex justify-between mb-1 text-red-600">
                <span>Return Amount:</span>
                <span>-₹{returnAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t border-black pt-1 mt-2">
              <div className="flex justify-between font-bold">
                <span>Final Total:</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 border-t-2 border-black pt-2">
            <p className="font-bold">Thank you – Visit Again!</p>
          </div>
        </div>

        <div className="p-4 border-t flex space-x-2">
          <button
            onClick={() => {
              generatePDF(bill, customer);
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Print PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
