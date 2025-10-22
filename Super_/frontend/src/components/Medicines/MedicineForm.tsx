import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Medicine } from '../../types';

interface MedicineFormProps {
  medicine?: Medicine | null;
  onClose: () => void;
}

export default function MedicineForm({ medicine, onClose }: MedicineFormProps) {
  const { addMedicine, updateMedicine } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    batchNo: '',
    manufacturer: '',
    expiryDate: '',
    hsnCode: '',
    barcode: '',
    mrp: '',
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: '',
    minStockLevel: '',
    category: '',
  });

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        batchNo: medicine.batchNo,
        manufacturer: medicine.manufacturer,
        expiryDate: medicine.expiryDate,
        hsnCode: medicine.hsnCode,
        barcode: medicine.barcode || '',
        mrp: medicine.mrp.toString(),
        purchasePrice: medicine.purchasePrice.toString(),
        sellingPrice: medicine.sellingPrice.toString(),
        stockQuantity: medicine.stockQuantity.toString(),
        minStockLevel: medicine.minStockLevel.toString(),
        category: medicine.category || ''
      });
    }
  }, [medicine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const medicineData = {
        name: formData.name,
        batchNo: formData.batchNo,
        manufacturer: formData.manufacturer,
        expiryDate: formData.expiryDate,
        hsnCode: formData.hsnCode,
        barcode: formData.barcode,
        mrp: parseFloat(formData.mrp),
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stockQuantity: parseInt(formData.stockQuantity),
        minStockLevel: parseInt(formData.minStockLevel),
        addedDate: medicine?.addedDate || new Date().toISOString(),
        category: formData.category      };

      if (medicine) {
        updateMedicine(medicine.id, medicineData);
      } else {
        addMedicine(medicineData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving medicine:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {medicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>
            <p className="text-sm text-gray-600">
              {medicine ? 'Update medicine information' : 'Enter medicine details'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer *
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Antibiotic">Antibiotic</option>
                <option value="Vitamin">Vitamin</option>
                <option value="Antiseptic">Antiseptic</option>
                <option value="Cardiac">Cardiac</option>
                <option value="Diabetic">Diabetic</option>
                <option value="Other">Other</option>
              </select>
            </div>

            
          </div>

          {/* Batch & Identification */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Batch & Identification</h3>
            
            <div>
              <label htmlFor="batchNo" className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number *
              </label>
              <input
                type="text"
                id="batchNo"
                name="batchNo"
                value={formData.batchNo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="hsnCode" className="block text-sm font-medium text-gray-700 mb-1">
                HSN Code *
              </label>
              <input
                type="text"
                id="hsnCode"
                name="hsnCode"
                value={formData.hsnCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Pricing</h3>
            
            <div>
              <label htmlFor="mrp" className="block text-sm font-medium text-gray-700 mb-1">
                MRP *
              </label>
              <input
                type="number"
                id="mrp"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price *
              </label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price *
              </label>
              <input
                type="number"
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Stock Information</h3>
            
            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock *
              </label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock Level *
              </label>
              <input
                type="number"
                id="minStockLevel"
                name="minStockLevel"
                value={formData.minStockLevel}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : medicine ? 'Update Medicine' : 'Add Medicine'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}