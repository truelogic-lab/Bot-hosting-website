import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, Lock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { formatPrice } from '../utils/pricing';
import { api } from '../utils/api';

const BuyTokens = () => {
  const navigate = useNavigate();
  
  const [bundles, setBundles] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingBundles, setLoadingBundles] = useState(true);

  // Fetch bundles from database on load
  useEffect(() => {
    (async () => {
      try {
        const { bundles } = await api.getBundles();
        setBundles(bundles);
        if (bundles.length > 0) {
          // Default select the second bundle (usually the "Popular" one)
          const defaultBundle = bundles.length > 1 ? bundles[1] : bundles[0];
          setSelectedBundle(defaultBundle.id);
        }
      } catch (err) {
        setError('Failed to load token bundles.');
      } finally {
        setLoadingBundles(false);
      }
    })();
  }, []);

  const isCustom = customAmount.trim() !== '' && Number(customAmount) > 0;
  const presetBundle = bundles.find(b => b.id === selectedBundle);
  
  // Calculate final tokens and price
  const finalTokens = isCustom 
    ? Math.floor(Number(customAmount) * 100) 
    : (presetBundle ? presetBundle.tokens : 0);
    
  const finalPrice = isCustom 
    ? Number(customAmount) 
    : (presetBundle ? presetBundle.priceKes : 0);

  const handleBundleSelect = (id) => {
    setSelectedBundle(id);
    setCustomAmount('');
    setError('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    if (val) setSelectedBundle(null);
    setError('');
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setError('Please enter a valid M-Pesa phone number.');
      return;
    }

    if (finalPrice < 10) {
      setError('Minimum purchase is KSh 10.');
      return;
    }

    setIsProcessing(true);

    try {
      const formattedPhone = cleanPhone.startsWith('0') ? '254' + cleanPhone.slice(1) : cleanPhone;
      const res = await api.stkPush(formattedPhone, finalPrice);

      setSuccessMessage(`STK Push sent to ${phoneNumber}. Enter your PIN on your phone to complete.`);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-2xl font-bold text-darktext mb-1">Top Up Tokens</h1>
          <p className="text-sm text-graytext">Tokens power your bot's daily operations. Select a bundle or enter a custom amount.</p>
        </div>

        {error && !isSuccess && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
            <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div>
              <h2 className="text-sm font-bold text-darktext mb-3">Select a Bundle</h2>
              {loadingBundles ? (
                <div className="py-8 flex justify-center"><Loader2 size={20} className="animate-spin text-brand" /></div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {bundles.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleBundleSelect(b.id)}
                      className={`relative flex flex-col items-center justify-center py-5 px-2 rounded-xl border text-center transition-all ${
                        selectedBundle === b.id 
                          ? 'border-brand bg-brand/5 ring-1 ring-brand' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {b.label && (
                        <span className="absolute -top-2.5 bg-brand text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          {b.label}
                        </span>
                      )}
                      <span className="text-lg font-bold text-darktext">{b.tokens.toLocaleString()}</span>
                      <span className="text-[10px] font-medium text-graytext uppercase mb-1">Tokens</span>
                      <span className="text-sm font-semibold text-darktext">{formatPrice(b.priceKes)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-darktext mb-1">Or Enter Custom Amount</h2>
              <p className="text-xs text-graytext mb-4">Rate: 1,000 tokens = KSh 10</p>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-medium">KSh</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter amount (e.g. 50)"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-darktext font-semibold outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                />
              </div>
              {isCustom && (
                <p className="text-xs text-brand font-semibold mt-3">
                  You will receive {finalTokens.toLocaleString()} tokens for {formatPrice(finalPrice)}.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <form onSubmit={handlePurchase} className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 shadow-sm">
              <h2 className="text-sm font-bold text-darktext mb-4 pb-4 border-b border-gray-100">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-graytext">Tokens</span>
                  <span className="font-bold text-darktext">{finalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-graytext">Price</span>
                  <span className="font-bold text-darktext">{formatPrice(finalPrice)}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-darktext mb-2">M-Pesa Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-sm font-semibold text-gray-500">+254</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-14 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-darktext outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    required
                  />
                </div>
                <p className="text-[10px] text-graytext mt-1.5 flex items-center gap-1"><Lock size={10} /> STK push will be sent to this number.</p>
              </div>

              <button
                type="submit"
                disabled={isProcessing || finalPrice < 10}
                className="w-full bg-brand hover:bg-brand-dark disabled:bg-brand/50 text-white font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending STK Push...</>
                ) : (
                  <>Pay {formatPrice(finalPrice)}</>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-graytext">
                <ShieldCheck size={12} className="text-green-500" /> Secure payment via Safaricom
              </div>
            </form>
          </div>

        </div>

        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-darktext mb-2">Payment Initiated</h2>
              <p className="text-sm text-graytext mb-6">{successMessage}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-sm py-3 rounded-xl transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default BuyTokens;
