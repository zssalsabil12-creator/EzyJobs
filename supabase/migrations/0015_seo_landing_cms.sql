-- ezyjobs — SEO country/field landing CMS v1
insert into public.site_settings(key,value,is_public)
values
('seo_landing_copy_ar', to_jsonb($seo$countryTitle || وظائف عن بعد {demonym}
countryLead || كل وظيفة في هذه الصفحة تسمح للمتقدمين من {country} بالتقديم. نعرض الأهلية المؤكدة أولاً، ونشرح لك ما ينقصك قبل أن تتقدم.
countrySearchButton || ابحث بكل المعايير
countryAlertsButton || فعّل تنبيهاً لهذه الفئة
countryJobsLoading || جارٍ التحميل
countryJobsHeading || {count} فرصة في هذه الصفحة
countryEmptyTitle || لا توجد فرص في هذه الفئة بعد
countryEmptyBody || الفهرس ما زال ينمو. فعّل التنبيهات ليصلك الجديد أولاً، أو تصفّح فئة مجاورة.
countryEmptyButton || فعّل تنبيهاً
countryAlertBadge || تنبيه
countryAlertBody || الأهلية في هذه الصفحة محسوبة آلياً من نص الإعلان وليست تأكيداً من الشركة. افتح أي وظيفة لتقرأ ما ورد فيها بالضبط، وتحقّق من صفحة التقديم الأصلية قبل الإرسال.
countryFaqHeading || أسئلة متكررة
countryFaqLead || إجابات مباشرة بدون حشو.
countryRelatedTitle || وظائف عن بعد في بقية الدول
countryRelatedDescription || نفس الطريقة، نفس التوضيح حول الأهلية، لدولة أخرى.
countryFieldsTitle || تصفح حسب المجال
fieldTitle || وظائف {category} عن بُعد
fieldLead || صفحة واحدة تجمع كل وظائف {category} عن بُعد، مع ترجمة الإعلان ومستوى الخبرة والمهارات — قبل أن تضغط على التقديم.
fieldSearchButton || ابحث بكل المعايير
fieldAlertsButton || فعّل تنبيهاً لهذا المجال
fieldJobsLoading || جارٍ التحميل
fieldJobsHeading || {count} فرصة في هذه الصفحة
fieldEmptyTitle || لا توجد فرص في هذه الفئة بعد
fieldEmptyBody || الفهرس ما زال ينمو. فعّل التنبيهات ليصلك الجديد أولاً، أو تصفّح فئة مجاورة.
fieldEmptyButton || فعّل تنبيهاً
fieldFaqHeading || أسئلة متكررة
fieldFaqLead || إجابات مباشرة بدون حشو.
fieldRelatedTitle || مجالات أخرى
fieldCountriesTitle || أو تصفّح حسب الدولة
countryMetaTitle || وظائف عن بعد {demonym} — {country} | ezyjobs
countryMetaDescription || وظائف عن بعد تقبل المتقدمين من {country}: خدمة عملاء، إدخال بيانات، كتابة، وتدريب. مع تحديد الأهلية ومستوى الخبرة بالعربية قبل التقديم.
fieldMetaTitle || وظائف {category} عن بُعد — شرح بالعربية | ezyjobs
fieldMetaDescription || وظائف {category} عن بُعد مترجمة ومحلّلة بالعربية، مع تحديد الأهلية ومستوى الخبرة والمهارات المطلوبة قبل التقديم.
notFoundTitle || هذه الصفحة غير موجودة
notFoundBody || ربما تغيّر الرابط. ابدأ من محرك البحث أو من الصفحة الرئيسية.
notFoundButton || محرك البحث$seo$::text), true)
on conflict (key) do nothing;