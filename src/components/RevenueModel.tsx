export default function RevenueModel() {
  const revenueStreams = [
    {
      title: "إعلانات Google AdSense",
      icon: "📢",
      description: "عرض إعلانات غير مزعجة في الموقع تحقق دخل ثابت من الزيارات",
      details: ["إعلانات سياقية", "إعلانات عرضية", "إعلانات داخل المحتوى"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100"
    },
    {
      title: "التسويق بالعمولة",
      icon: "🔗",
      description: "الترويج لمنصات تعليمية وأدوات عمل والحصول على عمولة من كل تسجيل",
      details: ["كورسات Udemy/Coursera", "أدوات Freelance", "استضافات ومواقع", "كتب إلكترونية"],
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100"
    },
    {
      title: "وكالة إعلانية محترمة",
      icon: "🤝",
      description: "التعامل مع وكلاء إعلانات محترمين يعرضون إعلانات ذات صلة بالزوار",
      details: ["إعلانات شركات توظيف", "إعلانات دورات تدريبية", "إعلانات أدوات إنتاجية"],
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100"
    },
    {
      title: "خدمات مميزة مدفوعة",
      icon: "⭐",
      description: "تقديم خدمات إضافية للباحثين عن عمل والشركات مقابل رسوم",
      details: ["تمييز السيرة الذاتية", "إعلانات وظيفية مميزة", "استشارات مهنية", "دورات تحضيرية"],
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100"
    }
  ];

  return (
    <section id="revenue" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block bg-amber-100 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            نموذج الربح
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            كيف نحقق الدخل؟
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            نموذج ربح متنوع ومستدام يضمن استمرار الموقع في تقديم خدمة مجانية 
            للباحثين عن عمل مع تحقيق دخل مجزي
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {revenueStreams.map((stream, index) => (
            <div 
              key={index}
              className={`${stream.bgColor} border ${stream.borderColor} rounded-2xl p-6 hover:shadow-lg transition-all`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stream.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <span className="text-2xl">{stream.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{stream.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{stream.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {stream.details.map((detail) => (
                      <span key={detail} className="text-xs bg-white/70 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200">
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Projection */}
        <div className="mt-12 bg-gradient-to-l from-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">📈 توقعات الدخل الشهري</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                مع نمو الزيارات وتحسين محركات البحث، يمكن تحقيق دخل شهري مستدام 
                من مصادر متعددة دون التأثير على تجربة المستخدم.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">AdSense: 200-500$ شهرياً (10K+ زيارة/يوم)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">التسويق بالعمولة: 300-1000$ شهرياً</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">إعلانات مباشرة: 500-2000$ شهرياً</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">خدمات مميزة: 200-800$ شهرياً</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-400 mb-2">1,200 - 4,300$</div>
                <div className="text-gray-400 text-sm mb-6">دخل شهري متوقع بعد 6 أشهر</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xl font-bold text-white">50K+</div>
                    <div className="text-xs text-gray-400">زيارة/شهر</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xl font-bold text-white">5K+</div>
                    <div className="text-xs text-gray-400">مستخدم مسجل</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-bold text-gray-800 mb-2">نصيحة 1: SEO</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              ركّز على تحسين محركات البحث لكل وظيفة. استخدم كلمات مفتاحية مثل 
              "وظائف عن بُعد"، "عمل أونلاين"، "وظائف للطلاب"
            </p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="text-3xl mb-3">📱</div>
            <h4 className="font-bold text-gray-800 mb-2">نصيحة 2: السوشيال ميديا</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              أنشئ حسابات على تيليجرام وتويتر وانستجرام لنشر الوظائف الجديدة 
              وجذب الزوار بشكل مستمر
            </p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
            <div className="text-3xl mb-3">🔄</div>
            <h4 className="font-bold text-gray-800 mb-2">نصيحة 3: التحديث المستمر</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              حدّث الوظائف يومياً وأضف محتوى مفيد مثل نصائح المقابلات 
              وقوالب السير الذاتية لجذب المزيد من الزوار
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
