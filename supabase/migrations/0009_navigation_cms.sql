-- ezyjobs — Shared Navigation CMS v1
insert into public.site_settings(key,value,is_public)
values
  ('nav_primary', to_jsonb(E'/jobs || البحث عن وظائف\n/students || وظائف للطلاب\n/remote || العمل عن بُعد\n/tools || أدوات التوظيف\n/applications || تقديماتي\n/profile || الملف المهني'::text), true),
  ('nav_mobile_secondary', to_jsonb(E'/no-experience || وظائف بلا خبرة\n/guides || الأدلة والنصائح\n/alerts || تنبيهات الوظائف\n/about || عن المنصة'::text), true),
  ('nav_search_label', to_jsonb('بحث'::text), true),
  ('nav_search_title', to_jsonb('بحث'::text), true),
  ('nav_alerts_label', to_jsonb('تنبيهات الوظائف'::text), true),
  ('nav_publish_label', to_jsonb('اكتب واربح'::text), true),
  ('nav_admin_label', to_jsonb('لوحة الإدارة'::text), true),
  ('nav_dashboard_label', to_jsonb('لوحة التحكم'::text), true),
  ('nav_profile_label', to_jsonb('الملف المهني'::text), true),
  ('nav_logout_label', to_jsonb('تسجيل الخروج'::text), true),
  ('nav_login_label', to_jsonb('تسجيل الدخول'::text), true),
  ('nav_register_label', to_jsonb('إنشاء حساب'::text), true),
  ('footer_platform_title', to_jsonb('المنصة'::text), true),
  ('footer_platform_nav', to_jsonb(E'/jobs || البحث عن وظائف\n/students || وظائف للطلاب\n/remote || العمل عن بُعد\n/no-experience || وظائف بلا خبرة\n/alerts || تنبيهات الوظائف\n/terms || الشروط والأحكام\n/privacy || سياسة الخصوصية\n/usage-policy || سياسة الاستخدام'::text), true),
  ('footer_content_title', to_jsonb('المحتوى'::text), true),
  ('footer_content_nav', to_jsonb(E'/tools || أدوات التوظيف\n/guides || الأدلة والمقالات\n/saved || الوظائف المحفوظة\n/about || من نحن'::text), true),
  ('footer_country_title', to_jsonb('دول'::text), true),
  ('footer_browse_title', to_jsonb('تصفّح حسب المجال'::text), true),
  ('footer_login_label', to_jsonb('تسجيل الدخول'::text), true),
  ('footer_terms_label', to_jsonb('الشروط والأحكام'::text), true),
  ('footer_privacy_label', to_jsonb('سياسة الخصوصية'::text), true),
  ('footer_usage_label', to_jsonb('سياسة الاستخدام'::text), true)
on conflict (key) do nothing;