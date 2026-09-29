import { Job } from '../data/jobs';

interface JobsSectionProps {
  jobs: Job[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}

export default function JobsSection({ jobs, selectedCategory, setSelectedCategory, selectedType, setSelectedType }: JobsSectionProps) {
  const categories = ['الكل', 'برمجة وتطوير', 'تصميم', 'كتابة وترجمة', 'تسويق رقمي', 'بيانات وتحليل', 'تعليم وتدريب', 'محاسبة ومالية'];
  const types = ['الكل', 'دوام كامل', 'دوام جزئي', 'عمل حر'];

  return (
    <section id="jobs" className="py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span className="inline-block text-[#FF4D00] text-sm font-bold tracking-wider mb-3">— أحدث الفرص</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0A0A0A] leading-tight">
              وظائف <span className="text-[#FF4D00]">مختارة</span><br />
              بعناية لك
            </h2>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <span className="text-sm text-gray-400">{jobs.length} نتيجة</span>
            <div className="w-px h-4 bg-gray-200"></div>
            <span className="text-sm text-gray-400">محدّث اليوم</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-400 tracking-wider mb-3 block">التصنيف</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0A0A0A] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-xs font-bold text-gray-400 tracking-wider mb-3 block">نوع العمل</label>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'bg-[#FF4D00] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500">جرب تغيير معايير البحث أو التصنيف</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="btn-primary bg-[#0A0A0A] text-white px-8 py-4 rounded-full font-bold hover:bg-[#1a1a1a] transition-colors inline-flex items-center gap-2">
            عرض المزيد من الوظائف
            <span className="text-[#FF4D00]">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function JobCard({ job, index }: { job: Job; index: number }) {
  return (
    <div className="group bg-[#FAF7F2] hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        {/* Left: Icon & Info */}
        <div className="flex items-start gap-4 flex-1">
          {/* Job Icon */}
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-100 group-hover:border-[#FF4D00]/20 group-hover:shadow-lg transition-all">
            <span className="text-2xl">
              {job.category === 'برمجة وتطوير' ? '💻' : 
               job.category === 'تصميم' ? '🎨' :
               job.category === 'كتابة وترجمة' ? '✍️' :
               job.category === 'تسويق رقمي' ? '📱' :
               job.category === 'بيانات وتحليل' ? '📊' :
               job.category === 'تعليم وتدريب' ? '📚' : '💰'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-[#0A0A0A] group-hover:text-[#FF4D00] transition-colors">
                    {job.title}
                  </h3>
                  {job.isNew && (
                    <span className="bg-[#FF4D00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      جديد
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-lg font-bold text-[#0A0A0A] font-display">{job.salary}</div>
                <div className="text-xs text-gray-400">/ شهرياً</div>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{job.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="tag bg-white text-gray-600 border border-gray-100">
                📍 {job.location}
              </span>
              <span className="tag bg-blue-50 text-blue-600 border border-blue-100">
                🕐 {job.type}
              </span>
              <span className="tag bg-purple-50 text-purple-600 border border-purple-100">
                📋 {job.category}
              </span>
              <span className="tag bg-orange-50 text-orange-600 border border-orange-100">
                🌐 {job.source}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Action */}
        <div className="flex items-center justify-between lg:justify-end gap-4 lg:flex-col lg:items-end">
          <span className="text-xs text-gray-400">{job.posted}</span>
          <button className="btn-primary bg-[#FF4D00] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#FF6B2C] transition-all group-hover:shadow-lg group-hover:shadow-[#FF4D00]/20">
            تقدّم الآن ←
          </button>
        </div>
      </div>
    </div>
  );
}
