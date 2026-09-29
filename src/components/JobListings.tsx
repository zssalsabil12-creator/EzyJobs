import { Job } from '../data/jobs';

interface JobListingsProps {
  jobs: Job[];
  selectedType: string;
  setSelectedType: (type: string) => void;
}

export default function JobListings({ jobs, selectedType, setSelectedType }: JobListingsProps) {
  const types = ['الكل', 'دوام كامل', 'دوام جزئي', 'عمل حر'];

  return (
    <section id="jobs" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              أحدث الوظائف عن بُعد
            </h2>
            <p className="text-gray-500">
              {jobs.length} وظيفة متاحة الآن
            </p>
          </div>
          
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedType === type
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Job Cards */}
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500">جرب تغيير معايير البحث أو التصنيف</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-lg hover:border-teal-100 transition-all group">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Company Logo Placeholder */}
        <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-teal-100">
          <span className="text-2xl">
            {job.category === 'برمجة وتطوير' ? '💻' : 
             job.category === 'تصميم' ? '🎨' :
             job.category === 'كتابة وترجمة' ? '✍️' :
             job.category === 'تسويق رقمي' ? '📱' :
             job.category === 'بيانات وتحليل' ? '📊' :
             job.category === 'تعليم وتدريب' ? '📚' : '💰'}
          </span>
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors">
                  {job.title}
                </h3>
                {job.isNew && (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    جديد
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
            </div>
            <span className="text-sm font-bold text-teal-600 whitespace-nowrap hidden sm:block">
              {job.salary}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>
          
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              📍 {job.location}
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
              🕐 {job.type}
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full">
              📋 {job.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full">
              🌐 {job.source}
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center gap-3 md:flex-col md:items-end">
          <span className="text-xs text-gray-400">{job.posted}</span>
          <button className="bg-gradient-to-l from-teal-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-teal-200 transition-all whitespace-nowrap">
            تقدّم الآن ←
          </button>
        </div>
      </div>
    </div>
  );
}
