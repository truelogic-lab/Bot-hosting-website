import React, { useState } from 'react';
import { BadgeCheck, Zap, Gift, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/pricing';

const Pricing = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Starter', desc: 'Perfect for personal use and testing.',
      monthlyKes: 20, yearlyKes: 200,
      monthlyTokens: 2000,
      features: ['Basic Bot Commands', 'Standard Support', '1 Device Pairing', 'YouTube & TikTok Downloads'],
      highlighted: false, color: 'orange',
    },
    {
      name: 'Pro', desc: 'For power users and growing communities.',
      monthlyKes: 60, yearlyKes: 600,
      monthlyTokens: 10000,
      features: ['Everything in Starter', 'Priority 24/7 Support', '3 Device Pairings', 'Anti-Delete & Anti-Link', 'Auto-Status & Auto-Reply', 'Instagram Downloaders'],
      highlighted: true, badge: 'Most Popular', color: 'brand',
    },
    {
      name: 'Elite', desc: 'The ultimate bot experience for professionals.',
      monthlyKes: 100, yearlyKes: 1000,
      monthlyTokens: 25000,
      features: ['Everything in Pro', 'VIP Priority Support', '5 Device Pairings', 'Advanced AI & Stalkers', 'Anti-Call & Anti-Edit', 'Custom Bot Name & Prefix', 'Auto-Bio & Auto-Post'],
      highlighted: false, color: 'purple',
    },
  ];

  const tokenBundles = [
    { tokens: 1000, price: 10 },
    { tokens: 5000, price: 45 },
    { tokens: 15000, price: 120 },
    { tokens: 50000, price: 350 },
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'orange': return { border: 'border-2 border-orange-500', button: 'bg-orange-500 hover:bg-orange-600 text-white shadow-md', icon: 'text-orange-500', badge: 'bg-orange-500', tokenBg: 'bg-orange-50 text-orange-700' };
      case 'purple': return { border: 'border-2 border-purple-500', button: 'bg-purple-500 hover:bg-purple-600 text-white shadow-md', icon: 'text-purple-500', badge: 'bg-purple-500', tokenBg: 'bg-purple-50 text-purple-700' };
      case 'brand':
      default:       return { border: 'border-2 border-brand shadow-xl shadow-brand/10 md:-translate-y-4', button: 'bg-brand hover:bg-brand-dark text-white shadow-md', icon: 'text-brand', badge: 'bg-brand', tokenBg: 'bg-brand/10 text-brand' };
    }
  };

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-block bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">Subscription Plans</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-darktext mb-4">Choose the Perfect Plan<br />for Your Community</h2>
          <p className="text-graytext text-sm md:text-base">Every plan includes a daily token allowance to ensure your bot runs smoothly all month long.</p>

          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-darktext' : 'text-graytext'}`}>Monthly Plan</span>
            <button onClick={() => setIsYearly(!isYearly)} className="w-14 h-7 bg-brand rounded-full p-1 transition-colors relative">
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-darktext' : 'text-graytext'}`}>Yearly Plan</span>
            <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md ml-2">Save 20%</div>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto mb-16">
          {plans.map((plan, idx) => {
            const baseKes = isYearly ? plan.yearlyKes : plan.monthlyKes;
            const displayPrice = formatPrice(baseKes);
            const colors = getColorClasses(plan.color);
            
            // Token Math: Total / 30 days
            const totalTokens = isYearly ? plan.monthlyTokens * 12 : plan.monthlyTokens;
            const dailyLimit = Math.floor(plan.monthlyTokens / 30);

            return (
              <div key={idx} className={`relative rounded-2xl p-6 md:p-8 flex flex-col h-full transition-all duration-300 bg-white ${plan.highlighted ? colors.border : `border border-gray-100 shadow-sm hover:shadow-md ${colors.border}`}`}>
                {plan.badge && (
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full ${colors.badge}`}>{plan.badge}</div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-darktext">{plan.name}</h3>
                  <p className="text-xs text-graytext mt-1 h-8">{plan.desc}</p>
                </div>

                <div className="mb-4 border-b border-gray-100 pb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-darktext">{displayPrice}</span>
                    <span className="text-xs text-graytext">/{isYearly ? 'yr' : 'mo'}</span>
                  </div>
                  {isYearly && <p className="text-[10px] text-brand font-medium mt-1">Billed annually</p>}
                </div>

                {/* Token Breakdown Badge */}
                <div className={`px-3 py-2.5 rounded-lg mb-4 ${colors.tokenBg} flex flex-col gap-1`}>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="shrink-0" />
                    <span className="text-xs font-bold">{totalTokens.toLocaleString()} tokens {isYearly ? '/yr' : '/mo'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] opacity-80 font-medium pl-6">
                    <Clock size={12} />
                    <span>~{dailyLimit.toLocaleString()} tokens per day (30d ration)</span>
                  </div>
                </div>

                <button onClick={() => navigate('/signup')} className={`w-full mb-6 py-2.5 rounded-full text-xs font-bold transition-all ${colors.button}`}>Get Started</button>

                <div className="mb-2 flex-1">
                  <h4 className="text-xs font-bold text-darktext uppercase tracking-wider mb-4">What's included</h4>
                  <ul className="space-y-3.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-graytext">
                        <BadgeCheck size={18} className={`shrink-0 ${colors.icon}`} strokeWidth={2.5} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Token Top-up Section */}
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gift size={20} className="text-brand" />
                <h3 className="text-xl md:text-2xl font-extrabold text-darktext">Need Extra Tokens?</h3>
              </div>
              <p className="text-sm text-graytext">Hit your daily limit? Top up instantly. Extra tokens stack on top of your monthly allowance.</p>
            </div>
            <div className="bg-white border border-brand/20 rounded-xl px-4 py-2 text-center">
              <p className="text-[10px] text-graytext uppercase font-bold tracking-wider">Free Signup Bonus</p>
              <p className="text-lg font-extrabold text-brand">1,000 <span className="text-xs font-medium text-graytext">tokens</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tokenBundles.map((bundle, i) => (
              <button 
                key={i} 
                onClick={() => navigate('/signup')}
                className="group bg-white border border-gray-200 hover:border-brand rounded-2xl p-4 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <Zap size={20} className="text-brand mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-lg font-extrabold text-darktext">{bundle.tokens.toLocaleString()}</p>
                <p className="text-[10px] text-graytext uppercase tracking-wider font-bold mb-2">tokens</p>
                <p className="text-sm font-bold text-brand">{formatPrice(bundle.price)}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
