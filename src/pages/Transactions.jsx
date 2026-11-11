import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Search, Download, Wallet, Smartphone, Filter, ChevronLeft, ChevronRight, CheckCircle2, Clock, PlusCircle, MinusCircle, Loader2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../utils/api';

const KIND_LABELS = {
  topup: { label: 'Token Top-up', icon: PlusCircle, color: 'text-green-600', bg: 'bg-green-50' },
  signup_bonus: { label: 'Signup Bonus', icon: PlusCircle, color: 'text-green-600', bg: 'bg-green-50' },
  daily_refill: { label: 'Daily Refill', icon: PlusCircle, color: 'text-green-600', bg: 'bg-green-50' },
  refund: { label: 'Refund', icon: PlusCircle, color: 'text-green-600', bg: 'bg-green-50' },
  bot_deploy_fee: { label: 'Bot Deploy', icon: MinusCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
  message_usage: { label: 'Message Usage', icon: MinusCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
  admin_adjustment: { label: 'Adjustment', icon: MinusCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, [filterType]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (filterType === 'topup') params.kind = 'topup';
      if (filterType === 'deploy') params.kind = 'bot_deploy_fee';

      const { transactions } = await api.getTransactions(params);
      setTransactions(transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(tx => {
    const q = searchQuery.toLowerCase();
    return (
      tx.id.toString().includes(q) ||
      (tx.refId || '').toLowerCase().includes(q) ||
      tx.kind.includes(q)
    );
  });

  const creditKinds = ['topup', 'signup_bonus', 'daily_refill', 'refund'];
  
  const totalSpent = transactions
    .filter(t => t.amount < 0 && t.kind === 'bot_deploy_fee')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  
  const totalTopups = transactions.filter(t => creditKinds.includes(t.kind)).length;
  
  const totalDeployments = transactions.filter(t => t.kind === 'bot_deploy_fee').length;
  
  const totalTokensBought = transactions
    .filter(t => creditKinds.includes(t.kind) && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);

  // Helper to format "spent" values — red 0.00 when zero
  const renderSpent = (val) => {
    if (val === 0) {
      return <span className="text-red-500">0.00</span>;
    }
    return `KSh ${val.toFixed(2)}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-darktext">Transactions</h1>
            <p className="text-sm text-gray-500 mt-1">View your token purchases and deployment history.</p>
          </div>
          <Link to="/dashboard/buy" className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all">
            <Wallet size={16} strokeWidth={1.5} /> Top Up Tokens
          </Link>
        </div>

        {error && (
          <div className="border-l-2 border-red-500 pl-4 py-1">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 py-6 border-y border-gray-200 bg-transparent">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Spent</span>
            <div className="flex items-center gap-2.5">
              <Receipt size={20} className="text-darktext" strokeWidth={1.5} />
              <span className={`text-2xl font-extrabold ${totalSpent === 0 ? 'text-red-500' : 'text-darktext'}`}>
                {renderSpent(totalSpent)}
              </span>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Credits Received</span>
            <div className="flex items-center gap-2.5">
              <PlusCircle size={20} className="text-green-600" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{totalTopups}</span>
            </div>
          </div>
          <div className="flex flex-col md:border-l border-gray-200 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deployments</span>
            <div className="flex items-center gap-2.5">
              <MinusCircle size={20} className="text-gray-400" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{totalDeployments}</span>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-200 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tokens Earned</span>
            <div className="flex items-center gap-2.5">
              <Smartphone size={20} className="text-brand" strokeWidth={1.5} />
              <span className="text-2xl font-extrabold text-darktext">{totalTokensBought.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 pl-9 pr-4 py-1.5 text-sm outline-none focus:border-brand transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} strokeWidth={1.5} className="text-gray-400" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-b border-gray-300 px-2 py-1.5 text-sm font-medium text-darktext outline-none focus:border-brand w-full sm:w-auto"
            >
              <option value="all">All Types</option>
              <option value="topup">Top-ups</option>
              <option value="deploy">Deployments</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-brand" /></div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600 border-t border-gray-200">
              <thead className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3">Transaction</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Tokens</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                      <Receipt size={24} strokeWidth={1.5} className="mx-auto mb-2 text-gray-300" />
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => {
                    const meta = KIND_LABELS[tx.kind] || KIND_LABELS.admin_adjustment;
                    const Icon = meta.icon;
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-md ${meta.bg} ${meta.color}`}>
                              <Icon size={14} strokeWidth={2}/>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-darktext">{meta.label}</p>
                              <p className="text-[10px] text-gray-500 font-mono">
                                {tx.metadata?.name || tx.refId || `TXN-${tx.id}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold text-xs ${tx.amount > 0 ? 'text-green-600' : 'text-darktext'}`}>
                          {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700">
                            <CheckCircle2 size={12} strokeWidth={2}/> Completed
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-gray-400 hover:text-brand transition-colors p-1">
                            <Download size={16} strokeWidth={1.5} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-darktext">{filtered.length}</span> of <span className="font-bold text-darktext">{transactions.length}</span> entries
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Transactions;
