-- ezyjobs — Job Detail CMS v1
insert into public.site_settings(key,value,is_public)
values
  ('job_detail_copy_ar', to_jsonb(E'breadcrumbHome || الرئيسية
breadcrumbJobs || الوظائف
studentBadge || مناسبة للطلاب
noExperienceBadge || بدون خبرة
weeklyHoursSuffix || ساعة أسبوعياً
applyOriginal || التقديم من المصدر الأصلي
partnerLink || رابط تابع
directLink || رابط مباشر
applyVia || التقديم يتم عند
platformAnalysisTitle || لماذا هذه الصفحة موجودة
platformAnalysisLead || تحليل ezyjobs لملفك، وليس معلومة من الإعلان. قد يخطئ التقدير — راجع النص الأصلي قبل قرارك.
prosTitle || قد تناسبك لأن
noPros || لا توجد نقاط إيجابية واضحة.
consTitle || ما الذي قد يمنعك
noCons || لا توجد عوائق ظاهرة.
notesTitle || تنبيهات
summaryTitle || الملخص
aboutTitle || عن الوظيفة
skillsTitle || المهارات المطلوبة
requirementsTitle || شروط أساسية
niceToHaveTitle || مستحسن
sourceTitle || عن المصدر
sourceAllowed || نعرض هذه الوظيفة لأن مصدرها يسمح بإعادة التوزيع.
sourceRights || جميع الحقوق محفوظة للجهة الناشرة، والتقديم يتم عبر موقعها الرسمي.
sourceReview || نراجع ترخيص هذا المصدر قبل الاعتماد عليه.
companyWebsite || موقع الشركة
jobCardTitle || بطاقة الوظيفة
workType || نوع العمل
commitment || الدوام
experienceLevel || مستوى الخبرة
experienceYears || سنوات الخبرة
experienceNotRequired || لا تُشترط
weeklyHours || الساعات أسبوعياً
education || المؤهل
publishedAt || تاريخ النشر
verifiedAt || آخر تحقق
daysAgo || يوماً مضياً
geoTitle || الأهلية الجغرافية
geoGeneric || الإعلان لا يحدد دولاً بعينها.
geoCountries || الدول المقبولة
profileEligible || ملفك مسجّل من {country} — مؤهل.
profileIneligible || ملفك مسجّل من {country} — غير مؤهل لهذه الوظيفة.
profileUnclear || لا يمكن تأكيد أهلية {country} من نص الإعلان.
evidenceTitle || دليل الأهلية
languagesTitle || اللغات
requiredBadge || مطلوبة
missingSkillsTitle || مهارات ناقصة في ملفك
missingSkillsLead || هذه ما طلبته هذه الوظيفة ولم تجده في مهاراتك المحفوظة.
missingSkillsSearch || ابحث عن فرص لا تطلب هذه المهارات ←
similarTitle || فرص مشابهة
sourcesTitle || مصادر نجمع منها الوظائف
followApplication || متابعة التقديم
addApplication || أضف لمسار التقديم
copyLink || نسخ الرابط
copied || تم النسخ
applyNow || قدّم الآن
notFoundTitle || لم نجد هذه الوظيفة
notFoundBody || قد يكون الناشر قد حذفها أو أن الرابط قديم.
notFoundBack || العودة إلى محرك البحث
loading || جارٍ فتح الوظيفة'::text), true),
  ('job_detail_copy_en', to_jsonb(E'breadcrumbHome || Home
breadcrumbJobs || Jobs
studentBadge || Student friendly
noExperienceBadge || No experience
weeklyHoursSuffix || hours per week
applyOriginal || Apply at original source
partnerLink || Affiliate link
directLink || Direct link
applyVia || Application handled by
platformAnalysisTitle || Why this page exists
platformAnalysisLead || ezyjobs profile analysis, not information from the listing. It can be imperfect — review the original listing before deciding.
prosTitle || Why it may fit
noPros || No clear positive signals.
consTitle || What may block you
noCons || No visible blockers.
notesTitle || Notes
summaryTitle || Summary
aboutTitle || About the role
skillsTitle || Required skills
requirementsTitle || Core requirements
niceToHaveTitle || Nice to have
sourceTitle || About the source
sourceAllowed || We show this job because its source permits redistribution.
sourceRights || All rights reserved by the publisher; applications are handled on its official website.
sourceReview || We review this source''s licensing before relying on it.
companyWebsite || Company website
jobCardTitle || Job card
workType || Work type
commitment || Commitment
experienceLevel || Experience level
experienceYears || Years of experience
experienceNotRequired || Not required
weeklyHours || Weekly hours
education || Education
publishedAt || Published
verifiedAt || Last verified
daysAgo || days ago
geoTitle || Geographic eligibility
geoGeneric || The listing does not specify particular countries.
geoCountries || Eligible countries
profileEligible || Your profile is registered in {country} — eligible.
profileIneligible || Your profile is registered in {country} — not eligible for this job.
profileUnclear || Eligibility for {country} cannot be confirmed from the listing text.
evidenceTitle || Eligibility evidence
languagesTitle || Languages
requiredBadge || Required
missingSkillsTitle || Skills missing from your profile
missingSkillsLead || These are skills requested by the job that are not in your saved skills.
missingSkillsSearch || Find jobs that do not require these skills →
similarTitle || Similar opportunities
sourcesTitle || Sources we collect jobs from
followApplication || Track application
addApplication || Add to application tracker
copyLink || Copy link
copied || Copied
applyNow || Apply now
notFoundTitle || We could not find this job
notFoundBody || The publisher may have removed it or the link may be outdated.
notFoundBack || Back to job search
loading || Opening job'::text), true),
  ('job_detail_copy_fr', to_jsonb(E'breadcrumbHome || Accueil
breadcrumbJobs || Emplois
studentBadge || Adapté aux étudiants
noExperienceBadge || Sans expérience
weeklyHoursSuffix || heures par semaine
applyOriginal || Postuler auprès de la source originale
partnerLink || Lien affilié
directLink || Lien direct
applyVia || Candidature via
platformAnalysisTitle || Pourquoi cette page existe
platformAnalysisLead || Analyse ezyjobs de votre profil, pas une information de l''annonce. Elle peut être imparfaite — consultez l''annonce originale avant de décider.
prosTitle || Pourquoi elle peut vous convenir
noPros || Aucun signal positif clair.
consTitle || Ce qui peut vous bloquer
noCons || Aucun obstacle visible.
notesTitle || Notes
summaryTitle || Résumé
aboutTitle || À propos du poste
skillsTitle || Compétences requises
requirementsTitle || Exigences principales
niceToHaveTitle || Atouts
sourceTitle || À propos de la source
sourceAllowed || Nous affichons cette offre car sa source autorise la redistribution.
sourceRights || Tous droits réservés à l''éditeur ; les candidatures sont traitées sur son site officiel.
sourceReview || Nous vérifions la licence de cette source avant de nous y fier.
companyWebsite || Site de l''entreprise
jobCardTitle || Fiche du poste
workType || Type de travail
commitment || Engagement
experienceLevel || Niveau d''expérience
experienceYears || Années d''expérience
experienceNotRequired || Non requises
weeklyHours || Heures par semaine
education || Formation
publishedAt || Publiée
verifiedAt || Dernière vérification
daysAgo || jours auparavant
geoTitle || Éligibilité géographique
geoGeneric || L''annonce ne précise pas de pays particuliers.
geoCountries || Pays éligibles
profileEligible || Votre profil est enregistré en {country} — éligible.
profileIneligible || Votre profil est enregistré en {country} — non éligible à cette offre.
profileUnclear || L''éligibilité de {country} ne peut pas être confirmée dans le texte de l''annonce.
evidenceTitle || Preuves d''éligibilité
languagesTitle || Langues
requiredBadge || Requise
missingSkillsTitle || Compétences manquantes dans votre profil
missingSkillsLead || Ces compétences sont demandées par l''offre mais absentes de vos compétences enregistrées.
missingSkillsSearch || Rechercher des offres sans ces compétences →
similarTitle || Offres similaires
sourcesTitle || Sources dont nous collectons les offres
followApplication || Suivre la candidature
addApplication || Ajouter au suivi
copyLink || Copier le lien
copied || Copié
applyNow || Postuler maintenant
notFoundTitle || Offre introuvable
notFoundBody || L''éditeur a peut-être supprimé l''offre ou le lien est obsolète.
notFoundBack || Retour à la recherche
loading || Ouverture de l''offre'::text), true)
on conflict (key) do nothing;
