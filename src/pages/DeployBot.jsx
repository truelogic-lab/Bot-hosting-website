import React, { useState } from 'react';
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
  const [pairingCode, setPairingCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === selectedCode) || COUNTRIES[0];
  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      // 1. Create the bot in the DB (deducts 100 tokens)
      const { bot } = await api.deployBot(botName, fullPhone);

      // 2. Generate the pairing code (mock for now, real Baileys will replace this)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPairingCode('WARRENMD');

      // 3. Store bot ID for confirm
      setPendingBot(bot);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [pendingBot, setPendingBot] = useState(null);

  const handleCopy = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmDeploy = async () => {
    setIsSuccess(true);
    setTimeout(() => navigate('/dashboard/bots'), 2000);
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
              <Link to="/dashboard/buy" className="text-xs font-bold text-brand mt-2 inline-block">Top up tokens →</Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-darktext uppercase tracking-wider mb-4">Bot Details</h2>

              <form onSubmit={handleDeploy} className="space-y-4">
                
                {/* Bot Name */}
                <div>
                  <label className="block text-xs font-bold text-darktext mb-1.5">Bot Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Warren-XMD Main"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    disabled={isLoading || !!pairingCode}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-darktext outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-50"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-darktext mb-1.5">WhatsApp Number</label>
                  <div className={`flex items-center w-full bg-white border ${error ? 'border-red-400' : 'border-gray-300'} rounded-lg p-1 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-all`}>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={!!pairingCode}
                        className="flex items-center gap-1.5 pl-3 pr-2 py-2 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <ChevronDown size={14} strokeWidth={1.5} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                              <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 text-sm pl-9 pr-3 py-1.5 rounded-md outline-none"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCode(country.code);
                                  setIsDropdownOpen(false);
                                  setSearchQuery('');
                                }}
                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                              >
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
                      <input
                        type="tel"
                        placeholder="712345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isLoading || !!pairingCode}
                        className="flex-1 min-w-0 bg-transparent py-2 text-sm text-darktext outline-none disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>
                </div>

                {!pairingCode && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand hover:bg-brand-dark disabled:bg-brand/70 text-white font-bold text-sm py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><Loader2 size={18} className="animate-spin" /> Deploying...</>
                    ) : (
                      <><Rocket size={18} /> Deploy Bot (100 tokens)</>
                    )}
                  </button>
                )}
              </form>

              {pairingCode && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={18} strokeWidth={1.5} className="text-green-500" />
                    <h3 className="text-sm font-bold text-darktext">Bot created! Now pair your phone.</h3>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Your Pairing Code</p>
                      <p className="text-2xl font-mono font-bold text-darktext tracking-[0.2em]">{pairingCode}</p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs font-bold text-brand bg-white border border-gray-200 px-3 py-1.5 rounded-md transition-colors"
                    >
                      {isCopied ? <><Check size={14} className="text-green-500" /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3 mb-4">
                    <AlertTriangle size={18} strokeWidth={1.5} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 mb-1">Next Steps</p>
                      <p className="text-xs text-amber-800/80 leading-relaxed">Open WhatsApp → Settings → Linked Devices → Link with phone number → Enter <span className="font-mono font-bold text-amber-900">{pairingCode}</span>.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmDeploy}
                    className="w-full bg-darktext hover:bg-black text-white font-bold text-sm py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Done, take me to My Bots
                  </button>
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
                Each deployment costs 100 tokens. Top up your balance instantly via M-Pesa.
              </p>
              <Link 
                to="/dashboard/buy" 
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-darktext font-bold text-sm py-2.5 rounded-lg transition-all"
              >
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

        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 text-center shadow-2xl border border-gray-200">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-darktext mb-2">Deployment Queued</h2>
              <p className="text-sm text-gray-500 mb-6">Taking you to My Bots now...</p>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center gap-2 border border-gray-100">
                <Loader2 size={16} strokeWidth={1.5} className="animate-spin text-brand" />
                <span className="text-xs font-bold text-darktext">Redirecting</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default DeployBot;
