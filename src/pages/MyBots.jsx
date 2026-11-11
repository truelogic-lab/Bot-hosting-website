import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Plus, Search, MoreVertical, Play, Pause, Trash2, Cpu, ServerOff, Zap, Loader2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../utils/api';

const MyBots = () => {
  const [bots, setBots] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Fetch both bots and dashboard summary (for the daily limit)
        const [botsRes, dashRes] = await Promise.all([
          api.getBots(),
          api.getDashboard()
        ]);
        setBots(botsRes.bots);
        setDashboardData(dashRes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    bot.phone.includes(searchQuery)
  );

  const toggleStatus = async (bot) => {
    const newStatus = bot.status === 'online' ? 'offline' : 'online';
    setBots(prev => prev.map(b => b.id === bot.id ? { ...b, status: newStatus } : b));
    try {
      await api.updateBotStatus(bot.id, newStatus);
    } catch (err) {
      setBots(prev => prev.map(b => b.id === bot.id ? { ...b, status: bot.status } : b));
      setError(err.message);
    }
    setActiveMenu(null);
  };

  const deleteBot = async (id) => {
    if (!window.confirm("Are you sure? This will permanently delete the bot.")) return;
    try {
      await api.deleteBot(id);
      setBots(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
    setActiveMenu(null);
  };

  const activeCount = bots.filter(b => b.status === 'online').length;
  const dailyLimit = dashboardData?.plan?.daily_tokens;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-darktext">My Bots</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and monitor your deployed WhatsApp instances.</p>
          </div>
          <Link to="/dashboard/deploy" className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all">
            <Plus size={16} strokeWidth={1.5} /> Deploy New Bot
          </Link>
        </div>

        {error && (
          <div className="border-l-2 border-red-500 pl-4 py-1">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 py-6 border-y border-gray-200 bg-white px-4 md:px-6 rounded-xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Bots</span>
            <div className="flex items-center gap-2.5">
              <Layers size={20} className="text-darktext" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{bots.length}</span>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-100 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Online</span>
            <div className="flex items-center gap-2.5">
              <Cpu size={20} className="text-green-600" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{activeCount}</span>
            </div>
          </div>
          <div className="flex flex-col md:border-l border-gray-100 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Offline</span>
            <div className="flex items-center gap-2.5">
              <ServerOff size={20} className="text-gray-400" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{bots.length - activeCount}</span>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-100 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Daily Limit</span>
            <div className="flex items-center gap-2.5">
              <Zap size={20} className="text-brand" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{dailyLimit ? dailyLimit : <span className="text-red-500">0</span>}</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 pl-9 pr-4 py-1.5 text-sm outline-none focus:border-brand transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 size={24} className="animate-spin text-brand" />
            </div>
          ) : filteredBots.length === 0 ? (
            <div className="py-12 text-center">
              <Layers size={24} strokeWidth={1.5} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-darktext mb-1">No bots yet</p>
              <p className="text-xs text-gray-500 mb-4">Deploy your first bot to get started.</p>
              <Link to="/dashboard/deploy" className="text-xs font-bold text-brand hover:text-brand-dark">Deploy a bot →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredBots.map((bot) => (
                <div key={bot.id} className="py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group px-1 -mx-1 rounded-md">
                  
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 ${bot.status === 'online' ? 'text-green-600' : 'text-gray-400'}`}>
                      <Cpu size={18} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-darktext truncate">{bot.name}</p>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          bot.status === 'online' ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {bot.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{bot.phone}</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-8 text-xs">
                    <div>
                      <p className="text-gray-500 mb-0.5">Deployed</p>
                      <p className="font-semibold text-darktext">{new Date(bot.deployedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <button onClick={() => toggleStatus(bot)} className="p-2 text-gray-400 hover:text-darktext transition-colors hidden sm:block" title={bot.status === 'online' ? 'Pause' : 'Start'}>
                      {bot.status === 'online' ? <Pause size={16} strokeWidth={1.5} /> : <Play size={16} strokeWidth={1.5} />}
                    </button>

                    <div className="relative">
                      <button onClick={() => setActiveMenu(activeMenu === bot.id ? null : bot.id)} className="p-2 text-gray-400 hover:text-darktext transition-colors">
                        <MoreVertical size={16} strokeWidth={1.5} />
                      </button>

                      {activeMenu === bot.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                            <button onClick={() => toggleStatus(bot)} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 sm:hidden">
                              {bot.status === 'online' ? <><Pause size={14} strokeWidth={1.5}/> Pause</> : <><Play size={14} strokeWidth={1.5}/> Start</>}
                            </button>
                            <button onClick={() => deleteBot(bot.id)} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                              <Trash2 size={14} strokeWidth={1.5} /> Delete Bot
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MyBots;
