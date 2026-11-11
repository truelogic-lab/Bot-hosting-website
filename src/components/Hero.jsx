import React from 'react';
import { ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-white overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-light/10 rounded-bl-[100px] -z-10 hidden lg:block"></div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl pt-4 md:pt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold tracking-wide uppercase mb-6">
              <ShieldCheck size={14} /> The #1 WhatsApp Bot Engine
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-darktext leading-[1.15] mb-6 mt-2">
              Power up your WhatsApp <br className="hidden md:block" />
              with <span className="text-brand">Warren-XMD</span>
            </h1>

            <p className="text-graytext text-base md:text-lg mb-8 leading-relaxed">
              The most advanced, highly secure WhatsApp bot. Manage groups, auto-download media, and secure your chats with a seamless cloud deployment.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-8 py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Get Started Now
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-brand text-darktext font-semibold text-sm px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
              >
                <UserPlus size={16} className="text-brand" />
                Create Account
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-xs md:text-sm text-graytext"><span className="text-brand font-bold">✓</span> Anti-Delete</div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-graytext"><span className="text-brand font-bold">✓</span> Anti-Link</div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-graytext"><span className="text-brand font-bold">✓</span> Auto-Status</div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-graytext"><span className="text-brand font-bold">✓</span> 24/7 Uptime</div>
            </div>
          </div>

          <div className="relative hidden lg:flex justify-center items-center">
            <img src="/illustration.png" alt="Warren-XMD Bot Illustration" className="w-full max-w-lg object-cover drop-shadow-2xl rounded-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
