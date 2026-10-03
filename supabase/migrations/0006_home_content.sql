-- ezyjobs — Homepage Content Control v1
insert into public.site_settings(key,value,is_public)
values
  ('footer_tagline', to_jsonb('REMOTE WORK FOR ARAB SPEAKERS'::text), true),
  ('home_ticker', to_jsonb(E'وظائف عن بُعد\nمترجمة ومحلّلة بالعربية\nتصفية جغرافية للدول العربية\nفرص للطلاب\nبدون خبرة\nعمل جزئي وحر'::text), true),
  ('home_categories_eyebrow', to_jsonb('التصنيفات'::text), true),
  ('home_categories_title', to_jsonb('اختر عالمك المهني'::text), true),
  ('home_categories_lead', to_jsonb('سبعة مسارات مرتّبة كبطاقات حيّة: كل واحدة تفتح على وظائفها المترجمة والمحلّلة.'::text), true),
  ('home_eligibility_eyebrow', to_jsonb('أهلية مؤكدة'::text), true),
  ('home_eligibility_title', to_jsonb('وظائف نعرف مسبقاً أنها تفتح لك الباب'::text), true),
  ('home_eligibility_lead', to_jsonb('نقرأ كل إعلان ونحدد: هل تقبل دولتك؟ هل تحتاج خبرة؟ هل تكفي ساعاتك؟ ثم نعرض لك النتيجة قبل أن تفتح الرابط.'::text), true),
  ('home_students_eyebrow', to_jsonb('فرص الطلاب'::text), true),
  ('home_students_title', to_jsonb('وظائف أثناء الدراسة'::text), true),
  ('home_students_lead', to_jsonb('دوام جزئي، تدريب مدفوع، وعمل حر لا يتعارض مع جدول المحاضرات.'::text), true),
  ('home_value_eyebrow', to_jsonb('ما الذي نفعله'::text), true),
  ('home_value_title', to_jsonb('الفرق بين قائمة وظائف وقرار مهني'::text), true),
  ('home_value_lead', to_jsonb('المشكلة ليست ندرة الوظائف، بل تشتتها ولغتها وغياب الوضوح حول أهليتك. نعالج هذه الطبقات الثلاث قبل أن يظهر الإعلان.'::text), true),
  ('home_steps_eyebrow', to_jsonb('كيف يعمل'::text), true),
  ('home_steps_title', to_jsonb('من البحث إلى التقديم في أربع خطوات'::text), true),
  ('home_transparency_eyebrow', to_jsonb('عنصر الثقة'::text), true),
  ('home_transparency_title', to_jsonb('نفصل بين أربعة أشياء، ونقول لك أيها منها'::text), true),
  ('home_transparency_lead', to_jsonb('الخلط بين معلومة من الإعلان وتحليل المنصة ورابط التقديم ورابط تابع لعمولة هو أكبر سبب للارتباك. لذلك نضع كل نوع في مكانه.'::text), true),
  ('home_final_title', to_jsonb('ابدأ بثلاث إجابات فقط'::text), true),
  ('home_final_lead', to_jsonb('دولتك، مستواك، ونوع الدوام. الباقي اتركه لنا.'::text), true)
on conflict (key) do nothing;

insert into public.site_settings(key,value,is_public)
values
  ('home_hero_eyebrow', to_jsonb('طبقة ذكاء وظيفي عربية فوق مصادر التوظيف العالمية'::text), true),
  ('home_search_placeholder', to_jsonb('ماذا تبحث عنه؟ مثال: خدمة عملاء، إدخال بيانات، كتابة'::text), true),
  ('home_search_button', to_jsonb('ابحث في الوظائف'::text), true),
  ('home_search_chips', to_jsonb(E'خدمة عملاء\nإدخال بيانات\nكتابة محتوى\nتدريب\nبدون خبرة'::text), true),
  ('home_hero_stat_geo', to_jsonb('فرصة لها نطاق جغرافي معروف'::text), true),
  ('home_hero_stat_students', to_jsonb('فرصة للطلاب'::text), true),
  ('home_hero_stat_language', to_jsonb('تحليل بالعربية'::text), true),
  ('home_pillars', to_jsonb(E'ترجمة وتبسيط || كل إعلان يُعاد صياغته بالعربية بصيغة واضحة: ماذا تفعل، ولماذا، وما المطلوب منك بالضبط.\nتحليل الأهلية || نحدد بدل كلمة «Remote» الغامضة: هل قبول دولتك مؤكد، محدود، غير واضح، أو مستحيل؟\nمستوى الوظيفة || نصنف كل فرصة: طالب، مبتدئ، junior، أو خبرة متقدمة — حتى لا تفقد وقتك في إعلان لا يناسبك.\nما تحتاجه للتقديم || المهارات المطلوبة، المؤهلات، ساعات العمل، واللغات — قبل أن تضغط على زر التقديم.'::text), true),
  ('home_steps_cards', to_jsonb(E'تحديد ملفك || دولتك، مستواك، لغاتك، وقتك المتاح أسبوعياً.\nالتصفية || نستبعد ما لا يناسبك بدل عرض مئات النتائج.\nالتفسير || لكل وظيفة: لماذا تناسبك، وما الذي قد يمنعك.\nالتقديم || من المصدر الأصلي، مع رابط واضح ومعلن.'::text), true),
  ('home_transparency_cards', to_jsonb(E'معلومة من الإعلان || ما ورد في نص الإعلان الأصلي، دون تغيير في المعنى.\nتحليل ezyjobs || تقديرنا للمتطلبات والملاءمة، وهو استنتاج لا حقيقة مطلقة.\nالمصدر الرسمي || الجهة التي ستوظفك فعلاً، ومنها يتم تقديم الطلب.\nرابط تابع || إن وُجد، نعلن ذلك صراحة قبل الضغط عليه.'::text), true),
  ('home_all_jobs_label', to_jsonb('كل الوظائف'::text), true),
  ('home_students_button', to_jsonb('قسم الطلاب'::text), true),
  ('home_empty_text', to_jsonb('لا توجد فرص مطابقة الآن. جرّب توسيع الفلاتر من محرك البحث.'::text), true),
  ('home_final_primary', to_jsonb('افتح محرك البحث'::text), true),
  ('home_final_secondary', to_jsonb('لا أملك خبرة بعد'::text), true)
on conflict (key) do nothing;
