import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">و</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">وظائف أونلاين</h1>
              <p className="text-[10px] text-gray-400 -mt-1">بوابتك للعمل عن بُعد</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#jobs" className="text-gray-600 hover:text-teal-600 transition-colors font-medium text-sm">الوظائف</a>
            <a href="#categories" className="text-gray-600 hover:text-teal-600 transition-colors font-medium text-sm">التصنيفات</a>
            <a href="#how" className="text-gray-600 hover:text-teal-600 transition-colors font-medium text-sm">كيف يعمل</a>
            <a href="#revenue" className="text-gray-600 hover:text-teal-600 transition-colors font-medium text-sm">نموذج الربح</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm text-gray-600 hover:text-teal-600 font-medium transition-colors">
              تسجيل الدخول
            </button>
            <button className="bg-gradient-to-l from-teal-500 to-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-teal-200 transition-all">
              سجّل مجاناً
            </button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4">
            <nav className="flex flex-col gap-3">
              <a href="#jobs" className="text-gray-600 hover:text-teal-600 font-medium text-sm py-2">الوظائف</a>
              <a href="#categories" className="text-gray-600 hover:text-teal-600 font-medium text-sm py-2">التصنيفات</a>
              <a href="#how" className="text-gray-600 hover:text-teal-600 font-medium text-sm py-2">كيف يعمل</a>
              <a href="#revenue" className="text-gray-600 hover:text-teal-600 font-medium text-sm py-2">نموذج الربح</a>
              <button className="bg-gradient-to-l from-teal-500 to-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium mt-2">
                سجّل مجاناً
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
