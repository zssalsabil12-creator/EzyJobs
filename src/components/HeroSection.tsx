interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ searchQuery, setSearchQuery }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A] noise">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#FF4D00]/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#FFD700]/15 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[60px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-dark rounded-full px-5 py-2 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4D00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4D00]"></span>
            </span>
            <span className="text-white/80 text-sm font-medium">+247 وظيفة جديدة هذا الأسبوع</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-black text-white leading-[0.9] mb-6 animate-fade-in-up stagger-1">
            <span className="block">اعثر على</span>
            <span className="block mt-2 relative">
              <span className="gradient-text">وظيفة أحلامك</span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#FF4D00]/30" viewBox="0 0 200 8" fill="none">
                <path d="M0 4C50 2 150 6 200 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="block mt-4 text-white/40 text-3xl md:text-4xl lg:text-5xl font-light">وأنت في بيتك</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up stagger-2">
            نجمع لك أفضل الوظائف عن بُعد من مصادر عالمية موثوقة، 
            مترجمة بالكامل للعربية لتسهيل الوصول إليها
          </p>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto animate-fade-in-up stagger-3">
            <div className="glass-dark rounded-3xl p-2 shadow-2xl shadow-black/50">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="ابحث عن وظيفة... (مثال: React, تصميم, كتابة)"
                    className="w-full pr-14 pl-5 py-4 bg-transparent text-white placeholder-white/40 focus:outline-none text-right text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="btn-primary bg-[#FF4D00] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#FF6B2C] transition-colors whitespace-nowrap">
                  🔍 ابحث الآن
                </button>
              </div>
            </div>

            {/* Quick Tags */}
            <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
              <span className="text-white/40 text-sm">الأكثر بحثاً:</span>
              {['React', 'تصميم UI/UX', 'كتابة محتوى', 'تسويق رقمي', 'تحليل بيانات', 'Flutter'].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="tag bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto animate-fade-in-up stagger-4">
            {[
              { number: '500+', label: 'وظيفة متاحة', icon: '💼' },
              { number: '150+', label: 'شركة عالمية', icon: '🏢' },
              { number: '10K+', label: 'باحث عن عمل', icon: '👥' },
              { number: '25+', label: 'دولة', icon: '🌍' },
            ].map((stat, index) => (
              <div key={index} className="glass-dark rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-white font-display">{stat.number}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>
  );
}
