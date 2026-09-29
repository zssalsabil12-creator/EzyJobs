export default function BentoGrid() {
  return (
    <section id="categories" className="py-24 bg-[#FAF7F2]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span className="inline-block text-[#FF4D00] text-sm font-bold tracking-wider mb-3">— التصنيفات</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0A0A0A] leading-tight">
              تصفّح حسب<br />
              <span className="text-[#FF4D00]">مجالك</span>
            </h2>
          </div>
          <p className="text-gray-500 max-w-md mt-4 md:mt-0">
            اختر المجال الذي يناسب مهاراتك واهتماماتك، واعثر على فرص عمل مناسبة لك
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[140px]">
          {/* Large Card - Programming */}
          <div className="bento-item col-span-2 row-span-2 bg-[#0A0A0A] rounded-3xl p-8 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D00]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D00]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">💻</span>
                <h3 className="text-2xl font-bold text-white mb-2">برمجة وتطوير</h3>
                <p className="text-white/50 text-sm">React, Flutter, Node.js, Python</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="bg-[#FF4D00] text-white text-xs font-bold px-3 py-1.5 rounded-full group-hover:scale-105 transition-transform">127 وظيفة</span>
                <span className="text-white/30 text-2xl group-hover:text-[#FF4D00] group-hover:-translate-x-2 transition-all">←</span>
              </div>
            </div>
          </div>

          {/* Design */}
          <div className="bento-item col-span-2 bg-white rounded-3xl p-6 border border-gray-100 relative overflow-hidden group cursor-pointer hover:border-[#FF4D00]/30">
            <div className="flex items-start justify-between">
              <span className="text-4xl">🎨</span>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">84</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-[#0A0A0A]">تصميم</h3>
              <p className="text-gray-400 text-xs mt-1">UI/UX, جرافيك, موشن</p>
            </div>
          </div>

          {/* Writing */}
          <div className="bento-item col-span-2 bg-[#FF4D00] rounded-3xl p-6 relative overflow-hidden group cursor-pointer">
            <div className="flex items-start justify-between">
              <span className="text-4xl">✍️</span>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">56</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-white">كتابة وترجمة</h3>
              <p className="text-white/70 text-xs mt-1">محتوى، ترجمة، SEO</p>
            </div>
          </div>

          {/* Marketing */}
          <div className="bento-item col-span-2 bg-white rounded-3xl p-6 border border-gray-100 group cursor-pointer hover:border-[#FF4D00]/30">
            <div className="flex items-start justify-between">
              <span className="text-4xl">📱</span>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">72</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-[#0A0A0A]">تسويق رقمي</h3>
              <p className="text-gray-400 text-xs mt-1">سوشيال، إعلانات، SEO</p>
            </div>
          </div>

          {/* Data */}
          <div className="bento-item col-span-2 bg-gray-50 rounded-3xl p-6 border border-gray-100 group cursor-pointer hover:border-[#FF4D00]/30">
            <div className="flex items-start justify-between">
              <span className="text-4xl">📊</span>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">43</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-[#0A0A0A]">بيانات وتحليل</h3>
              <p className="text-gray-400 text-xs mt-1">Python, SQL, BI</p>
            </div>
          </div>

          {/* Education */}
          <div className="bento-item col-span-2 bg-[#0A0A0A] rounded-3xl p-6 relative overflow-hidden group cursor-pointer">
            <div className="flex items-start justify-between">
              <span className="text-4xl">📚</span>
              <span className="bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full">38</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-white">تعليم وتدريب</h3>
              <p className="text-white/50 text-xs mt-1">تدريس أونلاين، كورسات</p>
            </div>
          </div>

          {/* Finance */}
          <div className="bento-item col-span-2 bg-white rounded-3xl p-6 border border-gray-100 group cursor-pointer hover:border-[#FF4D00]/30">
            <div className="flex items-start justify-between">
              <span className="text-4xl">💰</span>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">29</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-[#0A0A0A]">محاسبة ومالية</h3>
              <p className="text-gray-400 text-xs mt-1">محاسبة، مراجعة، ضرائب</p>
            </div>
          </div>

          {/* Support */}
          <div className="bento-item col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-100 group cursor-pointer hover:border-purple-300">
            <div className="flex items-start justify-between">
              <span className="text-4xl">🎧</span>
              <span className="bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1.5 rounded-full">51</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-[#0A0A0A]">دعم عملاء</h3>
              <p className="text-gray-400 text-xs mt-1">دعم فني، خدمة عملاء</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
