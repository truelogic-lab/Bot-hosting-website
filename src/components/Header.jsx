import React, { useState } from 'react';
import { Menu, X, ChevronDown, Phone, Mail } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#', hasDropdown: false },
    { name: 'Hosting', href: '#', hasDropdown: true },
    { name: 'Domains', href: '#', hasDropdown: true },
    { name: 'Website', href: '#', hasDropdown: false },
    { name: 'Help', href: '#', hasDropdown: true },
    { name: 'Pages', href: '#', hasDropdown: true },
    { name: 'More', href: '#', hasDropdown: true },
  ];

  return (
    <header className="w-full font-sans relative z-50 bg-white">
      {/* Top Mini Bar */}
      <div className="bg-white border-b border-gray-100 text-xs text-graytext py-2 hidden md:block">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
          <div>
            <a href="#" className="hover:text-brand transition-colors">Get Free Shared Hosting</a>
          </div>
          <div className="flex items-center gap-6">
            <a href="tel:+256233306" className="flex items-center gap-1.5 hover:text-brand transition-colors">
              <Phone size={14} className="text-brand" /> +256 233 306
            </a>
            <a href="mailto:support@warren.com" className="flex items-center gap-1.5 hover:text-brand transition-colors">
              <Mail size={14} className="text-brand" /> support@warren.com
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="shadow-sm py-3 md:py-4">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
          
          {/* Logo — uses your actual logo.jpg */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img 
              src="/logo.jpg" 
              alt="Warren-XMD" 
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-gray-100"
            />
            <span className="text-xl md:text-2xl font-bold text-darktext tracking-tight">
              warren<span className="text-brand font-medium">site</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group cursor-pointer flex items-center gap-1 text-sm font-medium text-graytext hover:text-brand transition-colors">
                <span>{link.name}</span>
                {link.hasDropdown && <ChevronDown size={14} className="text-graytext group-hover:text-brand transition-colors" />}
              </div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <button className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg">
              Free Trial
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-darktext hover:text-brand transition-colors p-2 -mr-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((link) => (
            <div key={link.name} className="flex items-center justify-between text-sm font-medium text-darktext py-3 border-b border-gray-50 last:border-0">
              <span>{link.name}</span>
              {link.hasDropdown && <ChevronDown size={16} className="text-graytext" />}
            </div>
          ))}
          <button className="w-full mt-4 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300">
            Free Trial
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
