import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Activity, Clock, TrendingUp, AlertCircle, Wallet, PlusCircle, MinusCircle, Loader2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../utils/api';

const KIND_LABELS = {
  topup: 'Token Top-up',
  signup_bonus: 'Signup Bonus',
  daily_refill: 'Daily Refill',
  bot_deploy_fee: 'Bot Deployment',
  message_usage: 'Message Usage',
  refund: 'Refund',
  admin_adjustment: 'Adjustment',
};

const TokenBalance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getTokenSummary();
        setData(res);
      } catch (err) {
        setError(err.message);
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
  const lifetimeBought = data?.lifetimeBought ?? 0;
  const lifetimeUsed = data?.lifetimeUsed ?? 0;
  const hasPlan = !!data?.plan;
  const dailyLimit = data?.plan?.dailyTokens ?? 0;
  const usagePercent = dailyLimit > 0 ? Math.min((usedToday / dailyLimit) * 100, 100) : 0;
  const remainingToday = hasPlan ? Math.max(dailyLimit - usedToday, 0) : 0;
  const planName = data?.plan?.name ?? 'No Active Plan';

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-darktext">Token Balance</h1>
            <p className="text-sm text-gray-500 mt-1">Detailed view of your token economy.</p>
          </div>
          <Link to="/dashboard/buy" className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all">
            <Zap size={16} strokeWidth={1.5} /> Top Up Tokens
          </Link>
        </div>

        {error && (
          <div className="border-l-2 border-red-500 pl-4 py-1">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 py-6 border-y border-gray-200 bg-transparent">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Available Balance</span>
            <div className="flex items-center gap-2.5">
              <Wallet size={20} className="text-darktext" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{balance.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Used Today</span>
            <div className="flex items-center gap-2.5">
              <Activity size={20} className="text-orange-500" strokeWidth={1.5} />
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-darktext">{usedToday}</span>
                <span className="text-xs font-semibold text-gray-400">/ {hasPlan ? dailyLimit : <span className="text-red-500">0</span>}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:border-l border-gray-200 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Lifetime Used</span>
            <div className="flex items-center gap-2.5">
              <MinusCircle size={20} className="text-gray-400" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{lifetimeUsed.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Lifetime Bought</span>
            <div className="flex items-center gap-2.5">
              <PlusCircle size={20} className="text-green-600" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{lifetimeBought.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-sm font-bold text-darktext uppercase tracking-wider mb-4">Today's Allowance</h2>
              <div className="border-t border-gray-200 pt-6">
                {!hasPlan ? (
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} strokeWidth={1.5} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-darktext mb-1">No active plan</p>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-md mb-3">
                        You haven't chosen a plan yet. Your existing token balance still works for deploying bots, but you'll need a plan to unlock daily refills.
                      </p>
                      <Link to="/dashboard/buy" className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-dark">
                        Choose a plan →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5">
                      <div>
                        <p className="text-4xl font-extrabold text-darktext mb-1">{remainingToday} <span className="text-sm font-medium text-gray-400">tokens left</span></p>
                        <p className="text-xs text-gray-500">Resets at midnight</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md w-fit">
                        <Clock size={12} strokeWidth={1.5} /> Daily ration
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-orange-400' : 'bg-brand'}`} 
                        style={{ width: `${usagePercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 font-semibold">
                      <span>{usedToday} used ({usagePercent.toFixed(0)}%)</span>
                      <span>{dailyLimit} limit</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-darktext uppercase tracking-wider mb-4">Recent Activity</h2>
              <div className="border-t border-gray-200 divide-y divide-gray-100">
                {(!data?.recent || data.recent.length === 0) ? (
                  <p className="py-6 text-xs text-gray-500 text-center">No activity yet.</p>
                ) : (
                  data.recent.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-darktext">{KIND_LABELS[item.kind] || item.kind}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{item.botName || 'System'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-bold ${item.amount > 0 ? 'text-green-600' : 'text-darktext'}`}>
                          {item.amount > 0 ? `+${item.amount}` : item.amount} token{Math.abs(item.amount) !== 1 ? 's' : ''}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link to="/dashboard/transactions" className="text-xs font-bold text-brand hover:text-brand-dark transition-colors">
                  View full transaction history →
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-sm font-bold text-darktext uppercase tracking-wider mb-4">Subscription Info</h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-brand" strokeWidth={1.5} />
                  <p className="text-sm font-bold text-darktext">{planName}</p>
                </div>
                {hasPlan && <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Active</span>}
              </div>

              <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Renewal</span>
                  <span className="font-bold text-darktext">
                    {hasPlan ? new Date(data.plan.renewsAt).toLocaleDateString() : <span className="text-red-500">0</span>}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Daily Ration</span>
                  <span className="font-bold text-darktext">{hasPlan ? `${dailyLimit} tokens` : <span className="text-red-500">0</span>}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Bots Allowed</span>
                  <span className="font-bold text-darktext">{hasPlan ? data.plan.botLimit : <span className="text-red-500">0</span>}</span>
                </div>
              </div>

              {!hasPlan && (
                <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
                  <AlertCircle size={14} strokeWidth={1.5} className="text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    Choose a plan to unlock daily token refills and higher bot limits.
                  </p>
                </div>
              )}

              <Link to="/dashboard/buy" className="flex items-center justify-center gap-2 w-full bg-darktext hover:bg-black text-white font-bold text-xs py-2.5 rounded-lg transition-colors">
                {hasPlan ? 'Manage Plan' : 'Choose a Plan'}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default TokenBalance;
