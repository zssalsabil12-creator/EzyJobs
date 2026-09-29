export default function ForStudents() {
  return (
    <section id="students" className="py-24 bg-[#FAF7F2] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4D00]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl"></div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block text-[#FF4D00] text-sm font-bold tracking-wider mb-3">— للطلاب</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0A0A0A] leading-tight mb-6">
              ابدأ مسيرتك<br />
              <span className="text-[#FF4D00]">أثناء دراستك</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              نوفر لك وظائف مرنة تناسب جدولك الدراسي. اعمل من أي مكان وفي أي وقت، 
              وابنِ خبرتك المهنية قبل التخرج.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {[
                { icon: '⏰', title: 'مرونة في المواعيد', desc: 'اختر ساعات العمل المناسبة لك' },
                { icon: '🎓', title: 'لا يشترط خبرة', desc: 'فرص مناسبة للمبتدئين والطلاب' },
                { icon: '💵', title: 'رواتب مجزية', desc: 'اكسب دخل حقيقي أثناء الدراسة' },
                { icon: '📜', title: 'شهادات معتمدة', desc: 'احصل على شهادات تعزز سيرتك' },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 group-hover:border-[#FF4D00]/30 group-hover:shadow-lg transition-all">
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A0A0A] mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-primary bg-[#0A0A0A] text-white px-8 py-4 rounded-full font-bold hover:bg-[#1a1a1a] transition-colors inline-flex items-center gap-2">
              اكتشف وظائف الطلاب
              <span className="text-[#FF4D00]">←</span>
            </button>
          </div>

          {/* Right Visual */}
          <div className="relative">
            {/* Main Card */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-gray-200/50 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF4D00] to-[#FF6B2C] rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🎓</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A0A0A]">قسم الطلاب</h3>
                    <p className="text-xs text-gray-400">وظائف مصممة لك</p>
                  </div>
                </div>
                <span className="bg-[#FF4D00]/10 text-[#FF4D00] text-xs font-bold px-3 py-1.5 rounded-full">
                  156 وظيفة
                </span>
              </div>

              {/* Sample Jobs */}
              <div className="space-y-3">
                {[
                  { title: 'كاتب محتوى - دوام جزئي', salary: '$500-800', time: '10 ساعات/أسبوع' },
                  { title: 'مصمم سوشيال ميديا', salary: '$400-700', time: '15 ساعة/أسبوع' },
                  { title: 'مترجم نصوص', salary: '$300-600', time: 'مرن' },
                ].map((job, index) => (
                  <div key={index} className="bg-[#FAF7F2] rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#0A0A0A] group-hover:text-[#FF4D00] transition-colors">{job.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">⏰ {job.time}</p>
                      </div>
                      <span className="text-sm font-bold text-[#FF4D00]">{job.salary}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 bg-[#0A0A0A] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1a1a1a] transition-colors">
                عرض جميع الوظائف ←
              </button>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#FFD700] rounded-2xl flex items-center justify-center shadow-xl animate-float">
              <span className="text-4xl">📚</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#FF4D00] rounded-2xl flex items-center justify-center shadow-xl animate-float" style={{ animationDelay: '1s' }}>
              <span className="text-3xl">💼</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
