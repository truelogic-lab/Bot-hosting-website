import React, { useState, useEffect } from 'react';
import { Rocket, Smartphone, ChevronDown, Search, Loader2, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Copy, Check, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { COUNTRIES, detectDefaultCountry } from '../utils/pricing';
import { api } from '../utils/api';

const DeployBot = () => {
  const navigate = useNavigate();

  const [selectedCode, setSelectedCode] = useState(detectDefaultCountry());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [botName, setBotName] = useState('Warren-XMD');
  const [pendingBot, setPendingBot] = useState(null);
  const [pairingCode, setPairingCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setDashboardData).catch(() => {});
  }, []);

  // Poll for pairing code once a deploy is pending
  useEffect(() => {
    if (!pendingBot) return;
    let cancelled = false;

    const interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const { bots } = await api.getBots();
        const current = bots.find(b => b.id === pendingBot.id);
        if (!current) return;

        if (current.pairingCode) {
          setPairingCode(current.pairingCode);
          clearInterval(interval);
        }
        if (current.status === 'online') {
          // Paired! Redirect to bots list
          navigate('/dashboard/bots');
        }
        if (current.lastError) {
          setError(current.lastError);
          setPendingBot(null);
          clearInterval(interval);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pendingBot, navigate]);

  const selectedCountry = COUNTRIES.find(c => c.code === selectedCode) || COUNTRIES[0];
  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDeploy = async (e) => {
    e.preventDefault();
    setError('');
    setPairingCode(null);
    setIsLoading(true);

    let cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('0')) cleanNumber = cleanNumber.substring(1);

    if (cleanNumber.length < 6) {
      setError('Please enter a valid phone number.');
      setIsLoading(false);
      return;
    }

    const fullPhone = `+${selectedCountry.dial}${cleanNumber}`;

    try {
      const { bot } = await api.deployBot(botName, fullPhone);
      setPendingBot(bot);
      // Don't stop loading — pairing code hasn't arrived yet
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-darktext">Deploy New Bot</h1>
          <p className="text-sm text-gray-500 mt-1">Pair your WhatsApp number to launch a new Warren-XMD instance.</p>
        </div>

        {error && (
          <div className="border-l-2 border-red-500 pl-4 py-1">
            <p className="text-xs font-bold text-red-900">Deployment failed</p>
            <p className="text-[11px] text-red-800/80 mt-0.5">{error}</p>
            {error.includes('Insufficient') && (
              <Link to="/dashboard/buy" className="text-xs font-bold text-brand mt-2 inline-block">Top up tokens</Link>
            )}
            {error.includes('plan') && (
              <Link to="/dashboard/buy" className="text-xs font-bold text-brand mt-2 inline-block">Upgrade your plan</Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-darktext uppercase tracking-wider">Bot Details</h2>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {dashboardData?.totalBots ?? 0} / {dashboardData?.plan?.bot_limit ?? '—'} bots used
                </span>
              </div>

              <form onSubmit={handleDeploy} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-darktext mb-1.5">Bot Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Warren-XMD Main"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    disabled={isLoading || !!pendingBot}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-darktext outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-darktext mb-1.5">WhatsApp Number</label>
                  <div className={`flex items-center w-full bg-white border ${error ? 'border-red-400' : 'border-gray-300'} rounded-lg p-1 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-all`}>
                    <div className="relative">
                      <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} disabled={!!pendingBot} className="flex items-center gap-1.5 pl-3 pr-2 py-2 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50">
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <ChevronDown size={14} strokeWidth={1.5} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                              <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 text-sm pl-9 pr-3 py-1.5 rounded-md outline-none" autoFocus />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredCountries.map((country) => (
                              <button key={country.code} type="button" onClick={() => { setSelectedCode(country.code); setIsDropdownOpen(false); setSearchQuery(''); }} className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors text-left">
                                <span className="text-sm text-darktext">{country.flag} {country.name}</span>
                                <span className="text-xs text-gray-500 font-mono">+{country.dial}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="w-px h-5 bg-gray-300"></div>
                    <div className="flex items-center flex-1 px-3">
                      <span className="text-sm font-semibold text-gray-500 mr-1">+{selectedCountry.dial}</span>
                      <input type="tel" placeholder="712345678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isLoading || !!pendingBot} className="flex-1 min-w-0 bg-transparent py-2 text-sm text-darktext outline-none disabled:opacity-50" required />
                    </div>
                  </div>
                </div>

                {!pendingBot && !pairingCode && (
                  <button type="submit" disabled={isLoading} className="w-full bg-brand hover:bg-brand-dark disabled:bg-brand/70 text-white font-bold text-sm py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating bot...</> : <><Rocket size={18} /> Deploy Bot (100 tokens)</>}
                  </button>
                )}
              </form>

              {/* Waiting for engine */}
              {pendingBot && !pairingCode && !error && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <Loader2 size={20} className="animate-spin text-brand" />
                    <div>
                      <p className="text-sm font-bold text-darktext">Provisioning your bot...</p>
                      <p className="text-xs text-gray-500 mt-0.5">The engine is starting your instance. Pairing code will appear in a few seconds.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pairing code ready */}
              {pairingCode && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={18} strokeWidth={1.5} className="text-green-500" />
                    <h3 className="text-sm font-bold text-darktext">Pairing code ready</h3>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Your Pairing Code</p>
                      <p className="text-2xl font-mono font-bold text-darktext tracking-[0.2em]">{pairingCode}</p>
                    </div>
                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-bold text-brand bg-white border border-gray-200 px-3 py-1.5 rounded-md transition-colors">
                      {isCopied ? <><Check size={14} className="text-green-500" /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle size={18} strokeWidth={1.5} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 mb-1">Next steps</p>
                      <p className="text-xs text-amber-800/80 leading-relaxed">Open WhatsApp on your phone → Settings → Linked Devices → Link with phone number → Enter <span className="font-mono font-bold text-amber-900">{pairingCode}</span>.</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 mt-4 text-center">
                    Code expires in 60 seconds. The page will update automatically when you pair.
                  </p>
                </div>
              )}

            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-brand"><Wallet size={16} strokeWidth={1.5} /></div>
                <p className="text-[10px] font-bold text-brand uppercase tracking-widest">Need more tokens?</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-5">
                Each deployment costs 100 tokens. Top up instantly via M-Pesa.
              </p>
              <Link to="/dashboard/buy" className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-darktext font-bold text-sm py-2.5 rounded-lg transition-all">
                Buy More Tokens
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-3">
              <div className="text-gray-500 shrink-0 mt-0.5"><ShieldCheck size={16} strokeWidth={1.5} /></div>
              <div>
                <h3 className="text-xs font-bold text-darktext mb-1">End-to-End Encrypted</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">We never store your WhatsApp password or private messages.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default DeployBot;
