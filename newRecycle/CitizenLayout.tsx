import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Recycle, 
  History, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  ChevronRight,
  User
} from 'lucide-react';
import { NewRecycleRequest } from './NewRecycleRequest';

interface CitizenLayoutProps {
  onLogout: () => void;
}

type Page = 'dashboard' | 'request' | 'history' | 'settings';

export const CitizenLayout: React.FC<CitizenLayoutProps> = ({ onLogout }) => {
  const [activePage, setActivePage] = useState<Page>('request'); // Default to request as per prompt
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'request', label: 'Recycle Request', icon: Recycle },
    { id: 'history', label: 'My Requests', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <div className="text-center py-20 text-gray-500">Dashboard Coming Soon</div>;
      case 'request':
        return <NewRecycleRequest />;
      case 'history':
        return <div className="text-center py-20 text-gray-500">My Requests Coming Soon</div>;
      case 'settings':
        return <div className="text-center py-20 text-gray-500">Settings Coming Soon</div>;
      default:
        return <NewRecycleRequest />;
    }
  };

  const activeLabel = menuItems.find(i => i.id === activePage)?.label;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-gray-200 text-gray-800 transition-transform duration-300 shadow-sm flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 shrink-0">
           <div className="w-10 h-10 bg-eco-950 rounded-xl flex items-center justify-center text-white shadow-lg">
             <Recycle size={20} className="text-tech-lime" />
           </div>
           <div>
             <h1 className="font-display font-bold text-xl tracking-tight text-eco-950">ELocate</h1>
             <p className="text-[10px] text-eco-600 uppercase tracking-widest">Citizen Portal</p>
           </div>
           <button 
             onClick={() => setIsMobileMenuOpen(false)}
             className="md:hidden ml-auto text-gray-400"
           >
             <X size={20} />
           </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 sidebar-scrollbar">
          {menuItems.map((item) => {
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
                    ? 'bg-eco-50 text-eco-900 font-semibold border border-eco-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <Icon size={18} className={isActive ? 'text-eco-600' : 'text-gray-400 group-hover:text-eco-600 transition-colors'} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className="w-1 h-6 bg-tech-lime absolute left-0 rounded-r-full"></div>}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
               <User size={16} />
             </div>
             <div className="flex-1 min-w-0">
               <div className="text-sm font-medium text-gray-900 truncate">John Doe</div>
               <div className="text-xs text-gray-500 truncate">john.doe@example.com</div>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors text-sm font-medium border border-gray-200 hover:border-red-200"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-white">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 shrink-0 px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-display font-bold text-gray-900 hidden sm:block">
              {activeLabel}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative group">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-tech-lime/50 focus:bg-white transition-all border border-transparent focus:border-tech-lime text-gray-900 placeholder-gray-500"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eco-600 transition-colors" size={16} />
            </div>

            <button className="relative p-2.5 text-gray-500 hover:bg-gray-50 rounded-full transition-colors border border-transparent hover:border-gray-200">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto scroll-smooth bg-white">
          <div className="max-w-5xl mx-auto pb-10">
            {renderContent()}
          </div>
        </main>

      </div>
    </div>
  );
};
