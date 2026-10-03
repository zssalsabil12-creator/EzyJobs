-- ezyjobs — Site Control v1
-- Admin-editable homepage, branding, SEO, social and ad configuration.
insert into public.site_settings(key,value,is_public)
values
  ('announcement', to_jsonb(''::text), true),
  ('home_headline', to_jsonb(''::text), true),
  ('home_lead', to_jsonb(''::text), true),
  ('header_tagline', to_jsonb('ARABIC REMOTE JOBS'::text), true),
  ('footer_note', to_jsonb(''::text), true),
  ('seo_site_title', to_jsonb('ezyjobs — منصة عربية لاكتشاف الوظائف والعمل عن بُعد'::text), true),
  ('seo_site_description', to_jsonb('ezyjobs منصة عربية ذكية تجمع الوظائف العالمية والمحلية عن بُعد، تترجمها وتبسّطها وتشرح لك مدى ملاءمتها، وتوصلك إلى مصدر التقديم الأصلي.'::text), true),
  ('social_telegram_url', to_jsonb(''::text), true),
  ('social_linkedin_url', to_jsonb(''::text), true),
  ('social_facebook_url', to_jsonb(''::text), true),
  ('social_youtube_url', to_jsonb(''::text), true),
  ('ads_enabled', to_jsonb(false), true),
  ('adsense_client', to_jsonb(''::text), true),
  ('adsense_top_slot', to_jsonb(''::text), true),
  ('adsense_inline_slot', to_jsonb(''::text), true),
  ('adsense_footer_slot', to_jsonb(''::text), true)
on conflict (key) do nothing;
