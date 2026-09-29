export default function RevenueSection() {
  return (
    <section id="revenue" className="py-24 bg-[#0A0A0A] noise relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#FF4D00]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-[#FFD700]/5 rounded-full blur-[80px]"></div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#FF4D00] text-sm font-bold tracking-wider mb-3">— نموذج الربح</span>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            كيف نحقق<br />
            <span className="gradient-text">الدخل المستدام؟</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg">
            نموذج ربح متنوع ومستدام يضمن استمرار الموقع في تقديم خدمة مجانية 
            مع تحقيق دخل مجزي
          </p>
        </div>

        {/* Revenue Streams Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* AdSense */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-[#FF4D00]/30 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📢</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">إعلانات Google AdSense</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  عرض إعلانات غير مزعجة في الموقع تحقق دخل ثابت من الزيارات اليومية
                </p>
                <div className="flex flex-wrap gap-2">
                  {['إعلانات سياقية', 'إعلانات عرضية', 'إعلانات داخل المحتوى'].map((item) => (
                    <span key={item} className="text-xs bg-white/5 text-white/60 px-3 py-1.5 rounded-full border border-white/10">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Affiliate */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-[#FF4D00]/30 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔗</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">التسويق بالعمولة</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  الترويج لمنصات تعليمية وأدوات عمل والحصول على عمولة من كل تسجيل
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Udemy/Coursera', 'أدوات Freelance', 'استضافات ومواقع'].map((item) => (
                    <span key={item} className="text-xs bg-white/5 text-white/60 px-3 py-1.5 rounded-full border border-white/10">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ad Agency */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-[#FF4D00]/30 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🤝</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">وكالة إعلانية محترمة</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  التعامل مع وكلاء إعلانات محترمين يعرضون إعلانات ذات صلة بالزوار
                </p>
                <div className="flex flex-wrap gap-2">
                  {['شركات توظيف', 'دورات تدريبية', 'أدوات إنتاجية'].map((item) => (
                    <span key={item} className="text-xs bg-white/5 text-white/60 px-3 py-1.5 rounded-full border border-white/10">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Premium Services */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-[#FF4D00]/30 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">خدمات مميزة مدفوعة</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  تقديم خدمات إضافية للباحثين عن عمل والشركات مقابل رسوم
                </p>
                <div className="flex flex-wrap gap-2">
                  {['تمييز السيرة الذاتية', 'إعلانات مميزة', 'استشارات مهنية'].map((item) => (
                    <span key={item} className="text-xs bg-white/5 text-white/60 px-3 py-1.5 rounded-full border border-white/10">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Projection */}
        <div className="bg-gradient-to-br from-[#FF4D00]/10 to-[#FFD700]/5 border border-[#FF4D00]/20 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                📈 توقعات الدخل الشهري
              </h3>
              <p className="text-white/60 leading-relaxed mb-6">
                مع نمو الزيارات وتحسين محركات البحث، يمكن تحقيق دخل شهري مستدام 
                من مصادر متعددة دون التأثير على تجربة المستخدم.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'AdSense: 200-500$ شهرياً', color: 'bg-blue-400', visitors: '10K+ زيارة/يوم' },
                  { label: 'التسويق بالعمولة: 300-1000$ شهرياً', color: 'bg-emerald-400', visitors: '' },
                  { label: 'إعلانات مباشرة: 500-2000$ شهرياً', color: 'bg-purple-400', visitors: '' },
                  { label: 'خدمات مميزة: 200-800$ شهرياً', color: 'bg-orange-400', visitors: '' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                    <span className="text-sm text-white/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="text-center">
                <div className="text-5xl font-bold gradient-text font-display mb-2">1,200 - 4,300$</div>
                <div className="text-white/50 text-sm mb-8">دخل شهري متوقع بعد 6 أشهر</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white font-display">50K+</div>
                    <div className="text-xs text-white/40 mt-1">زيارة/شهر</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white font-display">5K+</div>
                    <div className="text-xs text-white/40 mt-1">مستخدم مسجل</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: '🎯', title: 'نصيحة 1: SEO', desc: 'ركّز على تحسين محركات البحث لكل وظيفة. استخدم كلمات مفتاحية مثل "وظائف عن بُعد"، "عمل أونلاين"' },
            { icon: '📱', title: 'نصيحة 2: السوشيال ميديا', desc: 'أنشئ حسابات على تيليجرام وتويتر وانستجرام لنشر الوظائف وجذب الزوار' },
            { icon: '🔄', title: 'نصيحة 3: التحديث المستمر', desc: 'حدّث الوظائف يومياً وأضف محتوى مفيد مثل نصائح المقابلات وقوالب السير الذاتية' },
          ].map((tip, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#FF4D00]/30 transition-all">
              <div className="text-3xl mb-3">{tip.icon}</div>
              <h4 className="font-bold text-white mb-2">{tip.title}</h4>
              <p className="text-sm text-white/50 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
