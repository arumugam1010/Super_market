import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Bill, Customer } from '../types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = (bill: Bill, customer: Customer | null) => {
  const doc = new jsPDF();
  
  // Set font to monospace for better alignment
  doc.setFont('Courier');

  // Header
  doc.setFontSize(16);
  doc.text('My Shop Billing', 105, 20, { align: 'center' });
  
  // Bill details
  doc.setFontSize(10);
  doc.text(`Bill No: ${bill.billNumber}`, 20, 35);
  doc.text(`Date: ${new Date(bill.date).toLocaleDateString()}`, 20, 40);
  doc.text(`Time: ${bill.time}`, 20, 45);
  doc.text(`Customer: ${customer?.name || 'Walk-in Customer'}`, 20, 50);
  if (customer?.phone) {
    doc.text(`Phone: ${customer.phone}`, 20, 55);
  }

  // Items table header
  let yPos = 70;
  doc.setFontSize(10);
  doc.text('Item', 20, yPos);
  doc.text('Qty', 100, yPos);
  doc.text('Price', 130, yPos);
  doc.text('Total', 170, yPos);
  
  // Draw line under header
  yPos += 5;
  doc.line(20, yPos, 190, yPos);
  yPos += 5;

  // Bill items
  bill.items.forEach(item => {
    const itemTotal = item.sellingPrice * item.quantity;
    doc.text(item.productName, 20, yPos);
    doc.text(item.quantity.toString(), 100, yPos);
    doc.text(`₹${item.sellingPrice.toFixed(2)}`, 130, yPos);
    doc.text(`₹${itemTotal.toFixed(2)}`, 170, yPos);
    yPos += 5;
  });

  // Return items section
  const returnItems = bill.returnItems || [];
  if (returnItems.length > 0) {
    yPos += 5;
    doc.text('Return Items', 20, yPos);
    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    yPos += 5;

    returnItems.forEach(item => {
      const itemTotal = Math.abs(item.total);
      doc.setTextColor(255, 0, 0); // Red color for return items
      doc.text(item.productName, 20, yPos);
      doc.text(`-${item.quantity}`, 100, yPos);
      doc.text(`₹${item.sellingPrice.toFixed(2)}`, 130, yPos);
      doc.text(`-₹${itemTotal.toFixed(2)}`, 170, yPos);
      doc.setTextColor(0, 0, 0); // Reset to black
      yPos += 5;
    });
  }

  // Summary section
  yPos += 5;
  doc.line(20, yPos, 190, yPos);
  yPos += 5;

  const subtotal = bill.subtotal;
  const returnAmount = bill.returnAmount || 0;
  const finalTotal = bill.totalAmount;

  doc.text('Subtotal:', 120, yPos);
  doc.text(`₹${subtotal.toFixed(2)}`, 170, yPos);
  yPos += 5;

  if (returnAmount > 0) {
    doc.setTextColor(255, 0, 0); // Red color for return amount
    doc.text('Return Amount:', 120, yPos);
    doc.text(`-₹${returnAmount.toFixed(2)}`, 170, yPos);
    doc.setTextColor(0, 0, 0); // Reset to black
    yPos += 5;
  }

  doc.line(120, yPos, 190, yPos);
  yPos += 5;

  doc.setFontSize(12);
  doc.setFont('Courier', 'bold');
  doc.text('Final Total:', 120, yPos);
  doc.text(`₹${finalTotal.toFixed(2)}`, 170, yPos);
  doc.setFont('Courier', 'normal');
  doc.setFontSize(10);

  // Footer
  yPos += 15;
  doc.line(20, yPos, 190, yPos);
  yPos += 5;
  doc.text('Thank you – Visit Again!', 105, yPos, { align: 'center' });
  yPos += 5;
  doc.line(20, yPos, 190, yPos);

  // Save the PDF
  doc.save('Bill_' + bill.billNumber + '.pdf');
};

// Function to print bill directly
export const printBill = (bill: Bill, customer: Customer | null) => {
  generatePDF(bill, customer);
};

// Function to save bill to local storage
export const saveBillToLocal = (bill: Bill) => {
  const existingBills = JSON.parse(localStorage.getItem('bills') || '[]');
  existingBills.push(bill);
  localStorage.setItem('bills', JSON.stringify(existingBills));
};
