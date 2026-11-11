import React from 'react';
import { Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-darktext text-white pt-12 md:pt-16 pb-6 md:pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Grid: 1 col (Brand) + 2 cols (Links/Contact) on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10 md:mb-12">
          
          {/* Brand Col - Spans full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xl">
                W
              </div>
              <span className="text-2xl font-bold tracking-tight">
                warren<span className="text-brand font-medium">site</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6 max-w-sm">
              The most advanced, secure, and modular WhatsApp bot engine. Powered by Warren.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider mb-4 text-white">Platform</h4>
            <ul className="space-y-3 text-xs md:text-sm text-gray-400">
              <li><a href="#" className="hover:text-brand transition-colors">Pairing</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider mb-4 text-white">Resources</h4>
            <ul className="space-y-3 text-xs md:text-sm text-gray-400">
              <li><a href="#" className="hover:text-brand transition-colors">GitHub Repo</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Commands List</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Support Group</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Status</a></li>
            </ul>
          </div>

          {/* Contact - Spans full width on mobile to align nicely under links */}
          <div className="col-span-2 md:col-span-1 mt-4 md:mt-0 pt-6 md:pt-0 border-t border-gray-800 md:border-t-0">
            <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider mb-4 text-white">Contact</h4>
            <ul className="space-y-3 text-xs md:text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-brand shrink-0" /> support@warren.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-brand shrink-0" /> +256 233 306
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-[10px] md:text-xs text-center md:text-left">
            © {new Date().getFullYear()} Warren-XMD. All rights reserved.
          </p>
          <div className="flex gap-3 md:gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand transition-colors">
              <i className="fab fa-github text-sm"></i>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand transition-colors">
              <i className="fab fa-whatsapp text-sm"></i>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand transition-colors">
              <i className="fab fa-youtube text-sm"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
