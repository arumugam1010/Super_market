import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  AlertTriangle,
  Package,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import ProductForm from './ProductForm';
import { format } from 'date-fns';

export default function ProductList() {
  const { products, deleteProduct, getLowStockProducts, getExpiringProducts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low-stock' | 'expiring'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType === 'low-stock') {
      const lowStock = getLowStockProducts();
      filtered = filtered.filter(prod => lowStock.some(ls => ls.id === prod.id));
    } else if (filterType === 'expiring') {
      const expiring = getExpiringProducts(30);
      filtered = filtered.filter(prod => expiring.some(exp => exp.id === prod.id));
    }

    return filtered;
  }, [products, searchTerm, filterType, getLowStockProducts, getExpiringProducts]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity <= product.minStockLevel) {
      return { status: 'low', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (product.stockQuantity <= product.minStockLevel * 2) {
      return { status: 'medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
      return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { status: 'no-expiry', color: 'text-gray-600', bgColor: 'bg-gray-100' };

    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else {
      return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-red-600">{getLowStockProducts().length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">{getExpiringProducts(30).length}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{products.reduce((sum, prod) => sum + (prod.stockQuantity * prod.sellingPrice), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products by name, brand, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'low-stock' | 'expiring')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Products</option>
              <option value="low-stock">Low Stock</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          const expiryStatus = getExpiryStatus(product.expiryDate);

          return (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Stock</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                    {product.stockQuantity} units
                  </span>
                </div>
                {product.expiryDate && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Expiry</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${expiryStatus.bgColor} ${expiryStatus.color}`}>
                      {format(new Date(product.expiryDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Purchase</p>
                  <p className="font-semibold text-gray-700">₹{product.purchasePrice}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Selling</p>
                  <p className="font-semibold text-green-600">₹{product.sellingPrice}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-gray-500 space-y-1">
                {product.batchNo && <p>Batch: {product.batchNo}</p>}
                {product.barcode && <p>Barcode: {product.barcode}</p>}
                {product.hsnCode && <p>HSN: {product.hsnCode}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or add new products</p>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProductForm
              product={editingProduct}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}
