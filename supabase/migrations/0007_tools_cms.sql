-- ezyjobs — Tools & Partner CMS v1
insert into public.site_settings(key,value,is_public)
values
  ('tools_eyebrow', to_jsonb('أدوات'::text), true),
  ('tools_title', to_jsonb('السيرة الذاتية والتقديم هي نصف المعركة'::text), true),
  ('tools_lead', to_jsonb('عثرت على الوظيفة المناسبة وفهمتها؟ الخطوة التالية هي الملف الذي يوصلك إليها. هذه الأدوات مجانية وتعمل داخل متصفحك.'::text), true),
  ('tools_back_label', to_jsonb('ارجع للوظائف'::text), true),
  ('tools_cv_label', to_jsonb('منشئ السيرة الذاتية'::text), true),
  ('tools_ats_label', to_jsonb('فاحص التوافق'::text), true),
  ('tools_interview_label', to_jsonb('تحضير المقابلة'::text), true),
  ('tools_partners_eyebrow', to_jsonb('شركاء'::text), true),
  ('tools_partners_title', to_jsonb('خدمات نرشّحها لك'::text), true),
  ('tools_partners_lead', to_jsonb('أدوات مفيدة، مذكورة بصراحة كأدوات. بعضها مجاني وبعضها مدفوع، وبعضها نربح منه عمولة إذا استخدمته.'::text), true),
  ('tools_disclosure', to_jsonb('بعض الروابط أدناه روابط تابع: إذا اشتريت أو استخدمت الخدمة من خلالها، قد نحصل على عمولة دون أن يختلف السعر عن السعر المباشر. لا ندفع مقابل ترتيب غير دقيق، ونعرض هنا ما نستخدمه بأنفسنا فقط.'::text), true),
  ('tools_partner_cards', to_jsonb(E'منشئ السيرة الذاتية || CV Builder || قالب جاهز بعمود واحد يمر على الأنظمة الآلية، مع حقول عربية. || # || affiliate || مجاني — مدفوع للميزات\nفاحص توافق الملف || ATS Checker || يقيس نسبة الكلمات المفتاحية المطابقة بين ملفك وإعلان الوظيفة. || # || affiliate || فحص مجاني محدود\nمراجعة السيرة الذاتية || Resume Review || مراجعة بشرية من مختص يراجع ملفك ويعيد كتابته. || # || affiliate || مدفوع\nأداة تحضير المقابلات || Interview Prep || بنك أسئلة متكرر مع تدريب صوتي، وتمارين على المقابلات الحقيقية. || # || affiliate || مجاني جزئياً\nاختبار المسار المهني || Career Test || يحدد مجالات تناسب قدراتك بدل أن تخمّنها. || # || affiliate || مدفوع\nدورات المهارات || Courses || دورات قصيرة تغطي المهارات التي طلبتها الوظائف الأكثر طلباً. || # || affiliate || مجاني ومدفوع'::text), true)
on conflict (key) do nothing;
