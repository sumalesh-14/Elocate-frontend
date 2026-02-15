'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, X, Save, Eye, Layers, Tag, Smartphone } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ResourceManagerProps {
  type: 'categories' | 'brands' | 'models';
}

// Initial Mock Data State
const INITIAL_DATA = {
  categories: [
    { id: 'CAT-01', name: 'Smartphones', desc: 'Mobile handheld devices', count: 1240, status: 'Active' },
    { id: 'CAT-02', name: 'Laptops', desc: 'Portable computers', count: 850, status: 'Active' },
    { id: 'CAT-03', name: 'Batteries', desc: 'Lithium-ion & Alkaline', count: 5420, status: 'Warning' },
    { id: 'CAT-04', name: 'Monitors', desc: 'LCD, LED, CRT screens', count: 320, status: 'Active' },
  ],
  brands: [
    { id: 'BRD-01', name: 'Apple', origin: 'USA', partnership: 'Gold', status: 'Active' },
    { id: 'BRD-02', name: 'Samsung', origin: 'South Korea', partnership: 'Platinum', status: 'Active' },
    { id: 'BRD-03', name: 'Dell', origin: 'USA', partnership: 'Silver', status: 'Active' },
    { id: 'BRD-04', name: 'Generic', origin: 'Global', partnership: 'None', status: 'Inactive' },
  ],
  models: [
    { id: 'MOD-882', name: 'iPhone 13 Pro', brand: 'Apple', category: 'Smartphones', recyclability: 'High', status: 'Active' },
    { id: 'MOD-192', name: 'Galaxy S21', brand: 'Samsung', category: 'Smartphones', recyclability: 'Medium', status: 'Active' },
    { id: 'MOD-334', name: 'XPS 15 9500', brand: 'Dell', category: 'Laptops', recyclability: 'High', status: 'Active' },
    { id: 'MOD-112', name: 'ThinkPad X1', brand: 'Lenovo', category: 'Laptops', recyclability: 'Medium', status: 'Active' },
  ]
};

export const ResourceManager: React.FC<ResourceManagerProps> = ({ type }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [data, setData] = useState(INITIAL_DATA[type]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentItem, setCurrentItem] = useState<any>(null);

  // Configuration for titles and form fields
  const config = {
    categories: {
      title: 'Device Categories',
      description: 'Manage main categories for e-waste classification.',
      columns: ['ID', 'Name', 'Description', 'Items Count', 'Status'],
      icon: Layers
    },
    brands: {
      title: 'Device Brands',
      description: 'Registered manufacturers and brands.',
      columns: ['ID', 'Brand Name', 'Origin', 'Partnership', 'Status'],
      icon: Tag
    },
    models: {
      title: 'Device Models',
      description: 'Specific device models for valuation and recycling instructions.',
      columns: ['Model ID', 'Model Name', 'Brand', 'Category', 'Recyclability', 'Status'],
      icon: Smartphone
    }
  }[type];

  // Handlers
  const handleOpenCreate = () => {
    setModalMode('create');
    // Reset form with default values based on type
    const defaultItem = type === 'categories' ? { name: '', desc: '', status: 'Active' } 
      : type === 'brands' ? { name: '', origin: '', partnership: 'None', status: 'Active' }
      : { name: '', brand: '', category: '', recyclability: 'Medium', status: 'Active' };
    
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
  };

  const handleDeactivate = (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this item?')) {
      setData(data.map((item: any) => 
        item.id === id ? { ...item, status: 'Inactive' } : item
      ));
      showToast(`${config.title.slice(0, -1)} deactivated successfully.`, 'info');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'create') {
      const newItem = {
        ...currentItem,
        id: `${type.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        count: 0 // Default for categories
      };
      setData([...data, newItem]);
      showToast(`${config.title.slice(0, -1)} created successfully!`);
    } else {
      setData(data.map((item: any) => 
        item.id === currentItem.id ? currentItem : item
      ));
      showToast(`${config.title.slice(0, -1)} updated successfully!`);
    }
    
    setIsModalOpen(false);
  };

  const filteredData = data.filter((item: any) => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const FormField = ({ label, value, field, type = "text", options = [] }: any) => (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
      {options.length > 0 ? (
        <div className="relative">
          <select
            value={value}
            disabled={modalMode === 'view'}
            onChange={(e) => setCurrentItem({ ...currentItem, [field]: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 appearance-none text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
          >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      ) : (
        <input 
          type={type}
          value={value}
          disabled={modalMode === 'view'}
          onChange={(e) => setCurrentItem({ ...currentItem, [field]: e.target.value })}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
          placeholder={`Enter ${label.toLowerCase()}...`}
          required={modalMode !== 'view'}
        />
      )}
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
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
            <Filter size={16} /> Filters
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                {config.columns.map((col, i) => (
                  <th key={i} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{col}</th>
                ))}
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((row: any, i: number) => (
                <tr key={i} className="group hover:bg-gray-50/80 transition-colors">
                  {Object.keys(row).map((key, j) => {
                     if (key === 'id') {
                       return <td key={j} className="px-6 py-4 text-xs font-mono text-gray-400">{row[key]}</td>
                     }
                     // Check if this cell is a 'Status' field to render a badge
                     if (key.toLowerCase() === 'status') {
                       return (
                         <td key={j} className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${row[key] === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 
                                row[key] === 'Inactive' ? 'bg-gray-50 text-gray-600 border border-gray-100' : 
                                'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                              {row[key]}
                            </span>
                         </td>
                       )
                     }
                     if (key.toLowerCase() === 'recyclability') {
                        return (
                          <td key={j} className="px-6 py-4">
                             <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${row[key] === 'High' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                               <span className="text-sm text-gray-700">{row[key]}</span>
                             </div>
                          </td>
                        )
                     }
                     return (
                      <td key={j} className="px-6 py-4 text-sm text-gray-700">
                        {j === 1 || j === 2 ? <span className="font-medium text-eco-900">{row[key]}</span> : row[key]}
                      </td>
                     )
                  })}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenView(row)}
                        className="p-2 text-eco-600 hover:bg-eco-50 rounded-lg transition-colors tooltip"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(row)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {row.status !== 'Inactive' && (
                        <button 
                          onClick={() => handleDeactivate(row.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                          title="Deactivate"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
             <div className="p-12 text-center text-gray-500">No items found.</div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredData.length}</span> of <span className="font-medium">{data.length}</span> results</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-eco-900 text-white rounded-md text-sm">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Add/Edit/View Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 md:left-72 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-fade-in-up">
            
            {/* Header */}
            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
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

            {/* Form Body */}
            <form onSubmit={handleSave} className="p-8 space-y-5">
              
              {/* Conditional Fields based on Type */}
              {type === 'categories' && (
                <>
                  <FormField label="Category Name" value={currentItem.name} field="name" />
                  <FormField label="Description" value={currentItem.desc} field="desc" />
                  <FormField label="Status" value={currentItem.status} field="status" options={['Active', 'Inactive', 'Warning']} />
                </>
              )}

              {type === 'brands' && (
                <>
                  <FormField label="Brand Name" value={currentItem.name} field="name" />
                  <FormField label="Origin Country" value={currentItem.origin} field="origin" />
                  <FormField label="Partnership Level" value={currentItem.partnership} field="partnership" options={['None', 'Silver', 'Gold', 'Platinum']} />
                  <FormField label="Status" value={currentItem.status} field="status" options={['Active', 'Inactive']} />
                </>
              )}

              {type === 'models' && (
                <>
                  <FormField label="Model Name" value={currentItem.name} field="name" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Brand" value={currentItem.brand} field="brand" />
                    <FormField label="Category" value={currentItem.category} field="category" options={['Smartphones', 'Laptops', 'Tablets']} />
                  </div>
                  <FormField label="Recyclability Score" value={currentItem.recyclability} field="recyclability" options={['Low', 'Medium', 'High']} />
                  <FormField label="Status" value={currentItem.status} field="status" options={['Active', 'Inactive']} />
                </>
              )}

              <div className="pt-4 flex gap-3">
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
                    className="flex-1 py-3 bg-eco-900 text-white rounded-xl font-medium hover:bg-eco-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Save size={18} />
                    {modalMode === 'create' ? 'Create Item' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
