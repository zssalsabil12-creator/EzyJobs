export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "تصفّح الوظائف",
      description: "استعرض الوظائف المتاحة من مصادر عالمية موثوقة، مترجمة بالكامل للعربية",
      icon: "🔍",
      color: "from-blue-500 to-indigo-500"
    },
    {
      step: "02",
      title: "قدّم طلبك",
      description: "اضغط على 'تقدّم الآن' واتبع التعليمات للتقديم مباشرة على الموقع الأصلي",
      icon: "📝",
      color: "from-teal-500 to-emerald-500"
    },
    {
      step: "03",
      title: "تابع حالتك",
      description: "احصل على إشعارات بتحديثات حالة طلبك ونصائح للمقابلة",
      icon: "📬",
      color: "from-purple-500 to-pink-500"
    },
    {
      step: "04",
      title: "ابدأ العمل",
      description: "ابدأ رحلتك في العمل عن بُعد مع أفضل الشركات العالمية",
      icon: "🚀",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section id="how" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block bg-teal-100 text-teal-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            سهل وبسيط
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            كيف يعمل الموقع؟
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            أربع خطوات بسيطة تفصلك عن وظيفة أحلامك عن بُعد
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-l from-gray-200 to-gray-100 -z-0"></div>
              )}
              
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all relative z-10">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <span className="text-xs font-bold text-gray-300 mb-2 block">{step.step}</span>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-14 bg-gradient-to-l from-teal-50 to-emerald-50 rounded-3xl p-8 md:p-12 border border-teal-100">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                💡 هل أنت طالب؟
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                نوفر لك وظائف مناسبة لجدولك الدراسي! وظائف بدوام جزئي وعمل حر 
                يمكنك القيام بها من أي مكان وفي أي وقت. ابدأ ببناء مسيرتك المهنية 
                أثناء دراستك.
              </p>
              <ul className="space-y-2">
                {['مرونة في المواعيد', 'لا يشترط خبرة سابقة', 'فرص تدريب مدفوعة', 'شهادات معتمدة'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100">
              <div className="text-center">
                <div className="text-5xl mb-4">🎓</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">قسم الطلاب</h4>
                <p className="text-sm text-gray-500 mb-4">وظائف مصممة خصيصاً للطلاب</p>
                <button className="bg-gradient-to-l from-teal-500 to-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:shadow-lg transition-all w-full">
                  اكتشف وظائف الطلاب
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
