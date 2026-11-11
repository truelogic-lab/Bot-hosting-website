import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Rocket, Bot, Wallet, PlusCircle, Receipt, Server, LifeBuoy, Search, Bell, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import NotificationPanel from '../components/NotificationPanel';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();

  const user = {
    name: authUser?.name || 'Warren',
    email: authUser?.email || 'warren@example.com',
    initials: (authUser?.name?.[0] || 'W').toUpperCase(),
  };

  // Load unread count on mount
  useEffect(() => {
    let mounted = true;
    const loadUnread = async () => {
      try {
        const data = await api.getNotifications();
        if (mounted) setUnreadCount(data.unread || 0);
      } catch {
        // ignore — user might not be authed yet
      }
    };
    loadUnread();
    return () => { mounted = false; };
  }, []);

  // Re-fetch unread count when panel closes (in case user read them)
  const handleCloseNotifications = async () => {
    setIsNotificationsOpen(false);
    try {
      const data = await api.getNotifications();
      setUnreadCount(data.unread || 0);
    } catch {}
  };

  const navGroups = [
    {
      title: 'Workspace',
      links: [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Deploy New', path: '/dashboard/deploy', icon: Rocket },
        { name: 'My Bots', path: '/dashboard/bots', icon: Bot },
      ]
    },
    {
      title: 'Billing',
      links: [
        { name: 'Token Balance', path: '/dashboard/tokens', icon: Wallet },
        { name: 'Buy Tokens', path: '/dashboard/buy', icon: PlusCircle },
        { name: 'Transactions', path: '/dashboard/transactions', icon: Receipt },
      ]
    },
    {
      title: 'System',
      links: [
        { name: 'Hosting Panels', path: '/dashboard/panels', icon: Server },
        { name: 'Support', path: '/dashboard/support', icon: LifeBuoy },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-brand flex items-center justify-center text-white font-bold text-sm">W</div>
            <span className="text-lg font-bold text-darktext tracking-tight">Warren<span className="text-brand">XMD</span></span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{group.title}</p>
              <div className="space-y-1">
                {group.links.map((link) => {
                  const isActive = location.pathname === link.path;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-50 hover:text-darktext'
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.5} className={isActive ? 'text-brand' : 'text-gray-400'} />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleLogout}>
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-darktext truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
            <LogOut size={16} strokeWidth={1.5} className="text-gray-400 hover:text-red-500" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-darktext">
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <div className="hidden md:flex relative w-64">
              <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." className="w-full bg-gray-50 border border-gray-200 rounded-md pl-9 pr-4 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
              <Zap size={12} strokeWidth={1.5} className="text-brand" /> 1,000 Tokens
            </div>
            <button 
              onClick={() => setIsNotificationsOpen(true)} 
              className="p-2 text-gray-400 hover:text-darktext relative transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      <NotificationPanel 
        isOpen={isNotificationsOpen} 
        onClose={handleCloseNotifications} 
      />
    </div>
  );
};

export default DashboardLayout;
