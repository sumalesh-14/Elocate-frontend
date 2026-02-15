"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Tag, 
  Smartphone, 
  Building2, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  ChevronRight,
  Users,
  Recycle
} from 'lucide-react';
import { DashboardHome } from './DashboardHome';
import { ResourceManager } from './ResourceManager';
import { PartnerManagement } from './PartnerManagement';
import { CitizenManagement } from './CitizenManagement';
import { RecycleRequests } from './RecycleRequests';

interface AdminLayoutProps {
  onLogout: () => void;
}

type Page = 'dashboard' | 'categories' | 'brands' | 'models' | 'partners' | 'citizens' | 'requests';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Grouped Menu Items
  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'requests', label: 'Recycle Requests', icon: Recycle },
      ]
    },
    {
      title: 'Database Management',
      items: [
        { id: 'categories', label: 'Device Categories', icon: Layers },
        { id: 'brands', label: 'Device Brands', icon: Tag },
        { id: 'models', label: 'Device Models', icon: Smartphone },
      ]
    },
    {
      title: 'Network',
      items: [
        { id: 'partners', label: 'Partner Network', icon: Building2 },
        { id: 'citizens', label: 'Citizen Management', icon: Users },
      ]
    }
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'requests':
        return <RecycleRequests />;
      case 'categories':
        return <ResourceManager type="categories" />;
      case 'brands':
        return <ResourceManager type="brands" />;
      case 'models':
        return <ResourceManager type="models" />;
      case 'partners':
        return <PartnerManagement />;
      case 'citizens':
        return <CitizenManagement />;
      default:
        return <DashboardHome />;
    }
  };

  const activeLabel = menuGroups.flatMap(g => g.items).find(i => i.id === activePage)?.label;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-80 bg-eco-950 text-white transition-transform duration-300 shadow-2xl flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 shrink-0 bg-eco-950">
           <div className="w-10 h-10 bg-gradient-to-br from-tech-lime to-emerald-500 rounded-xl flex items-center justify-center text-eco-950 shadow-lg">
             <span className="font-display font-bold text-xl">EL</span>
           </div>
           <div>
             <h1 className="font-display font-bold text-xl tracking-tight">ELocate</h1>
             <p className="text-[10px] text-eco-400 uppercase tracking-widest">Admin Console</p>
           </div>
           <button 
             onClick={() => setIsMobileMenuOpen(false)}
             className="md:hidden ml-auto text-eco-400"
           >
             <X size={20} />
           </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-8 sidebar-scrollbar bg-eco-950">
          <style>{`
            .sidebar-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .sidebar-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .sidebar-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 20px;
            }
            .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          `}</style>
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[11px] font-bold text-eco-500 uppercase tracking-widest mb-3 opacity-80">{group.title}</h3>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id as Page);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative
                        ${isActive 
                          ? 'bg-gradient-to-r from-tech-lime to-emerald-400 text-eco-900 font-semibold shadow-lg' 
                          : 'text-eco-300 hover:bg-white/5 hover:text-white'}
                      `}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <Icon size={18} className={isActive ? 'text-eco-900' : 'text-eco-400 group-hover:text-tech-lime transition-colors'} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={16} className="text-eco-900 opacity-70" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 bg-black/20 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
             <div className="w-8 h-8 rounded-full bg-tech-lime flex items-center justify-center text-eco-900 font-bold text-xs">AD</div>
             <div className="flex-1 min-w-0">
               <div className="text-sm font-medium text-white truncate">Admin User</div>
               <div className="text-xs text-eco-400 truncate">admin@elocate.app</div>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-red-500/20 text-eco-200 hover:text-red-300 rounded-lg transition-colors text-sm font-medium border border-white/5 hover:border-red-500/20"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 shrink-0 px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-eco-900 hover:bg-eco-50 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-display font-bold text-eco-900 hidden sm:block">
              {activeLabel}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative group">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2.5 bg-slate-100 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-tech-lime/50 focus:bg-white transition-all border border-transparent focus:border-tech-lime text-gray-900 placeholder-gray-500"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-eco-600 transition-colors" size={16} />
            </div>

            <button className="relative p-2.5 text-eco-600 hover:bg-eco-50 rounded-full transition-colors border border-transparent hover:border-eco-100">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto scroll-smooth">
          <div className="w-full pb-10">
            {renderContent()}
          </div>
        </main>

      </div>
    </div>
  );
};
