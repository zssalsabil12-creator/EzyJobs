export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-[#FF4D00] rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">W</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl tracking-tight">WAZIFAH</h3>
                <p className="text-white/40 text-[10px] tracking-wider">REMOTE WORK HUB</p>
              </div>
            </div>
            <p className="text-white/50 leading-relaxed mb-6 max-w-sm">
              نجمع لك أفضل الوظائف عن بُعد من مصادر عالمية موثوقة، 
              مترجمة بالكامل للعربية لتسهيل الوصول إليها.
            </p>
            <div className="flex gap-3">
              {[
                { icon: '𝕏', label: 'Twitter' },
                { icon: '📘', label: 'Facebook' },
                { icon: '📸', label: 'Instagram' },
                { icon: '💬', label: 'Telegram' },
                { icon: '🔗', label: 'LinkedIn' },
              ].map((social) => (
                <a 
                  key={social.label}
                  href="#" 
                  className="w-10 h-10 bg-white/5 hover:bg-[#FF4D00] rounded-xl flex items-center justify-center transition-all duration-300 text-sm"
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm tracking-wider">روابط سريعة</h4>
            <ul className="space-y-3">
              {['الوظائف المتاحة', 'التصنيفات', 'كيف يعمل', 'نموذج الربح', 'الأسئلة الشائعة'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/40 hover:text-[#FF4D00] transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 text-sm tracking-wider">مصادر الوظائف</h4>
            <ul className="space-y-3">
              {['LinkedIn', 'Upwork', 'Indeed', 'Remote.co', 'We Work Remotely', 'FlexJobs'].map((source) => (
                <li key={source}>
                  <a href="#" className="text-sm text-white/40 hover:text-[#FF4D00] transition-colors">{source}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 text-sm tracking-wider">للباحثين عن عمل</h4>
            <ul className="space-y-3">
              {['نصائح السيرة الذاتية', 'تحضير المقابلات', 'مهارات مطلوبة', 'وظائف للطلاب', 'عمل حر للمبتدئين'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/40 hover:text-[#FF4D00] transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/30">
              © 2026 WAZIFAH. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">سياسة الخصوصية</a>
              <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">شروط الاستخدام</a>
              <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">اتصل بنا</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
