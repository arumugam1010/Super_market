export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  name: string;
  email?: string;
}

export interface Medicine {
  id: string;
  name: string;
  tabletName?: string;
  batchNo: string;
  manufacturer: string;
  expiryDate: string;
  hsnCode: string;
  barcode?: string;
  mrp: number;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  addedDate: string;
  category?: string;
  tabName?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  registrationDate: string;
  totalPurchases: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  registrationDate: string;
}

export interface BillItem {
  medicineId: string;
  medicineName: string;
  batchNo: string;
  quantity: number;
  mrp: number;
  sellingPrice: number;
  discount: number;
  gstRate: number;
  total: number;
  isReturn?: boolean; // New field to identify return items
}

export interface Bill {
  id: string;
  billNumber: string;
  date: string;
  time: string;
  customerId?: string;
  customerName?: string;
  items: BillItem[];
  returnItems?: BillItem[]; // New field for return items
  subtotal: number;
  totalDiscount: number;
  gstAmount: number;
  returnAmount?: number; // New field for return amount
  totalAmount: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'wallet';
  paidAmount: number;
  changeAmount: number;
  staffId: string;
  staffName: string;
}

export interface StockTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'return' | 'adjustment';
  medicineId: string;
  medicineName: string;
  quantity: number;
  date: string;
  reference: string;
  notes?: string;
}

export interface PurchaseEntry {
  id: string;
  supplierName: string;
  invoiceNo: string;
  date: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    quantity: number;
    purchasePrice: number;
    batchNo: string;
    expiryDate: string;
  }>;
  totalAmount: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}
