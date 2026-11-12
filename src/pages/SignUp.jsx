import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Check, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/pricing';

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 20, daily: 67,
    features: ['1 Bot', 'Basic commands', '5k messages/mo', 'Community support'],
    color: 'orange',
  },
  {
    id: 'pro', name: 'Pro', price: 60, daily: 333,
    features: ['3 Bots', 'All commands', '50k messages/mo', 'Priority support', 'Anti-Delete'],
    color: 'brand', popular: true,
  },
  {
    id: 'elite', name: 'Elite', price: 100, daily: 833,
    features: ['5 Bots', 'All commands', 'Unlimited messages', 'VIP support', 'Custom features'],
    color: 'purple',
  },
];

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleCompleteSignup = async () => {
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, password, selectedPlan);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      if (err.message.toLowerCase().includes('exists')) {
        setStep(1);
      }
    }
  };

  const getColorClasses = (color) => {
    if (color === 'orange') return { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', badge: 'bg-orange-500' };
    if (color === 'purple') return { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-500' };
    return { border: 'border-brand', bg: 'bg-brand/5', text: 'text-brand', badge: 'bg-brand' };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        
        {/* Logo */}
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <img src="/logo.jpg" alt="Warren-XMD" className="w-10 h-10 rounded-full object-cover" />
          <span className="text-2xl font-bold text-darktext">warren<span className="text-brand">site</span></span>
        </Link>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 1 ? 'text-brand' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-brand text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <Check size={12} strokeWidth={3} /> : '1'}
            </span>
            Account
          </div>
          <div className={`h-px w-12 ${step >= 2 ? 'bg-brand' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 2 ? 'text-brand' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-brand text-white' : 'bg-gray-200'}`}>2</span>
            Plan
          </div>
        </div>

        {/* Step 1: Account details */}
        {step === 1 && (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-darktext">Create your account</h2>
              <p className="mt-2 text-sm text-gray-500">Already have an account? <Link to="/login" className="font-medium text-brand hover:text-brand-dark">Sign in</Link></p>
            </div>

            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-white py-8 px-6 shadow rounded-2xl border border-gray-100">
                <form className="space-y-5" onSubmit={handleNextStep}>
                  <div>
                    <label className="block text-sm font-medium text-darktext">Full Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={18} className="text-gray-400" /></div>
                      <input 
                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-brand focus:border-brand sm:text-sm outline-none" 
                        placeholder="Warren Dev" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darktext">Email address</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={18} className="text-gray-400" /></div>
                      <input 
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-brand focus:border-brand sm:text-sm outline-none" 
                        placeholder="you@example.com" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darktext">Password</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-gray-400" /></div>
                      <input 
                        type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-brand focus:border-brand sm:text-sm outline-none" 
                        placeholder="••••••••" 
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Minimum 6 characters.</p>
                  </div>

                  {error && <p className="text-xs font-medium text-red-500">{error}</p>}

                  <button 
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-brand hover:bg-brand-dark transition-colors"
                  >
                    Continue
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Choose plan */}
        {step === 2 && (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-darktext">Choose your plan</h2>
              <p className="mt-2 text-sm text-gray-500">Start free for 30 days. Upgrade or downgrade anytime.</p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const colors = getColorClasses(plan.color);
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                      isSelected 
                        ? `${colors.border} ${colors.bg} shadow-lg` 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {plan.popular && (
                      <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.badge}`}>
                        Popular
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-darktext">{plan.name}</h3>
                      {isSelected && <Check size={20} className={colors.text} strokeWidth={3} />}
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-extrabold text-darktext">{formatPrice(plan.price)}</span>
                      <span className="text-xs text-gray-500">/mo</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 mb-4">
                      <Zap size={12} className="text-brand" /> {plan.daily} tokens/day
                    </div>
                    <ul className="space-y-1.5">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <Check size={12} className={`${colors.text} shrink-0 mt-0.5`} strokeWidth={3} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {error && <p className="text-xs text-red-500 text-center mt-4">{error}</p>}

            <div className="mt-8 max-w-md mx-auto flex gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="px-4 py-3 rounded-xl border border-gray-300 text-darktext font-bold text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleCompleteSignup}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-dark transition-colors disabled:opacity-70"
              >
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
              </button>
            </div>

            <p className="text-[10px] text-gray-500 text-center mt-4 max-w-md mx-auto">
              By creating an account you agree to our Terms. Your 30-day free trial starts now — no payment required today.
            </p>
          </>
        )}

      </div>
    </div>
  );
};

export default SignUp;
