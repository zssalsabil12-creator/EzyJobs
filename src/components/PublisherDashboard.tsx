import { useState } from 'react';

export default function PublisherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'إجمالي الزيارات', value: '12,847', change: '+23%', icon: '👁️' },
    { label: 'النقرات على الإعلانات', value: '3,421', change: '+15%', icon: '👆' },
    { label: 'إيرادات AdSense', value: '$284', change: '+31%', icon: '💰' },
    { label: 'عمولات التسويق', value: '$156', change: '+42%', icon: '🔗' },
  ];

  const recentJobs = [
    { title: 'مطور React', company: 'Tech Corp', status: 'نشط', views: 234 },
    { title: 'مصمم UI/UX', company: 'Design Studio', status: 'نشط', views: 189 },
    { title: 'كاتب محتوى', company: 'Content Hub', status: 'معلّق', views: 156 },
  ];

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'analytics', label: 'التحليلات' },
    { id: 'revenue', label: 'الإيرادات' },
    { id: 'settings', label: 'الإعدادات' },
  ];

  return (
    <section id="publisher" className="py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span className="inline-block text-[#FF4D00] text-sm font-bold tracking-wider mb-3">— لوحة الناشر</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0A0A0A] leading-tight">
              تحكم كامل في<br />
              <span className="text-[#FF4D00]">موقعك</span>
            </h2>
          </div>
          <p className="text-gray-500 max-w-md mt-4 md:mt-0">
            لوحة تحكم متكاملة لإدارة المحتوى والإعلانات وتتبع الأداء
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-[#FAF7F2] rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/50">
          {/* Dashboard Header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-1.5 text-sm text-gray-500 font-mono">
                  wazifah.com/dashboard
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FF4D00] rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">W</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex">
            {/* Sidebar */}
            <div className="hidden md:block w-64 bg-white border-l border-gray-100 p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#FF4D00] text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-3 px-4">روابط سريعة</h4>
                <nav className="space-y-1">
                  {['إضافة وظيفة', 'إدارة الإعلانات', 'التقارير', 'المستخدمين'].map((item) => (
                    <button key={item} className="w-full text-right px-4 py-2 text-sm text-gray-500 hover:text-[#FF4D00] transition-colors">
                      {item}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-[#FF4D00]/20 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{stat.icon}</span>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-[#0A0A0A] font-display group-hover:text-[#FF4D00] transition-colors">{stat.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                    {/* Mini chart */}
                    <div className="mt-3 flex items-end gap-0.5 h-8">
                      {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                        <div 
                          key={i}
                          className="flex-1 bg-[#FF4D00]/10 group-hover:bg-[#FF4D00]/20 rounded-sm transition-colors"
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[#0A0A0A]">إحصائيات الزيارات</h3>
                  <div className="flex gap-2">
                    <button className="text-xs bg-[#FF4D00] text-white px-3 py-1.5 rounded-full font-medium">أسبوع</button>
                    <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">شهر</button>
                    <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">سنة</button>
                  </div>
                </div>
                {/* Fake Chart */}
                <div className="h-48 flex items-end justify-between gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-[#FF4D00] to-[#FF6B2C] rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-[10px] text-gray-400">{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Jobs Table */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-[#0A0A0A]">الوظائف الأخيرة</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-right px-6 py-3 text-xs font-bold text-gray-400 tracking-wider">الوظيفة</th>
                        <th className="text-right px-6 py-3 text-xs font-bold text-gray-400 tracking-wider">الشركة</th>
                        <th className="text-right px-6 py-3 text-xs font-bold text-gray-400 tracking-wider">الحالة</th>
                        <th className="text-right px-6 py-3 text-xs font-bold text-gray-400 tracking-wider">المشاهدات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentJobs.map((job, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-medium text-[#0A0A0A]">{job.title}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500">{job.company}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              job.status === 'نشط' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-yellow-50 text-yellow-600'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-[#0A0A0A]">{job.views}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="btn-primary bg-[#0A0A0A] text-white px-8 py-4 rounded-full font-bold hover:bg-[#1a1a1a] transition-colors inline-flex items-center gap-2">
            ابدأ بإدارة موقعك الآن
            <span className="text-[#FF4D00]">←</span>
          </button>
        </div>
      </div>
    </section>
  );
}
