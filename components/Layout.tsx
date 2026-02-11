
import React from 'react';
import { UserProfile } from '../types';
import { 
  LayoutDashboard, 
  PiggyBank, 
  Utensils, 
  AlertTriangle, 
  BarChart3, 
  Settings,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  user: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pigs', label: 'Pig Registry', icon: PiggyBank },
    { id: 'feeding', label: 'Feed Event', icon: Utensils },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: Settings },
    { id: 'help', label: 'Docs', icon: HelpCircle },
  ];

  const handleNavClick = (id: string) => {
    setActiveView(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white sticky top-0 h-screen shrink-0 shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold brand text-pink-500">Liveshock</h1>
          <p className="text-xs text-slate-400 font-medium">NUTRITION SYSTEM</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeView === item.id 
                ? 'bg-pink-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <img 
              src={user?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
              className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-800" 
              alt="Avatar"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name || 'Worker'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role || 'Staff'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold brand text-pink-500">Liveshock</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900 z-40 md:hidden pt-20 px-6 animate-in slide-in-from-right duration-300">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-4 p-4 rounded-xl text-lg ${
                  activeView === item.id ? 'bg-pink-600 text-white' : 'text-slate-400'
                }`}
              >
                <item.icon size={24} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Quick Actions (Sticky) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 safari-bottom-bar-fix">
        <button onClick={() => setActiveView('dashboard')} className={`flex flex-col items-center ${activeView === 'dashboard' ? 'text-pink-600' : 'text-slate-400'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </button>
        <button onClick={() => setActiveView('pigs')} className={`flex flex-col items-center ${activeView === 'pigs' ? 'text-pink-600' : 'text-slate-400'}`}>
          <PiggyBank size={20} />
          <span className="text-[10px] mt-1 font-medium">Pigs</span>
        </button>
        <button onClick={() => setActiveView('feeding')} className="flex flex-col items-center -mt-8">
          <div className="bg-pink-600 text-white p-4 rounded-full shadow-lg ring-4 ring-white">
            <Utensils size={24} />
          </div>
          <span className="text-[10px] mt-1 font-bold text-pink-600">FEED NOW</span>
        </button>
        <button onClick={() => setActiveView('alerts')} className={`flex flex-col items-center ${activeView === 'alerts' ? 'text-pink-600' : 'text-slate-400'}`}>
          <AlertTriangle size={20} />
          <span className="text-[10px] mt-1 font-medium">Alerts</span>
        </button>
        <button onClick={() => setActiveView('reports')} className={`flex flex-col items-center ${activeView === 'reports' ? 'text-pink-600' : 'text-slate-400'}`}>
          <BarChart3 size={20} />
          <span className="text-[10px] mt-1 font-medium">Stats</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
