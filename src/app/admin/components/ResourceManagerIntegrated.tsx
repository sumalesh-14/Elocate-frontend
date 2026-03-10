'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Eye, Layers, Tag, Smartphone, Loader2, Link2, XCircle, Activity, ChevronRight, AlertTriangle } from 'lucide-react';
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

const SearchableSelect = ({ label, value, options, onChange, disabled, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt.value === value || opt === value);
  const displayValue = selectedOption ? (selectedOption.label || selectedOption) : '';

  const filteredOptions = options.filter((opt: any) => {
    const labelStr = String(opt.label || opt).toLowerCase();
    return labelStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm flex items-center justify-between cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:border-tech-lime focus:ring-2 focus:ring-tech-lime/50'
          } ${isOpen ? 'ring-2 ring-tech-lime/50 border-tech-lime' : ''}`}
      >
        <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue || placeholder || `Select ${label}`}
        </span>
        <ChevronRight size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[120] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-scale-in origin-top">
          <div className="p-2 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border-none rounded-lg focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-center text-gray-400">No results found</div>
            ) : (
              filteredOptions.map((opt: any, i: number) => {
                const optValue = opt.value ?? opt;
                const optLabel = opt.label ?? opt;
                const isSelected = optValue === value;
                return (
                  <div
                    key={i}
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-eco-900 text-white font-bold' : 'hover:bg-eco-50 text-gray-700'
                      }`}
                  >
                    <span>{optLabel}</span>
                    {isSelected && <Save size={14} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
    {options.length > 0 && field !== 'isActive' ? (
      <SearchableSelect
        label={label}
        value={value}
        options={options}
        disabled={modalMode === 'view'}
        onChange={(val: any) => setCurrentItem({ ...currentItem, [field]: val })}
        placeholder={`Choose ${label}...`}
      />
    ) : options.length > 0 ? (
      <div className="relative">
        <select
          value={value ?? ''}
          disabled={modalMode === 'view'}
          onChange={(e) => {
            const val = e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value;
            setCurrentItem({ ...currentItem, [field]: val });
          }}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 appearance-none text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
          required={required && modalMode !== 'view'}
        >
          <option value="">Select {label}</option>
          {options.map((opt: any) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <ChevronRight size={16} className="rotate-90" />
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
  const [selectedForLink, setSelectedForLink] = useState<string>('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [availableForLink, setAvailableForLink] = useState<any[]>([]);

  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [totalElements, setTotalElements] = useState(0);

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

  // Fetch data on component mount or page change
  useEffect(() => {
    fetchData(page);
    fetchCategories();
    fetchBrands();
  }, [type, page]);

  const fetchData = async (pageNumber = 0) => {
    setLoading(true);
    try {
      let response;
      const params = { page: pageNumber, size: pageSize };

      if (type === 'categories') {
        response = await deviceCategoriesApi.getAll(params);
      } else if (type === 'brands') {
        response = await deviceBrandsApi.getAll(params);
      } else {
        response = await deviceModelsApi.getAll(params);
      }

      const raw = response.data;

      if (raw?.content) {
        // Pageable response
        setData(raw.content);
        setTotalPages(raw.totalPages || 1);
        setTotalElements(raw.totalElements || 0);
      } else if (Array.isArray(raw)) {
        // Simple list response
        setData(raw);
        setTotalPages(1);
        setTotalElements(raw.length);
      } else {
        setData([]);
      }
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
      const raw = response.data;
      setCategories(Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await deviceBrandsApi.getAll();
      const raw = response.data;
      setBrands(Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []);
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
      const raw = response.data;
      setLinkedItems(Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []);
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
    setLoadingLinks(true);

    try {
      let freshOptions: any[] = [];
      const linkedIds = linkedItems.map(item =>
        type === 'categories' ? item.brand?.id : item.category?.id
      );

      if (type === 'categories') {
        const response = await deviceBrandsApi.getAll();
        const raw = response.data;
        freshOptions = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
        setBrands(freshOptions);
        const available = freshOptions.filter(b => !linkedIds.includes(b.id));
        setAvailableForLink(available);
      } else {
        const response = await deviceCategoriesApi.getAll();
        const raw = response.data;
        freshOptions = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
        setCategories(freshOptions);
        const available = freshOptions.filter(c => !linkedIds.includes(c.id));
        setAvailableForLink(available);
      }
    } catch (error) {
      console.error('Error loading fresh items for link:', error);
    } finally {
      setLoadingLinks(false);
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
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
            onClick={() => fetchData(page)}
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

            {/* Pagination Controls */}
            {totalElements > 0 && (
              <div className="px-8 py-6 border-t border-gray-100 flex flex-row items-center justify-between bg-white rounded-b-[2rem] gap-4">
                <div className="flex flex-row items-center gap-4 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-500 whitespace-nowrap inline-block">
                    Showing <span className="text-eco-900 font-bold inline-block">{data.length}</span> of <span className="text-eco-900 font-bold inline-block">{totalElements}</span> results
                  </span>
                  <div className="h-4 w-[1px] bg-gray-200 flex-shrink-0"></div>
                  <span className="text-sm font-medium text-gray-400 whitespace-nowrap inline-block">
                    Page <span className="text-gray-900 font-bold inline-block">{page + 1}</span> of {totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0 || loading}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-eco-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>

                  {/* Quick Page Jump */}
                  <div className="flex items-center gap-1.5 px-2">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      const pageNum = i; // For simplicity, just shows first 5
                      return (
                        <button
                          key={i}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 ${page === pageNum ? 'bg-eco-900 text-white shadow-lg' : 'text-gray-400 hover:bg-slate-50'
                            }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1 || loading}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-eco-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit/View Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 md:p-8 overflow-y-auto">
          <div className="fixed inset-0 md:left-80 bg-black/40 animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-6xl md:ml-80 bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.25)] border border-black/5 overflow-hidden animate-scale-in max-h-[92vh] flex flex-col">

            {/* Header - Fixed */}
            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-eco-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <config.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-eco-900 leading-tight">
                    {modalMode === 'create' ? 'Create New' : modalMode === 'edit' ? 'Edit' : 'View'} {type === 'categories' ? 'Category' : type === 'brands' ? 'Brand' : 'Model'}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {modalMode === 'view' ? `Entity ID: ${shortenId(currentItem.id)}` : 'Complete the information fields.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {modalMode === 'view' && (
                  <button
                    onClick={() => setModalMode('edit')}
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm hover:shadow-md"
                    title="Edit Record"
                  >
                    <Edit2 size={20} />
                  </button>
                )}
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form Body - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSave} className="p-8" id="resource-form">
                <div className={modalMode === 'view' && (type === 'categories' || type === 'brands') ? "grid grid-cols-1 lg:grid-cols-12 gap-10" : "space-y-6"}>

                  {/* Left Column: Details */}
                  <div className={modalMode === 'view' && (type === 'categories' || type === 'brands') ? "lg:col-span-5 space-y-6" : "max-w-3xl mx-auto w-full space-y-8"}>

                    {/* Header for View Mode */}
                    {modalMode === 'view' && (
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Activity size={14} className="text-eco-500" />
                        Details & Configuration
                      </h4>
                    )}

                    {type === 'categories' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            label="Category Code"
                            value={currentItem.code}
                            field="code"
                            helpText="Internal system code"
                            modalMode={modalMode}
                            currentItem={currentItem}
                            setCurrentItem={setCurrentItem}
                          />
                          <FormField
                            label="Category Name"
                            value={currentItem.name}
                            field="name"
                            modalMode={modalMode}
                            currentItem={currentItem}
                            setCurrentItem={setCurrentItem}
                          />
                        </div>
                        <FormField
                          label="Description"
                          value={currentItem.description}
                          field="description"
                          type="textarea"
                          required={false}
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
                      </div>
                    )}

                    {type === 'brands' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            label="Brand Code"
                            value={currentItem.code}
                            field="code"
                            modalMode={modalMode}
                            currentItem={currentItem}
                            setCurrentItem={setCurrentItem}
                          />
                          <FormField
                            label="Brand Name"
                            value={currentItem.name}
                            field="name"
                            modalMode={modalMode}
                            currentItem={currentItem}
                            setCurrentItem={setCurrentItem}
                          />
                        </div>
                        <FormField
                          label="Description"
                          value={currentItem.description}
                          field="description"
                          type="textarea"
                          required={false}
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
                      </div>
                    )}

                    {type === 'models' && (
                      <div className="space-y-8">
                        <FormField
                          label="Model Name"
                          value={currentItem.modelName}
                          field="modelName"
                          modalMode={modalMode}
                          currentItem={currentItem}
                          setCurrentItem={setCurrentItem}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <FormField
                            label="Brand"
                            value={currentItem.brandId}
                            field="brandId"
                            options={brands.map(b => ({ value: b.id, label: b.name }))}
                            modalMode={modalMode}
                            currentItem={currentItem}
                            setCurrentItem={setCurrentItem}
                          />
                          <FormField
                            label="Category"
                            value={currentItem.categoryId}
                            field="categoryId"
                            options={categories.map(c => ({ value: c.id, label: c.name }))}
                            modalMode={modalMode}
                            currentItem={currentItem}
                            setCurrentItem={setCurrentItem}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <FormField
                            label="Release Year"
                            value={currentItem.releaseYear}
                            field="releaseYear"
                            type="number"
                            required={false}
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
                            modalMode={modalMode}
                            currentItem={currentItem}
                            setCurrentItem={setCurrentItem}
                          />
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Material Analysis</h4>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <FormField label="Gold (mg)" value={currentItem.goldMg} field="goldMg" type="number" required={false} modalMode={modalMode} currentItem={currentItem} setCurrentItem={setCurrentItem} />
                            <FormField label="Silver (mg)" value={currentItem.silverMg} field="silverMg" type="number" required={false} modalMode={modalMode} currentItem={currentItem} setCurrentItem={setCurrentItem} />
                            <FormField label="Copper (g)" value={currentItem.copperG} field="copperG" type="number" required={false} modalMode={modalMode} currentItem={currentItem} setCurrentItem={setCurrentItem} />
                            <FormField label="Palladium (mg)" value={currentItem.palladiumMg} field="palladiumMg" type="number" required={false} modalMode={modalMode} currentItem={currentItem} setCurrentItem={setCurrentItem} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <FormField label="Recyclability Score" value={currentItem.recyclabilityScore} field="recyclabilityScore" type="number" required={false} modalMode={modalMode} currentItem={currentItem} setCurrentItem={setCurrentItem} />
                          <FormField label="Base Points" value={currentItem.basePoints} field="basePoints" type="number" required={false} modalMode={modalMode} currentItem={currentItem} setCurrentItem={setCurrentItem} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Linked Items */}
                  {modalMode === 'view' && (type === 'categories' || type === 'brands') && (
                    <div className="lg:col-span-7 lg:border-l lg:border-slate-100 lg:pl-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Link2 size={16} className="text-eco-600" />
                          Linked {type === 'categories' ? 'Brands' : 'Categories'}
                          <span className="ml-2 px-2 py-0.5 bg-eco-100 text-eco-700 rounded-full text-[10px] font-black">
                            {linkedItems.length}
                          </span>
                        </h4>
                        <button
                          type="button"
                          onClick={handleOpenLinkModal}
                          className="flex items-center gap-2 px-4 py-2 bg-eco-900 text-white rounded-xl text-xs font-bold hover:bg-eco-800 transition-all shadow-md hover:shadow-eco-900/20"
                        >
                          <Plus size={14} />
                          <span>Link New</span>
                        </button>
                      </div>

                      <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 min-h-[300px]">
                        {loadingLinks ? (
                          <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-10 h-10 border-4 border-eco-200 border-t-eco-600 rounded-full animate-spin"></div>
                            <span className="text-xs font-medium text-slate-400">Loading connections...</span>
                          </div>
                        ) : linkedItems.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                              <XCircle size={32} className="text-slate-200" />
                            </div>
                            <div>
                              <p className="text-slate-900 font-bold">No Associations Found</p>
                              <p className="text-xs text-slate-400 mt-1">Start by linking a {type === 'categories' ? 'brand' : 'category'} to this profile.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {linkedItems.map((link: any) => {
                              const displayItem = type === 'categories' ? link.brand : link.category;
                              return (
                                <div
                                  key={link.id}
                                  className="group relative flex items-center gap-4 p-4 bg-white rounded-2xl border border-transparent hover:border-eco-200 shadow-sm hover:shadow-xl hover:shadow-eco-900/5 transition-all animate-fade-in"
                                >
                                  <div className="w-12 h-12 bg-slate-50 group-hover:bg-eco-50 rounded-xl flex items-center justify-center transition-colors">
                                    {type === 'categories' ? <Tag size={20} className="text-slate-400 group-hover:text-eco-600" /> : <Layers size={20} className="text-slate-400 group-hover:text-eco-600" />}
                                  </div>
                                  <div className="min-w-0 pr-8">
                                    <div className="text-sm font-bold text-slate-900 truncate group-hover:text-eco-900 transition-colors uppercase">{displayItem?.name}</div>
                                    <div className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{displayItem?.code}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLink(link.id)}
                                    className="absolute top-2 right-2 p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Footer - Fixed */}
            <div className="px-8 py-5 bg-white border-t border-slate-100 flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 px-6 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                {modalMode === 'view' ? 'Close Window' : 'Cancel Changes'}
              </button>
              {modalMode !== 'view' && (
                <button
                  type="submit"
                  form="resource-form"
                  className="flex-[1.5] py-3.5 px-6 bg-eco-900 text-white rounded-2xl font-bold hover:bg-eco-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-eco-900/20 active:scale-95"
                >
                  <Save size={18} />
                  <span>{modalMode === 'create' ? 'Confirm Create' : 'Save Update'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="fixed inset-0 md:left-80 bg-black/40 animate-fade-in" onClick={() => setShowLinkModal(false)}></div>
          <div className="relative w-full max-w-md md:ml-80 bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-black/5 overflow-hidden animate-scale-in">
            <div className="px-7 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-eco-900 flex items-center gap-2">
                <Link2 size={20} className="text-eco-600" />
                Create Association
              </h3>
              <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-red-500 transition-all shadow-sm">
                <X size={18} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Search & Select {type === 'categories' ? 'Brand' : 'Category'}
                </label>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search items..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-tech-lime/20 focus:border-tech-lime transition-all"
                      onChange={(e) => {
                        const term = e.target.value.toLowerCase();
                        const baseOptions = type === 'categories' ? brands : categories;
                        const filtered = baseOptions.filter(item =>
                          !linkedItems.some(linked => (type === 'categories' ? linked.brand?.id : linked.category?.id) === item.id) &&
                          (item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term))
                        );
                        setAvailableForLink(filtered);
                      }}
                    />
                  </div>

                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
                    {availableForLink.length === 0 ? (
                      <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-medium tracking-tight">No results found.</p>
                      </div>
                    ) : (
                      availableForLink.map((item: any) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedForLink(item.id)}
                          className={`w-full text-left p-4 rounded-[1.25rem] transition-all flex items-center justify-between group ${selectedForLink === item.id
                            ? 'bg-eco-900 text-white shadow-xl shadow-eco-900/20'
                            : 'bg-white hover:bg-slate-50 border border-slate-100'
                            }`}
                        >
                          <div className="min-w-0 pr-4">
                            <div className={`text-sm font-bold truncate ${selectedForLink === item.id ? 'text-white' : 'text-slate-900'}`}>{item.name}</div>
                            <div className={`text-[10px] font-mono mt-0.5 truncate ${selectedForLink === item.id ? 'text-eco-200' : 'text-slate-400'}`}>{item.code}</div>
                          </div>
                          {selectedForLink === item.id && (
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                              <Save size={14} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {availableForLink.length === 0 && Array.from(document.querySelectorAll('input[placeholder="Search items..."]')).map(el => (el as HTMLInputElement).value).join('') === '' && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                    <AlertTriangle size={16} className="text-amber-500" />
                    <p className="text-xs text-amber-700 font-medium tracking-tight">Everything is already linked.</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleCreateLink}
                  disabled={!selectedForLink}
                  className="flex-[2] py-3.5 bg-eco-900 text-white rounded-[1.25rem] font-bold hover:bg-eco-800 disabled:opacity-20 disabled:grayscale transition-all flex items-center justify-center gap-2 shadow-xl shadow-eco-900/10 active:scale-95"
                >
                  <Link2 size={16} />
                  <span>Finalize Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
