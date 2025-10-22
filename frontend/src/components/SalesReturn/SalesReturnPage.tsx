import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RefreshCw, PlusCircle } from 'lucide-react';
import SalesReturnModal from './SalesReturnModal';

export const SalesReturnPage: React.FC = () => {
  const { bills } = useApp();
  const [showSalesReturn, setShowSalesReturn] = useState(false);

  // Filter and sort return bills (those starting with PURCHASE- or CUSTOMER-)
  const returnBills = bills.filter(bill => 
    bill.billNumber.startsWith('PURCHASE-') || bill.billNumber.startsWith('CUSTOMER-')
  );
  
  // Sort return bills by date (newest first)
  const sortedReturnBills = [...returnBills].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <RefreshCw className="mr-3 text-orange-600" />
            Sales Return
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSalesReturn(true)}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Process Return
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            Recent Bills Available for Return
          </h3>
          
          {sortedReturnBills.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bills available for return</p>
              <p className="text-sm text-gray-400 mt-2">Create some bills first to process returns</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedReturnBills.slice(0, 6).map((bill) => (
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
                  <div className="mt-3 text-xs text-gray-400">
                    {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {sortedReturnBills.length > 6 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                View All Bills ({sortedReturnBills.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sales Return Modal */}
      {showSalesReturn && (
        <SalesReturnModal
          isOpen={showSalesReturn}
          onClose={() => setShowSalesReturn(false)}
        />
      )}
    </div>
  );
};

export default SalesReturnPage;
