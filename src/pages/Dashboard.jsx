import React, { useState, useEffect } from 'react';
import { Activity, Clock, ChevronRight, Zap, Wallet, Rocket, Layers, Cpu, Gift, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={24} className="animate-spin text-brand" />
        </div>
      </DashboardLayout>
    );
  }

  const balance = data?.balance ?? 0;
  const usedToday = data?.usedToday ?? 0;
  const dailyLimit = data?.plan?.daily_tokens ?? 0;
  const activeBots = data?.activeBots ?? 0;
  const totalBots = data?.totalBots ?? 0;
  const hasPlan = !!data?.plan;
  const usagePercent = dailyLimit > 0 ? Math.min((usedToday / dailyLimit) * 100, 100) : 0;
  const planName = data?.plan?.name ?? 'No Active Plan';

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-darktext">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name || 'Boss'}. Here is your system status.</p>
        </div>

        {error && (
          <div className="border-l-2 border-red-500 pl-4 py-1">
            <p className="text-xs font-bold text-red-900">Could not load dashboard</p>
            <p className="text-[11px] text-red-800/80 mt-0.5">{error}</p>
          </div>
        )}

        {/* Starter Bonus Banner */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-l-2 border-green-500 pl-4 py-2">
          <div className="flex items-start gap-3">
            <Gift size={20} strokeWidth={1.5} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-green-900">1,000 Free Starter Tokens</h3>
              <p className="text-xs text-green-800/80 mt-1 leading-relaxed max-w-xl">
                Welcome aboard! We've credited your account with 1,000 complimentary tokens to help you get started. Use them to test deployments and explore the platform at no cost.
              </p>
            </div>
          </div>
        </div>

        {/* Stat Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 py-6 border-y border-gray-200 bg-transparent">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Token Balance</span>
            <div className="flex items-center gap-2.5">
              <Wallet size={20} className="text-darktext" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{balance.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Daily Usage</span>
            <div className="flex items-center gap-2.5">
              <Activity size={20} className="text-brand" strokeWidth={1.5} />
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-darktext">{usedToday}</span>
                <span className="text-xs font-semibold text-gray-400">/ {hasPlan ? dailyLimit : <span className="text-red-500">0</span>}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:border-l border-gray-200 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Active Bots</span>
            <div className="flex items-center gap-2.5">
              <Cpu size={20} className="text-green-600" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{activeBots}</span>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deployments</span>
            <div className="flex items-center gap-2.5">
              <Layers size={20} className="text-gray-400" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{totalBots}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-sm font-bold text-darktext uppercase tracking-wider mb-4">Daily Token Usage</h2>
              <div className="border-t border-gray-200 pt-4">
                
                {!hasPlan ? (
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} strokeWidth={1.5} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-darktext mb-1">No active plan</p>
                      <p className="text-xs text-gray-500 leading-relaxed">Choose a plan to unlock daily token refills.</p>
                      <Link to="/dashboard/buy" className="inline-block mt-2 text-xs font-bold text-brand hover:text-brand-dark">
                        Choose a plan →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-brand" strokeWidth={1.5} />
                        <span className="text-sm font-bold text-darktext">{usagePercent.toFixed(0)}% consumed</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                        <Clock size={10} strokeWidth={1.5} /> Resets midnight
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                      <div 
                        className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-orange-400' : 'bg-brand'}`} 
                        style={{ width: `${usagePercent}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">Your token allowance is rationed daily to ensure your bot lasts the full month.</p>
                  </>
                )}

              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-darktext uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="border-t border-gray-200 divide-y divide-gray-100">
                <Link to="/dashboard/deploy" className="flex items-center justify-between py-3 hover:bg-gray-50/50 transition-colors group px-2 -mx-2">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500"><Rocket size={18} strokeWidth={1.5} /></div>
                    <div>
                      <p className="text-sm font-bold text-darktext">Deploy a New Bot</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pair a new WhatsApp number</p>
                    </div>
                  </div>
                  <ChevronRight size={18} strokeWidth={1.5} className="text-gray-400 group-hover:text-brand transition-colors" />
                </Link>
                <Link to="/dashboard/buy" className="flex items-center justify-between py-3 hover:bg-gray-50/50 transition-colors group px-2 -mx-2">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500"><Wallet size={18} strokeWidth={1.5} /></div>
                    <div>
                      <p className="text-sm font-bold text-darktext">Top Up Tokens</p>
                      <p className="text-xs text-gray-500 mt-0.5">Add more tokens to your balance</p>
                    </div>
                  </div>
                  <ChevronRight size={18} strokeWidth={1.5} className="text-gray-400 group-hover:text-brand transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-sm font-bold text-darktext uppercase tracking-wider mb-4">Current Plan</h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-brand" strokeWidth={1.5} />
                  <p className="text-sm font-bold text-darktext">{planName}</p>
                </div>
                {hasPlan && <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Active</span>}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Daily Limit</span>
                  <span className="font-bold text-darktext">{hasPlan ? `${dailyLimit} tokens` : <span className="text-red-500">0</span>}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Bots Allowed</span>
                  <span className="font-bold text-darktext">{hasPlan ? data.plan.bot_limit : <span className="text-red-500">0</span>}</span>
                </div>
              </div>

              {!hasPlan && (
                <Link to="/dashboard/buy" className="flex items-center justify-center gap-1.5 w-full bg-darktext hover:bg-black text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
                  Choose a Plan <ChevronRight size={14} strokeWidth={1.5} />
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
