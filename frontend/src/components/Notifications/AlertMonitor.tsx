import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationContext';
import { differenceInDays } from 'date-fns';

export default function AlertMonitor() {
  const { medicines, getLowStockMedicines, getExpiringMedicines } = useApp();
  const { showWarning, showError } = useNotifications();
  
  // Use refs to track previously notified medicines to avoid duplicate notifications
  const notifiedLowStock = useRef<Set<string>>(new Set());
  const notifiedExpiring = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Check for low stock medicines
    const lowStockMedicines = getLowStockMedicines();
    
    lowStockMedicines.forEach(medicine => {
      if (!notifiedLowStock.current.has(medicine.id)) {
        showWarning(
          `${medicine.name} is running low! Current stock: ${medicine.stockQuantity}, Minimum: ${medicine.minStockLevel}`,
          'Low Stock Alert'
        );
        notifiedLowStock.current.add(medicine.id);
      }
    });

    // Check for expiring medicines (within 2 days as requested)
    const expiringMedicines = getExpiringMedicines(2); // 2 days before expiry
    
    expiringMedicines.forEach(medicine => {
      if (!notifiedExpiring.current.has(medicine.id)) {
        const daysUntilExpiry = differenceInDays(new Date(medicine.expiryDate), new Date());
        showError(
          `${medicine.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}! Expiry date: ${new Date(medicine.expiryDate).toLocaleDateString()}`,
          'Expiry Alert'
        );
        notifiedExpiring.current.add(medicine.id);
      }
    });

    // Clean up notifications for medicines that are no longer low stock or expiring
    const currentLowStockIds = new Set(lowStockMedicines.map(m => m.id));
    const currentExpiringIds = new Set(expiringMedicines.map(m => m.id));
    
    // Remove from notified sets if they're no longer in the current lists
    notifiedLowStock.current.forEach(id => {
      if (!currentLowStockIds.has(id)) {
        notifiedLowStock.current.delete(id);
      }
    });
    
    notifiedExpiring.current.forEach(id => {
      if (!currentExpiringIds.has(id)) {
        notifiedExpiring.current.delete(id);
      }
    });

  }, [medicines, getLowStockMedicines, getExpiringMedicines, showWarning, showError]);

  // This component doesn't render anything visible
  return null;
}
