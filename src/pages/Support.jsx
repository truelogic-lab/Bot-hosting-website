import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, LifeBuoy, ChevronDown, Mail, MessageCircle, BookOpen, Send, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const faqs = [
    {
      category: 'Billing',
      question: 'How do tokens work?',
      answer: 'Every message your bot processes (sending or receiving) consumes 1 token. Your tokens are rationed daily to ensure your bot lasts the full 30-day billing cycle.'
    },
    {
      category: 'Billing',
      question: 'What happens when my tokens run out?',
      answer: 'Your bot will automatically pause. You can instantly reactivate it by topping up your balance via M-Pesa. Tokens never expire.'
    },
    {
      category: 'Deployment',
      question: 'How do I link my WhatsApp number?',
      answer: 'Go to the Deploy page, enter your number, and click Generate Code. Open WhatsApp on your phone, go to Linked Devices, and enter the 8-character code.'
    },
    {
      category: 'Deployment',
      question: 'Is my WhatsApp account safe?',
      answer: 'Yes. We use official end-to-end encryption session tokens. We never store your WhatsApp password, and you can revoke access from your phone at any time.'
    },
    {
      category: 'System',
      question: 'Can I host multiple bots?',
      answer: 'Yes. Depending on your plan, you can deploy multiple bots on the same dashboard. Each bot requires its own WhatsApp number and costs 100 tokens to deploy.'
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-darktext">Help & Support</h1>
          <p className="text-sm text-gray-500 mt-1">Find answers or get in touch with our team.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-2xl">
          <Search size={18} strokeWidth={1.5} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for answers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-gray-300 pl-8 pr-4 py-3 text-lg outline-none focus:border-brand transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          
          {/* Left Column: FAQs */}
          <div>
            <h2 className="text-sm font-bold text-darktext uppercase tracking-wider mb-4">Frequently Asked Questions</h2>
            
            <div className="border-t border-gray-200">
              {filteredFaqs.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen size={24} strokeWidth={1.5} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-darktext">No answers found</p>
                  <p className="text-xs text-gray-500 mt-1">Try a different search term or contact us.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredFaqs.map((faq, idx) => (
                    <div key={idx} className="py-4">
                      <button 
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-left group"
                      >
                        <span className="text-sm font-semibold text-darktext group-hover:text-brand transition-colors">{faq.question}</span>
                        <ChevronDown size={16} strokeWidth={1.5} className={`text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === idx && (
                        <div className="mt-3 pr-8 animate-in fade-in slide-in-from-top-1 duration-200">
                          <p className="text-xs text-gray-500 leading-relaxed">{faq.answer}</p>
                          <span className="inline-block mt-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-sm">{faq.category}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div>
            <h2 className="text-sm font-bold text-darktext uppercase tracking-wider mb-4">Contact Support</h2>
            
            <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4 space-y-5">
              <div>
                <label className="block text-xs font-bold text-darktext mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="you@example.com"
                  className="w-full bg-transparent border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darktext mb-1.5">Subject</label>
                <select className="w-full bg-transparent border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-darktext outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all">
                  <option>Billing & Tokens</option>
                  <option>Deployment Issue</option>
                  <option>Bot Error</option>
                  <option>General Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-darktext mb-1.5">Message</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Describe your issue in detail..."
                  className="w-full bg-transparent border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-darktext hover:bg-black text-white font-bold text-sm py-3 rounded-lg shadow-sm transition-all"
              >
                <Send size={16} strokeWidth={1.5} /> Send Message
              </button>

              {isSubmitted && (
                <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 border border-green-100 p-3 rounded-lg animate-in fade-in duration-300">
                  <CheckCircle2 size={16} strokeWidth={1.5} /> Message sent! We'll respond within 24 hours.
                </div>
              )}
            </form>

            {/* Direct Contact Links */}
            <div className="mt-8 border-t border-gray-200 pt-4 space-y-3">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Alternative Channels</p>
              
              <a href="mailto:support@warren.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand transition-colors">
                <Mail size={16} strokeWidth={1.5} className="text-gray-400" /> support@warren.com
              </a>
              <a href="#" className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand transition-colors">
                <MessageCircle size={16} strokeWidth={1.5} className="text-gray-400" /> WhatsApp Support Group
              </a>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Support;
