import React from 'react';
import { Zap, ShieldCheck, Download, Sparkles, Users, Flame } from 'lucide-react';

const Banner = () => {
  const ads = [
    { text: "Instant Pairing & Deployment", icon: <Zap size={14} className="text-brand" /> },
    { text: "Advanced Anti-Delete & Anti-Link", icon: <ShieldCheck size={14} className="text-brand" /> },
    { text: "AI Chat, Stalkers & Downloaders", icon: <Sparkles size={14} className="text-brand" /> },
    { text: "Unlimited Group Management", icon: <Users size={14} className="text-brand" /> },
    { text: "99.9% Cloud Uptime", icon: <Flame size={14} className="text-brand" /> },
    { text: "YouTube, TikTok & IG Downloaders", icon: <Download size={14} className="text-brand" /> },
  ];

  return (
    <div className="w-full bg-darktext text-white py-2.5 overflow-hidden border-b border-gray-800 relative z-50">
      <div className="flex w-max animate-marquee">
        {/* We duplicate the array to create a seamless infinite loop */}
        {[...ads, ...ads, ...ads].map((ad, idx) => (
          <div key={idx} className="flex items-center gap-2 mx-6 whitespace-nowrap text-xs font-medium text-gray-300">
            {ad.icon}
            <span>{ad.text}</span>
            <span className="ml-6 text-gray-600">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banner;
