export default function Stats() {
  const stats = [
    { number: "500+", label: "وظيفة متاحة", icon: "💼" },
    { number: "150+", label: "شركة عالمية", icon: "🏢" },
    { number: "10K+", label: "باحث عن عمل", icon: "👥" },
    { number: "25+", label: "دولة", icon: "🌍" },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-100 transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-gray-800">{stat.number}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
