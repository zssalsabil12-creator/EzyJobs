import { useState } from 'react';

interface NavigationProps {
  scrollY: number;
}

export default function Navigation({ scrollY }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScrolled = scrollY > 50;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'py-3 glass-dark' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 bg-[#FF4D00] rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                <span className="text-white font-display font-bold text-xl">W</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD700] rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-display font-bold text-xl tracking-tight">WAZIFAH</h1>
              <p className="text-white/50 text-[10px] font-medium tracking-wider">REMOTE WORK HUB</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              { label: 'الوظائف', href: '#jobs' },
              { label: 'التصنيفات', href: '#categories' },
              { label: 'للطلاب', href: '#students' },
              { label: 'لوحة الناشر', href: '#publisher' },
              { label: 'نموذج الربح', href: '#revenue' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#FF4D00] group-hover:w-3/4 transition-all duration-300"></span>
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              دخول
            </button>
            <button className="btn-primary bg-[#FF4D00] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#FF6B2C] transition-colors">
              ابدأ مجاناً
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <span className={`absolute top-1 right-0 w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`absolute top-3 right-0 w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`absolute top-5 right-0 w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-6 pb-6 border-t border-white/10 pt-6 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {['الوظائف', 'التصنيفات', 'للطلاب', 'لوحة الناشر', 'نموذج الربح'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-white/80 hover:text-white text-lg font-medium transition-colors"
                >
                  {item}
                </a>
              ))}
              <button className="btn-primary bg-[#FF4D00] text-white px-6 py-3 rounded-full text-sm font-bold mt-4">
                ابدأ مجاناً
              </button>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
}
