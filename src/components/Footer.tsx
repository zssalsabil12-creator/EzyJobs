export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-l from-teal-600 to-emerald-700 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-3">📬 لا تفوّت أي وظيفة</h3>
                <p className="text-emerald-100">
                  اشترك في النشرة البريدية واحصل على أحدث الوظائف مباشرة في بريدك
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 text-right"
                />
                <button className="bg-white text-teal-700 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-colors whitespace-nowrap">
                  اشترك الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">و</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">وظائف أونلاين</h3>
                <p className="text-xs text-gray-400">بوابتك للعمل عن بُعد</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              نجمع لك أفضل الوظائف عن بُعد من مصادر عالمية موثوقة، 
              مترجمة للعربية لتسهيل الوصول إليها.
            </p>
            <div className="flex gap-3">
              {['𝕏', '📘', '📸', '💬'].map((icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors text-sm">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2.5">
              {['الوظائف المتاحة', 'التصنيفات', 'كيف يعمل', 'نموذج الربح', 'الأسئلة الشائعة'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">مصادر الوظائف</h4>
            <ul className="space-y-2.5">
              {['LinkedIn', 'Upwork', 'Indeed', 'Remote.co', 'We Work Remotely', 'FlexJobs'].map((source) => (
                <li key={source}>
                  <a href="#" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">{source}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">للباحثين عن عمل</h4>
            <ul className="space-y-2.5">
              {['نصائح السيرة الذاتية', 'تحضير المقابلات', 'مهارات مطلوبة', 'وظائف للطلاب', 'عمل حر للمبتدئين', 'أدوات مفيدة'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 وظائف أونلاين. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">سياسة الخصوصية</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">شروط الاستخدام</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">اتصل بنا</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
