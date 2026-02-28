import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { ChatWidget } from './components/ChatWidget';
import { SignIn } from './components/SignIn';
import { AdminLayout } from './components/admin/AdminLayout';
import { CitizenLayout } from './components/citizen/CitizenLayout';
import { ToastProvider } from './context/ToastContext';
import { Footer } from './components/Footer';
import { Leaf, Menu, MapPin, Recycle, BarChart3, User, LogOut } from 'lucide-react';

const AppContent: React.FC = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // DEFAULT TO TRUE FOR TESTING - Change to false for production
  const [isAdminView, setIsAdminView] = useState(false);
  const [isCitizenView, setIsCitizenView] = useState(false);

  const handleSignIn = () => {
    setIsAuthenticated(true);
    setShowSignIn(false);
    // Default to Citizen View for this demo unless specific logic exists
    setIsCitizenView(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsAdminView(false);
    setIsCitizenView(false);
  };

  if (isAdminView) {
    return <AdminLayout onLogout={handleSignOut} />;
  }

  if (isCitizenView) {
    return <CitizenLayout onLogout={handleSignOut} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-eco-950 font-sans selection:bg-tech-lime selection:text-eco-900 flex flex-col">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-white/70 backdrop-blur-lg border-b border-eco-100/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-12 h-12 bg-eco-950 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform duration-300">
              <Recycle size={26} className="relative z-10 text-tech-lime" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-tech-lime/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-eco-950">ELocate</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {['Find Facility', 'Materials Guide', 'Our Impact'].map((item) => (
              <a key={item} href="#" className="relative text-sm font-semibold text-eco-800 hover:text-eco-600 transition-colors group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-tech-lime group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
               <div className="flex items-center gap-3">
                 <button 
                  onClick={() => setIsCitizenView(true)}
                  className="px-5 py-2.5 bg-eco-100 rounded-xl text-eco-900 text-sm font-bold hover:bg-eco-200 transition-colors"
                 >
                   Dashboard
                 </button>
                 <button 
                  onClick={handleSignOut}
                  className="w-10 h-10 rounded-full bg-eco-50 border border-eco-200 flex items-center justify-center text-eco-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                  title="Sign Out"
                 >
                   <LogOut size={18} />
                 </button>
               </div>
            ) : (
              <button 
                onClick={() => setShowSignIn(true)}
                className="hidden sm:flex px-6 py-3 rounded-xl border border-eco-200 text-sm font-bold text-eco-900 hover:bg-eco-50 hover:border-eco-300 transition-all shadow-sm"
              >
                Sign In
              </button>
            )}
            
            <button className="md:hidden p-2 text-eco-900">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Hero />
        
        {/* Features / Glass Grid Section */}
        <section className="py-32 px-6 relative z-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="group p-10 rounded-[2.5rem] bg-[#F8F9FA] hover:bg-white border border-transparent hover:border-eco-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 text-eco-600 group-hover:bg-eco-600 group-hover:text-white transition-colors shadow-sm">
                  <MapPin size={32} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">Smart Geo-Location</h3>
                <p className="text-eco-800/60 leading-relaxed font-light">
                  Instantly find certified recycling centers near you. Filter by device type, battery acceptance, and hours.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-10 rounded-[2.5rem] bg-eco-950 text-white shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-tech-lime rounded-full blur-[80px] opacity-20 translate-x-10 -translate-y-10 group-hover:opacity-30 transition-opacity"></div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 text-tech-lime group-hover:bg-tech-lime group-hover:text-eco-900 transition-colors backdrop-blur-sm">
                  <Leaf size={32} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">AI Material Analysis</h3>
                <p className="text-white/70 leading-relaxed font-light">
                  Unsure what's inside? Our AI chatbot breaks down device components and disposal hazards in seconds.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-10 rounded-[2.5rem] bg-[#F8F9FA] hover:bg-white border border-transparent hover:border-eco-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 text-eco-600 group-hover:bg-eco-600 group-hover:text-white transition-colors shadow-sm">
                  <BarChart3 size={32} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">Impact Tracking</h3>
                <p className="text-eco-800/60 leading-relaxed font-light">
                  Visualize your contribution to the circular economy. Track CO2 saved and metals recovered over time.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Floating Chat Component */}
      <ChatWidget />

      {/* Sign In Modal */}
      <SignIn 
        isOpen={showSignIn} 
        onClose={() => setShowSignIn(false)}
        onSignIn={handleSignIn}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;