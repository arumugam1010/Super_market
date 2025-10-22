import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Medicine, Customer, Supplier, Bill, StockTransaction, PurchaseEntry, Notification } from '../types';

interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  // Medicines
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  getMedicine: (id: string) => Medicine | undefined;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'registrationDate' | 'totalPurchases'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  getCustomer: (id: string) => Customer | undefined;
  
  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'registrationDate'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  getSupplier: (id: string) => Supplier | undefined;
  
  // Bills
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => void;
  getBill: (id: string) => Bill | undefined;
  addReturnToBill: (billId: string, returnItems: BillItem[]) => void;
  
  // Stock
  stockTransactions: StockTransaction[];
  addStockTransaction: (transaction: Omit<StockTransaction, 'id'>) => void;
  
  // Purchase
  purchases: PurchaseEntry[];
  addPurchase: (purchase: Omit<PurchaseEntry, 'id'>) => void;
  
  // Utilities
  generateBillNumber: () => string;
  getLowStockMedicines: () => Medicine[];
  getExpiringMedicines: (days: number) => Medicine[];
  
  // Notifications
  showNotification: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultUsers: User[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User', email: 'admin@medishop.com' }
];

const defaultMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    tabletName: 'Crocin',
    batchNo: 'PC001',
    manufacturer: 'PharmaCorp',
    expiryDate: '2025-12-31',
    hsnCode: '30049099',
    barcode: '1234567890123',
    mrp: 25.00,
    purchasePrice: 18.00,
    sellingPrice: 22.00,
    stockQuantity: 150,
    minStockLevel: 50,
    addedDate: '2024-01-15',
    category: 'Pain Relief',
    tabName: 'Tab 1'
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    tabletName: 'Amoxil',
    batchNo: 'AMX002',
    manufacturer: 'MediLab',
    expiryDate: '2025-06-30',
    hsnCode: '30042000',
    barcode: '2345678901234',
    mrp: 85.00,
    purchasePrice: 65.00,
    sellingPrice: 78.00,
    stockQuantity: 75,
    minStockLevel: 30,
    addedDate: '2024-01-20',
    category: 'Antibiotic',
    tabName: 'Tab 2'
  }
];

interface AppProviderProps {
  children: ReactNode;
  notificationFunctions?: {
    showNotification: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
  };
}

export function AppProvider({ children, notificationFunctions }: AppProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [purchases, setPurchases] = useState<PurchaseEntry[]>([]);


  // Load data from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    const savedMedicines = localStorage.getItem('medicines');
    if (savedMedicines) {
      setMedicines(JSON.parse(savedMedicines));
    } else {
      setMedicines(defaultMedicines);
    }

    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }

    const savedSuppliers = localStorage.getItem('suppliers');
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    }

    const savedBills = localStorage.getItem('bills');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }

    const savedTransactions = localStorage.getItem('stockTransactions');
    if (savedTransactions) {
      setStockTransactions(JSON.parse(savedTransactions));
    }

    const savedPurchases = localStorage.getItem('purchases');
    if (savedPurchases) {
      setPurchases(JSON.parse(savedPurchases));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('stockTransactions', JSON.stringify(stockTransactions));
  }, [stockTransactions]);

  useEffect(() => {
    localStorage.setItem('purchases', JSON.stringify(purchases));
  }, [purchases]);

  const login = (username: string, password: string): boolean => {
    const user = defaultUsers.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const addMedicine = (medicine: Omit<Medicine, 'id'>) => {
    const newMedicine = { ...medicine, id: Date.now().toString() };
    setMedicines(prev => [...prev, newMedicine]);
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const getMedicine = (id: string) => {
    return medicines.find(m => m.id === id);
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'registrationDate' | 'totalPurchases'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      registrationDate: new Date().toISOString(),
      totalPurchases: 0
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const getCustomer = (id: string) => {
    return customers.find(c => c.id === id);
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'registrationDate'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      registrationDate: new Date().toISOString()
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const getSupplier = (id: string) => {
    return suppliers.find(s => s.id === id);
  };

  const generateBillNumber = (): string => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const billsToday = bills.filter(b => b.date === today.toISOString().split('T')[0]).length;
    const sequence = (billsToday + 1).toString().padStart(4, '0');
    return `MS${year}${month}${day}${sequence}`;
  };

  const addBill = (bill: Omit<Bill, 'id'>) => {
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString()
    };
    setBills(prev => [...prev, newBill]);

    // Update medicine stock (subtract sold items)
    bill.items.forEach(item => {
      updateMedicine(item.medicineId, {
        stockQuantity: (getMedicine(item.medicineId)?.stockQuantity || 0) - item.quantity
      });
    });

    // Update medicine stock (add back returned items)
    if (bill.returnItems) {
      bill.returnItems.forEach(item => {
        updateMedicine(item.medicineId, {
          stockQuantity: (getMedicine(item.medicineId)?.stockQuantity || 0) + item.quantity
        });
      });
    }

    // Update customer total purchases
    if (bill.customerId) {
      const customer = getCustomer(bill.customerId);
      if (customer) {
        updateCustomer(bill.customerId, {
          totalPurchases: customer.totalPurchases + bill.totalAmount
        });
      }
    }

    // Add stock transactions for sold items
    bill.items.forEach(item => {
      addStockTransaction({
        type: 'sale',
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        quantity: -item.quantity,
        date: bill.date,
        reference: bill.billNumber
      });
    });

    // Add stock transactions for returned items
    if (bill.returnItems) {
      bill.returnItems.forEach(item => {
        addStockTransaction({
          type: 'return',
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          quantity: item.quantity,
          date: bill.date,
          reference: `RETURN-${bill.billNumber}`,
          notes: `Return from bill ${bill.billNumber}`
        });
      });
    }
  };

  const getBill = (id: string) => {
    return bills.find(b => b.id === id);
  };

  const addReturnToBill = (billId: string, returnItems: BillItem[]) => {
    const bill = getBill(billId);
    if (!bill) return;

    // Calculate return amount
    const returnAmount = returnItems.reduce((sum, item) => sum + Math.abs(item.total), 0);
    
    // Update bill with return items
    const updatedBill: Bill = {
      ...bill,
      returnItems: returnItems,
      returnAmount: returnAmount,
      totalAmount: bill.subtotal - returnAmount
    };

    setBills(prev => prev.map(b => b.id === billId ? updatedBill : b));

    // Update medicine stock (add back returned quantities)
    returnItems.forEach(item => {
      const medicine = getMedicine(item.medicineId);
      if (medicine) {
        updateMedicine(item.medicineId, {
          stockQuantity: medicine.stockQuantity + item.quantity
        });
      }

      // Add stock transaction for return
      addStockTransaction({
        type: 'return',
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        quantity: item.quantity,
        date: new Date().toISOString().split('T')[0],
        reference: `RETURN-${bill.billNumber}`,
        notes: `Return from bill ${bill.billNumber}`
      });
    });
  };

  const addStockTransaction = (transaction: Omit<StockTransaction, 'id'>) => {
    const newTransaction: StockTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setStockTransactions(prev => [...prev, newTransaction]);
  };

  const addPurchase = (purchase: Omit<PurchaseEntry, 'id'>) => {
    const newPurchase: PurchaseEntry = {
      ...purchase,
      id: Date.now().toString()
    };
    setPurchases(prev => [...prev, newPurchase]);

    // Update medicine stock
    purchase.items.forEach(item => {
      const medicine = getMedicine(item.medicineId);
      if (medicine) {
        updateMedicine(item.medicineId, {
          stockQuantity: medicine.stockQuantity + item.quantity
        });
      }

      addStockTransaction({
        type: 'purchase',
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        quantity: item.quantity,
        date: purchase.date,
        reference: purchase.invoiceNo
      });
    });
  };

  const getLowStockMedicines = (): Medicine[] => {
    return medicines.filter(m => m.stockQuantity <= m.minStockLevel);
  };

  const getExpiringMedicines = (days: number): Medicine[] => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return medicines.filter(m => {
      const expiryDate = new Date(m.expiryDate);
      return expiryDate <= futureDate && expiryDate >= new Date();
    });
  };

  // Notification functions - use provided functions or fallback to console
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    if (notificationFunctions?.showNotification) {
      notificationFunctions.showNotification(type, title, message);
    } else {
      console.log(`[Notification] ${type}: ${title} - ${message}`);
    }
  };

  const showSuccess = (message: string, title: string = 'Success') => {
    if (notificationFunctions?.showSuccess) {
      notificationFunctions.showSuccess(message, title);
    } else {
      showNotification('success', title, message);
    }
  };

  const showError = (message: string, title: string = 'Error') => {
    if (notificationFunctions?.showError) {
      notificationFunctions.showError(message, title);
    } else {
      showNotification('error', title, message);
    }
  };

  const showWarning = (message: string, title: string = 'Warning') => {
    if (notificationFunctions?.showWarning) {
      notificationFunctions.showWarning(message, title);
    } else {
      showNotification('warning', title, message);
    }
  };

  const showInfo = (message: string, title: string = 'Info') => {
    if (notificationFunctions?.showInfo) {
      notificationFunctions.showInfo(message, title);
    } else {
      showNotification('info', title, message);
    }
  };

  const value: AppContextType = {
    currentUser,
    login,
    logout,
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    getMedicine,
    customers,
    addCustomer,
    updateCustomer,
    getCustomer,
    suppliers,
    addSupplier,
    updateSupplier,
    getSupplier,
    bills,
    addBill,
    getBill,
    addReturnToBill,
    stockTransactions,
    addStockTransaction,
    purchases,
    addPurchase,
    generateBillNumber,
    getLowStockMedicines,
    getExpiringMedicines,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};