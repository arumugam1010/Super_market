import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationContext';
import { differenceInDays } from 'date-fns';

export default function AlertMonitor() {
  const { products, getLowStockProducts, getExpiringProducts } = useApp();
  const { showWarning, showError } = useNotifications();
  
  // Use refs to track previously notified products to avoid duplicate notifications
  const notifiedLowStock = useRef<Set<string>>(new Set());
  const notifiedExpiring = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Check for low stock products
    const lowStockProducts = getLowStockProducts();

    lowStockProducts.forEach(product => {
      if (!notifiedLowStock.current.has(product.id)) {
        showWarning(
          `${product.name} is running low! Current stock: ${product.stockQuantity}, Minimum: ${product.minStockLevel}`,
          'Low Stock Alert'
        );
        notifiedLowStock.current.add(product.id);
      }
    });

    // Check for expiring products (within 2 days as requested)
    const expiringProducts = getExpiringProducts(2); // 2 days before expiry

    expiringProducts.forEach(product => {
      if (!notifiedExpiring.current.has(product.id) && product.expiryDate) {
        const daysUntilExpiry = differenceInDays(new Date(product.expiryDate), new Date());
        showError(
          `${product.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}! Expiry date: ${new Date(product.expiryDate).toLocaleDateString()}`,
          'Expiry Alert'
        );
        notifiedExpiring.current.add(product.id);
      }
    });

    // Clean up notifications for products that are no longer low stock or expiring
    const currentLowStockIds = new Set(lowStockProducts.map(p => p.id));
    const currentExpiringIds = new Set(expiringProducts.map(p => p.id));

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

  }, [products, getLowStockProducts, getExpiringProducts, showWarning, showError]);

  // This component doesn't render anything visible
  return null;
}
