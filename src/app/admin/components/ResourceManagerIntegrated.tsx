'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Eye, Layers, Tag, Smartphone, Loader2, Link2, XCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { deviceCategoriesApi, deviceBrandsApi, deviceModelsApi } from '@/lib/admin-api';
import { categoryBrandApi } from '@/lib/category-brand-api';

interface ResourceManagerProps {
  type: 'categories' | 'brands' | 'models';
}

// FormField component moved outside to prevent re-creation on every render
interface FormFieldProps {
  label: string;
  value: any;
  field: string;
  type?: string;
  options?: any[];
  required?: boolean;
  helpText?: string;
  modalMode: 'create' | 'edit' | 'view';
  currentItem: any;
  setCurrentItem: (item: any) => void;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  value, 
  field, 
  type = "text", 
  options = [], 
  required = true, 
  helpText = '',
  modalMode,
  currentItem,
  setCurrentItem
}) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </label>
    {options.length > 0 ? (
      <div className="relative">
        <select
          value={value || ''}
          disabled={modalMode === 'view'}
          onChange={(e) => setCurrentItem({ ...currentItem, [field]: e.target.value })}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 appearance-none text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
          required={required && modalMode !== 'view'}
        >
          <option value="">Select {label}</option>
          {options.map((opt: any) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    ) : type === 'textarea' ? (
      <textarea
        value={value || ''}
        disabled={modalMode === 'view'}
        onChange={(e) => setCurrentItem({ ...currentItem, [field]: e.target.value })}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500 min-h-[80px]"
        placeholder={`Enter ${label.toLowerCase()}...`}
        required={required && modalMode !== 'view'}
        rows={3}
      />
    ) : (
      <input 
        type={type}
        value={value || ''}
        disabled={modalMode === 'view'}
        onChange={(e) => setCurrentItem({ ...currentItem, [field]: e.target.value })}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
        placeholder={`Enter ${label.toLowerCase()}...`}
        required={required && modalMode !== 'view'}
      />
    )}
    {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
  </div>
);

export const ResourceManagerIntegrated: React.FC<ResourceManagerProps> = ({ type }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  // Category-Brand associations state
  const [linkedItems, setLinkedItems] = useState<any[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [availableForLink, setAvailableForLink] = useState<any[]>([]);
  const [selectedForLink, setSelectedForLink] = useState<string>('');

  // Configuration for titles and form fields
  const config = {
    categories: {
      title: 'Device Categories',
      description: 'Manage main categories for e-waste classification.',
      columns: ['ID', 'Name', 'Description', 'Status'],
      icon: Layers
    },
    brands: {
      title: 'Device Brands',
      description: 'Registered manufacturers and brands.',
      columns: ['ID', 'Brand Name', 'Description', 'Status'],
      icon: Tag
    },
    models: {
      title: 'Device Models',
      description: 'Specific device models for valuation and recycling instructions.',
      columns: ['Model ID', 'Model Name', 'Brand', 'Category', 'Status'],
      icon: Smartphone
    }
  }[type];

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    if (type === 'models') {
      fetchCategories();
      fetchBrands();
    }
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'categories') {
        response = await deviceCategoriesApi.getAll();
      } else if (type === 'brands') {
        response = await deviceBrandsApi.getAll();
      } else {
        response = await deviceModelsApi.getAll();
      }
      setData(response.data || []);
    } catch (error: any) {
      console.error(`Error fetching ${type}:`, error);
      showToast(`Failed to load ${type}. ${error.response?.data?.message || error.message}`, 'error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await deviceCategoriesApi.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await deviceBrandsApi.getAll();
      setBrands(response.data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    // Initialize with exact backend payload structure
    const defaultItem = type === 'categories' 
      ? { 
          code: '',
          name: '', 
          description: '',
          isActive: true
        } 
      : type === 'brands' 
      ? { 
          code: '',
          name: '', 
          description: '',
          isActive: true
        }
      : { 
          modelName: '', 
          brandId: '', 
          categoryId: '',
          releaseYear: '',
          avgWeightGrams: '',
          goldMg: '',
          silverMg: '',
          copperG: '',
          palladiumMg: '',
          recyclabilityScore: '',
          basePoints: '',
          isActive: true
        };
    
    setCurrentItem(defaultItem);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setCurrentItem({ ...item });
    setIsModalOpen(true);
  };

  const handleOpenView = (item: any) => {
    setModalMode('view');
    setCurrentItem({ ...item });
    setIsModalOpen(true);
    
    // Load linked items for categories and brands
    if (type === 'categories' || type === 'brands') {
      fetchLinkedItems(item.id);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      if (type === 'categories') {
        await deviceCategoriesApi.delete(id);
      } else if (type === 'brands') {
        await deviceBrandsApi.delete(id);
      } else {
        await deviceModelsApi.delete(id);
      }
      showToast(`${config.title.slice(0, -1)} deleted successfully!`, 'success');
      fetchData();
    } catch (error: any) {
      console.error(`Error deleting ${type}:`, error);
      showToast(`Failed to delete. ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  // Category-Brand Association Functions
  const fetchLinkedItems = async (itemId: string) => {
    setLoadingLinks(true);
    try {
      let response;
      if (type === 'categories') {
        response = await categoryBrandApi.getBrandsByCategory(itemId);
      } else {
        response = await categoryBrandApi.getCategoriesByBrand(itemId);
      }
      setLinkedItems(response.data || []);
    } catch (error: any) {
      console.error('Error fetching linked items:', error);
      setLinkedItems([]);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleOpenLinkModal = async () => {
    setShowLinkModal(true);
    setSelectedForLink('');
    
    // Get available items to link
    try {
      const linkedIds = linkedItems.map(item => 
        type === 'categories' ? item.brand?.id : item.category?.id
      );
      
      if (type === 'categories') {
        const available = brands.filter(b => !linkedIds.includes(b.id));
        setAvailableForLink(available);
      } else {
        const available = categories.filter(c => !linkedIds.includes(c.id));
        setAvailableForLink(available);
      }
    } catch (error) {
      console.error('Error loading available items:', error);
    }
  };

  const handleCreateLink = async () => {
    if (!selectedForLink) {
      showToast('Please select an item to link', 'error');
      return;
    }

    try {
      const linkData = type === 'categories'
        ? { categoryId: currentItem.id, brandId: selectedForLink, isActive: true }
        : { categoryId: selectedForLink, brandId: currentItem.id, isActive: true };

      await categoryBrandApi.create(linkData);
      showToast(`${type === 'categories' ? 'Brand' : 'Category'} linked successfully!`, 'success');
      setShowLinkModal(false);
      fetchLinkedItems(currentItem.id);
    } catch (error: any) {
      console.error('Error creating link:', error);
      showToast(`Failed to create link. ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!window.confirm('Are you sure you want to remove this association?')) {
      return;
    }

    try {
      await categoryBrandApi.delete(linkId);
      showToast('Association removed successfully!', 'success');
      fetchLinkedItems(currentItem.id);
    } catch (error: any) {
      console.error('Error deleting link:', error);
      showToast(`Failed to remove association. ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on backend DTO
    if (type === 'categories' || type === 'brands') {
      if (!currentItem.code || currentItem.code.trim() === '') {
        showToast('Code is required', 'error');
        return;
      }
      if (currentItem.code.length > 50) {
        showToast('Code must not exceed 50 characters', 'error');
        return;
      }
    }

    if (!currentItem.name && !currentItem.modelName) {
      showToast('Name is required', 'error');
      return;
    }

    if (type === 'categories' || type === 'brands') {
      if (currentItem.name && currentItem.name.length > 100) {
        showToast('Name must not exceed 100 characters', 'error');
        return;
      }
      if (currentItem.description && currentItem.description.length > 500) {
        showToast('Description must not exceed 500 characters', 'error');
        return;
      }
    }

    if (type === 'models') {
      if (!currentItem.modelName || currentItem.modelName.trim() === '') {
        showToast('Model name is required', 'error');
        return;
      }
      if (currentItem.modelName.length > 100) {
        showToast('Model name must not exceed 100 characters', 'error');
        return;
      }
      if (!currentItem.brandId) {
        showToast('Brand is required', 'error');
        return;
      }
      if (!currentItem.categoryId) {
        showToast('Category is required', 'error');
        return;
      }
    }

    try {
      // Clean up the data - remove empty optional fields and convert types
      const cleanedData = Object.entries(currentItem).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          // Convert numeric fields to proper types
          if (['releaseYear', 'recyclabilityScore', 'basePoints'].includes(key)) {
            acc[key] = value ? parseInt(value as string) : undefined;
          } else if (['avgWeightGrams', 'goldMg', 'silverMg', 'copperG', 'palladiumMg'].includes(key)) {
            acc[key] = value ? parseFloat(value as string) : undefined;
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {} as any);

      // Remove undefined values
      Object.keys(cleanedData).forEach(key => 
        cleanedData[key] === undefined && delete cleanedData[key]
      );

      if (modalMode === 'create') {
        if (type === 'categories') {
          await deviceCategoriesApi.create(cleanedData);
        } else if (type === 'brands') {
          await deviceBrandsApi.create(cleanedData);
        } else {
          await deviceModelsApi.create(cleanedData);
        }
        showToast(`${config.title.slice(0, -1)} created successfully!`, 'success');
      } else {
        if (type === 'categories') {
          await deviceCategoriesApi.update(currentItem.id, cleanedData);
        } else if (type === 'brands') {
          await deviceBrandsApi.update(currentItem.id, cleanedData);
        } else {
          await deviceModelsApi.update(currentItem.id, cleanedData);
        }
        showToast(`${config.title.slice(0, -1)} updated successfully!`, 'success');
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(`Error saving ${type}:`, error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to save';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map((e: any) => e.message || e).join(', ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    }
  };

  const filteredData = data.filter((item: any) => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Helper function to shorten UUID for display
  const shortenId = (id: string) => {
    if (!id) return '-';
    // Take first 8 characters of UUID
    return id.substring(0, 8).toUpperCase();
  };

  const renderTableRow = (row: any, i: number) => {
    if (type === 'categories') {
      return (
        <tr key={i} className="group hover:bg-gray-50/80 transition-colors">
          <td className="px-6 py-4 text-xs font-mono text-gray-400" title={row.id}>{shortenId(row.id)}</td>
          <td className="px-6 py-4 text-sm font-medium text-eco-900">{row.name}</td>
          <td className="px-6 py-4 text-sm text-gray-700">{row.description || '-'}</td>
          <td className="px-6 py-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              row.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
            }`}>
              {row.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <ActionButtons row={row} />
          </td>
        </tr>
      );
    } else if (type === 'brands') {
      return (
        <tr key={i} className="group hover:bg-gray-50/80 transition-colors">
          <td className="px-6 py-4 text-xs font-mono text-gray-900" title={row.id}>{shortenId(row.id)}</td>
          <td className="px-6 py-4 text-sm font-medium text-eco-900">{row.name}</td>
          <td className="px-6 py-4 text-sm text-gray-700">{row.description || '-'}</td>
          <td className="px-6 py-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              row.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
            }`}>
              {row.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <ActionButtons row={row} />
          </td>
        </tr>
      );
    } else {
      const brandName = row.brand?.name || brands.find(b => b.id === row.brandId)?.name || '-';
      const categoryName = row.category?.name || categories.find(c => c.id === row.categoryId)?.name || '-';
      return (
        <tr key={i} className="group hover:bg-gray-50/80 transition-colors">
          <td className="px-6 py-4 text-xs font-mono text-gray-900" title={row.id}>{shortenId(row.id)}</td>
          <td className="px-6 py-4 text-sm font-medium text-eco-900">{row.modelName}</td>
          <td className="px-6 py-4 text-sm text-gray-700">{brandName}</td>
          <td className="px-6 py-4 text-sm text-gray-700">{categoryName}</td>
          <td className="px-6 py-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              row.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
            }`}>
              {row.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <ActionButtons row={row} />
          </td>
        </tr>
      );
    }
  };

  const ActionButtons = ({ row }: { row: any }) => (
    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={() => handleOpenView(row)}
        className="p-2 text-eco-600 hover:bg-eco-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye size={16} />
      </button>
      <button 
        onClick={() => handleOpenEdit(row)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Edit"
      >
        <Edit2 size={16} />
      </button>
      <button 
        onClick={() => handleDelete(row.id)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-eco-950 capitalize">{config.title}</h2>
          <p className="text-eco-600 mt-1">{config.description}</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-eco-900 text-white rounded-xl font-medium shadow-lg hover:bg-eco-800 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          <span>Add New {type === 'categories' ? 'Category' : type === 'brands' ? 'Brand' : 'Model'}</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center z-10">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder={`Search ${type}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tech-lime focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchData}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up">
        {loading ? (
          <div className="flex items-center justify-center p-12 min-h-[400px]">
            <Loader2 className="animate-spin text-eco-600" size={32} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    {config.columns.map((col, i) => (
                      <th key={i} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{col}</th>
                    ))}
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((row: any, i: number) => renderTableRow(row, i))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="p-12 text-center text-gray-500 min-h-[200px] flex items-center justify-center">No items found.</div>
              )}
            </div>
            
            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
                Showing {filteredData.length} of {data.length} results
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit/View Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 md:left-72 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
            
            {/* Header - Fixed */}
            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                 <div>
                   <h3 className="text-xl font-display font-bold text-eco-900">
                     {modalMode === 'create' ? 'Create New' : modalMode === 'edit' ? 'Edit' : 'View'} {type === 'categories' ? 'Category' : type === 'brands' ? 'Brand' : 'Model'}
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">
                     {modalMode === 'view' ? 'Viewing record details.' : 'Fill in the details below.'}
                   </p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 {modalMode === 'view' && (
                   <button 
                     onClick={() => setModalMode('edit')}
                     className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                     title="Edit Record"
                   >
                     <Edit2 size={18} />
                   </button>
                 )}
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                   <X size={20} />
                 </button>
               </div>
            </div>

            {/* Form Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSave} className="p-8 space-y-5"  id="resource-form">
              
              {/* Conditional Fields based on Type */}
              {type === 'categories' && (
                <>
                  <FormField 
                    label="Category Code" 
                    value={currentItem.code} 
                    field="code"
                    helpText="Unique code for the category (max 50 characters)"
                    modalMode={modalMode}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                  />
                  <FormField 
                    label="Category Name" 
                    value={currentItem.name} 
                    field="name" 
                    helpText="Enter the device category name (max 100 characters)"
                    modalMode={modalMode}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                  />
                  <FormField 
                    label="Description" 
                    value={currentItem.description} 
                    field="description" 
                    type="textarea"
                    required={false}
                    helpText="Brief description of this category (max 500 characters)"
                    modalMode={modalMode}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                  />
                  <FormField 
                    label="Active Status" 
                    value={currentItem.isActive} 
                    field="isActive" 
                    options={[
                      { value: true, label: 'Active' },
                      { value: false, label: 'Inactive' }
                    ]}
                    required={false}
                    modalMode={modalMode}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                  />
                </>
              )}

              {type === 'brands' && (
                <>
                  <FormField 
                    label="Brand Code" 
                    value={currentItem.code} 
                    field="code"
                    helpText="Unique code for the brand (max 50 characters)"
                    modalMode={modalMode}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                  />
                  <FormField 
                    label="Brand Name" 
                    value={currentItem.name} 
                    field="name"
                    helpText="Enter the manufacturer/brand name (max 100 characters)"
                    modalMode={modalMode}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                  />
                  <FormField 
                    label="Description" 
                    value={currentItem.description} 
                    field="description" 
                    type="textarea"
                    required={false}
                    helpText="Provide details about this brand (max 500 characters)"
                    modalMode={modalMode}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                  />
                  <FormField 
                    label="Active Status" 
                    value={currentItem.isActive} 
                    field="isActive" 
                    options={[
                      { value: true, label: 'Active' },
                      { value: false, label: 'Inactive' }
                    ]}
                    required={false}
                    modalMode={modalMode}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                  />
                </>
              )}

              {type === 'models' && (
                <>
                  <FormField 
                    label="Model Name" 
                    value={currentItem.modelName} 
                    field="modelName"
                    helpText="Enter the device model name (max 100 characters)"
                    modalMode={modalMode}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField 
                      label="Brand" 
                      value={currentItem.brandId} 
                      field="brandId" 
                      options={brands.map(b => ({ value: b.id, label: b.name }))}
                      helpText="Select the brand"
                      modalMode={modalMode}
                      currentItem={currentItem}
                      setCurrentItem={setCurrentItem}
                    />
                    <FormField 
                      label="Category" 
                      value={currentItem.categoryId} 
                      field="categoryId" 
                      options={categories.map(c => ({ value: c.id, label: c.name }))}
                      helpText="Select the category"
                      modalMode={modalMode}
                      currentItem={currentItem}
                      setCurrentItem={setCurrentItem}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField 
                      label="Release Year" 
                      value={currentItem.releaseYear} 
                      field="releaseYear" 
                      type="number"
                      required={false}
                      helpText="Year of release"
                      modalMode={modalMode}
                      currentItem={currentItem}
                      setCurrentItem={setCurrentItem}
                    />
                    <FormField 
                      label="Avg Weight (grams)" 
                      value={currentItem.avgWeightGrams} 
                      field="avgWeightGrams" 
                      type="number"
                      required={false}
                      helpText="Average weight in grams"
                      modalMode={modalMode}
                      currentItem={currentItem}
                      setCurrentItem={setCurrentItem}
                    />
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Material Composition (Optional)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField 
                        label="Gold (mg)" 
                        value={currentItem.goldMg} 
                        field="goldMg" 
                        type="number"
                        required={false}
                        helpText="Gold content in milligrams"
                        modalMode={modalMode}
                        currentItem={currentItem}
                        setCurrentItem={setCurrentItem}
                      />
                      <FormField 
                        label="Silver (mg)" 
                        value={currentItem.silverMg} 
                        field="silverMg" 
                        type="number"
                        required={false}
                        helpText="Silver content in milligrams"
                        modalMode={modalMode}
                        currentItem={currentItem}
                        setCurrentItem={setCurrentItem}
                      />
                      <FormField 
                        label="Copper (g)" 
                        value={currentItem.copperG} 
                        field="copperG" 
                        type="number"
                        required={false}
                        helpText="Copper content in grams"
                        modalMode={modalMode}
                        currentItem={currentItem}
                        setCurrentItem={setCurrentItem}
                      />
                      <FormField 
                        label="Palladium (mg)" 
                        value={currentItem.palladiumMg} 
                        field="palladiumMg" 
                        type="number"
                        required={false}
                        helpText="Palladium content in milligrams"
                        modalMode={modalMode}
                        currentItem={currentItem}
                        setCurrentItem={setCurrentItem}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField 
                      label="Recyclability Score" 
                      value={currentItem.recyclabilityScore} 
                      field="recyclabilityScore" 
                      type="number"
                      required={false}
                      helpText="Score from 0-100"
                      modalMode={modalMode}
                      currentItem={currentItem}
                      setCurrentItem={setCurrentItem}
                    />
                    <FormField 
                      label="Base Points" 
                      value={currentItem.basePoints} 
                      field="basePoints" 
                      type="number"
                      required={false}
                      helpText="Base reward points"
                      modalMode={modalMode}
                      currentItem={currentItem}
                      setCurrentItem={setCurrentItem}
                    />
                  </div>

                  <FormField 
                    label="Active Status" 
                    value={currentItem.isActive} 
                    field="isActive" 
                    options={[
                      { value: true, label: 'Active' },
                      { value: false, label: 'Inactive' }
                    ]}
                    required={false}
                    modalMode={modalMode}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                  />
                </>
              )}

              {/* Linked Items Section - Only show in view mode for categories and brands */}
              {modalMode === 'view' && (type === 'categories' || type === 'brands') && (
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Link2 size={16} className="text-eco-600" />
                      Linked {type === 'categories' ? 'Brands' : 'Categories'}
                      <span className="ml-2 px-2 py-0.5 bg-eco-100 text-eco-700 rounded-full text-xs font-medium">
                        {linkedItems.length}
                      </span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleOpenLinkModal}
                      className="flex items-center gap-1 px-3 py-1.5 bg-eco-600 text-white rounded-lg text-xs font-medium hover:bg-eco-700 transition-colors shadow-sm"
                    >
                      <Plus size={14} />
                      Add Link
                    </button>
                  </div>

                  {loadingLinks ? (
                    <div className="flex items-center justify-center py-12 bg-gray-50 rounded-xl">
                      <Loader2 className="animate-spin text-eco-600" size={24} />
                    </div>
                  ) : linkedItems.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Link2 size={20} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">No {type === 'categories' ? 'brands' : 'categories'} linked yet</p>
                      <p className="text-gray-400 text-xs mt-1">Click "Add Link" to create associations</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {linkedItems.map((link: any) => {
                        const displayItem = type === 'categories' ? link.brand : link.category;
                        return (
                          <div
                            key={link.id}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-eco-100 to-eco-50 rounded-xl flex items-center justify-center shadow-sm">
                                {type === 'categories' ? 
                                  <Tag size={18} className="text-eco-600" /> : 
                                  <Layers size={18} className="text-eco-600" />
                                }
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{displayItem?.name}</div>
                                <div className="text-xs text-gray-500 font-mono">{displayItem?.code}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteLink(link.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Remove link"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              </form>
            </div>

            {/* Footer Buttons - Fixed */}
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button 
                    type="submit"
                    form="resource-form"
                    className="flex-1 py-3 bg-eco-900 text-white rounded-xl font-medium hover:bg-eco-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Save size={18} />
                    {modalMode === 'create' ? 'Create Item' : 'Save Changes'}
                  </button>
                )}
            </div>

          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 md:left-72 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" onClick={() => setShowLinkModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-eco-900 flex items-center gap-2">
                <Link2 size={18} />
                Link {type === 'categories' ? 'Brand' : 'Category'}
              </h3>
              <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Select {type === 'categories' ? 'Brand' : 'Category'}
                </label>
                <select
                  value={selectedForLink}
                  onChange={(e) => setSelectedForLink(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                >
                  <option value="">-- Select --</option>
                  {availableForLink.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.code})
                    </option>
                  ))}
                </select>
                {availableForLink.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">All items are already linked</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateLink}
                  disabled={!selectedForLink}
                  className="flex-1 py-2.5 bg-eco-900 text-white rounded-xl font-medium hover:bg-eco-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Link2 size={16} />
                  Create Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
