export default function SourcesSection() {
  const sources = [
    { name: 'LinkedIn', logo: '💼', jobs: 127, color: 'bg-blue-50 border-blue-100' },
    { name: 'Upwork', logo: '🟢', jobs: 89, color: 'bg-emerald-50 border-emerald-100' },
    { name: 'Indeed', logo: '🔵', jobs: 76, color: 'bg-blue-50 border-blue-100' },
    { name: 'Remote.co', logo: '🌐', jobs: 54, color: 'bg-purple-50 border-purple-100' },
    { name: 'We Work Remotely', logo: '🏠', jobs: 43, color: 'bg-orange-50 border-orange-100' },
    { name: 'FlexJobs', logo: '⚡', jobs: 38, color: 'bg-yellow-50 border-yellow-100' },
  ];

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-2">مصادر موثوقة</h3>
          <p className="text-2xl font-bold text-[#0A0A0A]">نجمع الوظائف من أفضل المنصات العالمية</p>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sources.map((source, index) => (
            <div 
              key={index}
              className={`${source.color} border rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{source.logo}</div>
              <h4 className="font-bold text-[#0A0A0A] text-sm mb-1">{source.name}</h4>
              <p className="text-xs text-gray-500">{source.jobs} وظيفة</p>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-5 py-2.5">
            <span className="text-emerald-500">✓</span>
            <span className="text-sm text-gray-600 font-medium">جميع الوظائف موثقة ومحدّثة يومياً</span>
          </div>
        </div>
      </div>
    </section>
  );
}
