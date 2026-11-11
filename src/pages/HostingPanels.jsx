import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, Search, ExternalLink, Key, Eye, EyeOff, Copy, Check, ShieldAlert, Cpu, HardDrive, Terminal, Loader2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../utils/api';

const HostingPanels = () => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { panels } = await api.getPanels();
        setPanels(panels);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredPanels = panels.filter(panel => 
    panel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (panel.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePassword = async (panel) => {
    if (visiblePasswords[panel.id]) {
      setVisiblePasswords(prev => ({ ...prev, [panel.id]: null }));
      return;
    }
    try {
      const { password } = await api.revealPanelPassword(panel.id);
      setVisiblePasswords(prev => ({ ...prev, [panel.id]: password }));
    } catch (err) {
      setError(err.message);
    }
  };

  const copyToClipboard = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const activeCount = panels.filter(p => p.status === 'active').length;
  const suspendedCount = panels.filter(p => p.status === 'suspended').length;
  const totalRam = panels.reduce((s, p) => s + (p.ramMb || 0), 0);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-darktext">Hosting Panels</h1>
          <p className="text-sm text-gray-500 mt-1">Access your server credentials and control panels.</p>
        </div>

        {error && (
          <div className="border-l-2 border-red-500 pl-4 py-1">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        <div className="flex items-start gap-3 border-l-2 border-amber-500 pl-4 py-1">
          <ShieldAlert size={18} strokeWidth={1.5} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-900">Security Notice</p>
            <p className="text-[11px] text-amber-800/80 leading-relaxed mt-0.5">Never share these credentials. Warren-XMD staff will never ask for your panel password.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 py-6 border-y border-gray-200 bg-transparent">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Panels</span>
            <div className="flex items-center gap-2.5">
              <Server size={20} className="text-darktext" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{panels.length}</span>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Active</span>
            <div className="flex items-center gap-2.5">
              <Cpu size={20} className="text-green-600" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{activeCount}</span>
            </div>
          </div>
          <div className="flex flex-col md:border-l border-gray-200 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Suspended</span>
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={20} className="text-red-500" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{suspendedCount}</span>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total RAM</span>
            <div className="flex items-center gap-2.5">
              <HardDrive size={20} className="text-brand" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{totalRam >= 1024 ? `${(totalRam / 1024).toFixed(1)}GB` : `${totalRam}MB`}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search panels..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 pl-9 pr-4 py-1.5 text-sm outline-none focus:border-brand transition-all"
            />
          </div>
        </div>

        <div className="border-t border-gray-200">
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-brand" /></div>
          ) : filteredPanels.length === 0 ? (
            <div className="py-12 text-center">
              <Server size={24} strokeWidth={1.5} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-darktext mb-1">No panels found</p>
              <p className="text-xs text-gray-500 mb-4">Deploy a bot to automatically provision a hosting panel.</p>
              <Link to="/dashboard/deploy" className="text-xs font-bold text-brand hover:text-brand-dark">Deploy a bot →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPanels.map((panel) => (
                <div key={panel.id} className="py-6 flex flex-col lg:flex-row gap-6">
                  
                  <div className="lg:w-1/3 shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Terminal size={16} strokeWidth={1.5} className="text-gray-400" />
                      <h3 className="text-sm font-bold text-darktext">{panel.name}</h3>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        panel.status === 'active' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {panel.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{panel.panelType} {panel.ip ? `• ${panel.ip}` : ''}</p>
                    
                    <div className="flex items-center gap-4 text-[11px] text-gray-600 font-medium">
                      {panel.ramMb && <span>RAM: {panel.ramMb}MB</span>}
                      {panel.cpuPercent && <span>CPU: {panel.cpuPercent}%</span>}
                      {panel.diskMb && <span>Disk: {panel.diskMb}MB</span>}
                    </div>
                  </div>

                  <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Username</label>
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <span className="font-mono text-xs text-darktext">{panel.username || '—'}</span>
                        {panel.username && (
                          <button onClick={() => copyToClipboard(panel.username, `user-${panel.id}`)} className="text-gray-400 hover:text-brand transition-colors">
                            {copiedField === `user-${panel.id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} strokeWidth={1.5} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <span className="font-mono text-xs text-darktext">
                          {visiblePasswords[panel.id] || '••••••••••••'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => togglePassword(panel)} className="text-gray-400 hover:text-darktext transition-colors">
                            {visiblePasswords[panel.id] ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                          </button>
                          {visiblePasswords[panel.id] && (
                            <button onClick={() => copyToClipboard(visiblePasswords[panel.id], `pass-${panel.id}`)} className="text-gray-400 hover:text-brand transition-colors">
                              {copiedField === `pass-${panel.id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} strokeWidth={1.5} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <a 
                        href={panel.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                          panel.status === 'active' 
                            ? 'bg-darktext hover:bg-black text-white' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                        }`}
                      >
                        Launch Control Panel <ExternalLink size={14} strokeWidth={1.5} />
                      </a>
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

export default HostingPanels;
