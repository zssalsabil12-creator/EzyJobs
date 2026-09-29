import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-24 bg-[#FAF7F2]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="bg-[#0A0A0A] rounded-[2rem] p-8 md:p-16 relative overflow-hidden noise">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4D00]/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-[#FF4D00] rounded-2xl flex items-center justify-center mx-auto mb-8 animate-float">
              <span className="text-4xl">📬</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              لا تفوّت أي فرصة
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
              اشترك في النشرة البريدية واحصل على أحدث الوظائف مباشرة في بريدك كل أسبوع
            </p>

            {subscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 animate-fade-in">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-white mb-2">تم الاشتراك بنجاح!</h3>
                <p className="text-white/60">ستصلك أحدث الوظائف في بريدك قريباً</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00]/50 text-right text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  className="btn-primary bg-[#FF4D00] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#FF6B2C] transition-colors whitespace-nowrap"
                >
                  اشترك الآن
                </button>
              </form>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center items-center gap-6 mt-10">
              {[
                { icon: '🔒', text: 'خصوصية تامة' },
                { icon: '📧', text: 'بدون سبام' },
                { icon: '⚡', text: 'إلغاء في أي وقت' },
              ].map((badge, index) => (
                <div key={index} className="flex items-center gap-2 text-white/40 text-sm">
                  <span>{badge.icon}</span>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
