export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "تصفّح الوظائف",
      description: "استعرض الوظائف المتاحة من مصادر عالمية موثوقة، مترجمة بالكامل للعربية",
      icon: "🔍",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      step: "02",
      title: "قدّم طلبك",
      description: "اضغط على 'تقدّم الآن' واتبع التعليمات للتقديم مباشرة على الموقع الأصلي",
      icon: "📝",
      gradient: "from-[#FF4D00] to-[#FF6B2C]"
    },
    {
      step: "03",
      title: "تابع حالتك",
      description: "احصل على إشعارات بتحديثات حالة طلبك ونصائح للمقابلة",
      icon: "📬",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      step: "04",
      title: "ابدأ العمل",
      description: "ابدأ رحلتك في العمل عن بُعد مع أفضل الشركات العالمية",
      icon: "🚀",
      gradient: "from-emerald-500 to-teal-600"
    }
  ];

  return (
    <section className="py-24 bg-[#0A0A0A] noise relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#FF4D00] text-sm font-bold tracking-wider mb-3">— الخطوات</span>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            أربع خطوات فقط<br />
            <span className="gradient-text">تفصلك عن حلمك</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-lg">
            عملية بسيطة وشفافة للحصول على وظيفة عن بُعد
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-0 w-full h-px">
                  <div className="w-full h-full bg-gradient-to-l from-white/10 to-transparent"></div>
                </div>
              )}

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-[#FF4D00]/30 transition-all duration-500 group-hover:-translate-y-2">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-6xl font-display font-bold text-white/5 group-hover:text-[#FF4D00]/10 transition-colors">
                    {step.step}
                  </span>
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>

                {/* Arrow */}
                <div className="mt-6 flex items-center gap-2 text-[#FF4D00] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">التالي</span>
                  <span>←</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3">
            <span className="text-white/50 text-sm">جاهز للبدء؟</span>
            <button className="bg-[#FF4D00] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#FF6B2C] transition-colors">
              ابدأ الآن مجاناً
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
