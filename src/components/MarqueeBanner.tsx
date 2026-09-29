export default function MarqueeBanner() {
  const items = [
    'وظائف عن بُعد',
    '🌍',
    'عمل حر',
    '⚡',
    'دوام جزئي',
    '🎯',
    'وظائف للطلاب',
    '💰',
    'رواتب بالدولار',
    '🚀',
    'شركات عالمية',
    '✨',
    'بدون خبرة',
    '🎓',
    'مرونة كاملة',
    '🔥',
  ];

  return (
    <div className="bg-[#0A0A0A] border-y border-white/5 py-5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map((item, index) => (
          <span 
            key={index}
            className="mx-6 text-white/40 text-lg font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
