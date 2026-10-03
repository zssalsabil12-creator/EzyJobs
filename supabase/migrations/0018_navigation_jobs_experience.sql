-- ezyjobs — Navigation and Jobs Explorer refinement v2
update public.site_settings
set value = to_jsonb(E'/jobs || أحدث الوظائف أونلاين\n/student-writer || انضم إلى EzyPublish\n/profile || ملفي المهني'::text)
where key = 'nav_primary';

update public.site_settings
set value = to_jsonb(E'/no-experience || وظائف بلا خبرة\n/guides || الأدلة والنصائح\n/about || عن المنصة'::text)
where key = 'nav_mobile_secondary';

update public.site_settings
set value = to_jsonb('انضم إلى EzyPublish'::text)
where key = 'nav_publish_label';

update public.site_settings
set value = to_jsonb(E'/jobs || أحدث الوظائف أونلاين\n/students || وظائف للطلاب\n/remote || العمل عن بُعد\n/no-experience || وظائف بلا خبرة\n/saved || الوظائف المحفوظة\n/terms || الشروط والأحكام\n/privacy || سياسة الخصوصية\n/usage-policy || سياسة الاستخدام'::text)
where key = 'footer_platform_nav';

update public.site_settings
set value = to_jsonb(E'/guides || الأدلة والمقالات\n/about || من نحن'::text)
where key = 'footer_content_nav';