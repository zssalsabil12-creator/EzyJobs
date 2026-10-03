import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { ProfileProvider } from './features/profile/ProfileContext';
import { jobsRepo } from './lib/jobsRepo';
import type { Job } from './types';
import Layout from './components/layout/Layout';
import RequireAuth from './routes/RequireAuth';
import HomePage from './pages/HomePage';
import JobsExplorer from './pages/JobsExplorer';
import { CountryPage, FieldPage } from './pages/SeoPages';
import JobDetailPage from './pages/JobDetailPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCreatorsPage from './pages/AdminCreatorsPage';
import ContentPagesPage from './pages/ContentPagesPage';
import AdminGuidesPage from './pages/AdminGuidesPage';
import ManagedContentPage from './pages/ManagedContentPage';
import EzyPublishPage from './pages/EzyPublishPage';
import CreatorArticlePage from './pages/CreatorArticlePage';
import StudentWriterLandingPage from './pages/StudentWriterLandingPage';
import EzyTasksPage from './pages/EzyTasksPage';
import AdminTasksPage from './pages/AdminTasksPage';
import AdminFinancePage from './pages/AdminFinancePage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ToolsPage from './pages/ToolsPage';
import { GuidePage, GuidesPage } from './pages/GuidesPage';
import SavedPage from './pages/SavedPage';
import AlertsPage from './pages/AlertsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ProfilePage from './pages/ProfilePage';
import ApplicationKitPage from './pages/ApplicationKitPage';
import AboutPage from './pages/AboutPage';
import DemandPage from './pages/DemandPage';
import SearchOpportunityPage from './pages/SearchOpportunityPage';
import { PrivacyPage, TermsPage, UsagePolicyPage } from './pages/LegalPages';
import NotFoundPage from './pages/NotFoundPage';
import CommandPalette from './components/art/CommandPalette';
import { FullPageLoader } from './components/ui/Feedback';
import { trackUsage } from './lib/usage';
import { initSavedJobsSync } from './lib/savedJobs';

export function AppRoutes({ initialJobs }: { initialJobs?: Job[] } = {}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs ?? []);
  const [loading, setLoading] = useState(!initialJobs);
  const [loadError, setLoadError] = useState<string | null>(null);
  const location = useLocation();
  const { session } = useAuth();

  useEffect(() => {
    void initSavedJobsSync(session?.user.id ?? null);
  }, [session?.user.id]);

  useEffect(() => {
    void trackUsage('page_view', location.pathname);
  }, [location.pathname]);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await jobsRepo.list();
    setJobs(data);
    setLoadError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialJobs) return;
    void reload();
  }, [reload, initialJobs]);

  return (
    <>
      <CommandPalette jobs={jobs} />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage jobs={jobs} />} />

          <Route
            path="/jobs"
            element={
              <JobsExplorer
                jobs={jobs}
                loading={loading}
                title="محرك البحث"
                eyebrow="كل الفرص"
                lead="صنّف النتائج بدل قراءة مئات الإعلانات. ابدأ من دولتك ومستواك، ثم اقرأ ما يهمّك فقط."
              />
            }
          />
          <Route
            path="/students"
            element={
              <JobsExplorer
                jobs={jobs}
                loading={loading}
                preset={{ studentsOnly: true, sort: 'newest' }}
                eyebrow="فرص الطلاب"
                title="وظائف أثناء الدراسة"
                lead="دوام جزئي، تدريب مدفوع، وعمل حر لا يتعارض مع جدول المحاضرات. حدّد عدد ساعاتك المتاحة وسيُستبعد ما لا يناسبك."
              />
            }
          />
          <Route
            path="/no-experience"
            element={
              <JobsExplorer
                jobs={jobs}
                loading={loading}
                preset={{ noExperienceOnly: true }}
                eyebrow="ابدأ من الصفر"
                title="وظائف لا تشترط خبرة"
                lead="هنا لا يوجد شرط سنوات سابقة. كل ما تحتاجه هو ساعة أو ساعتان يومياً للتعلم، والاستعداد لتقديم عملك الأول."
              />
            }
          />
          <Route
            path="/remote"
            element={
              <JobsExplorer
                jobs={jobs}
                loading={loading}
                preset={{ workMode: 'remote' }}
                eyebrow="العمل عن بُعد"
                title="كل الوظائف عن بُعد"
                lead="بدون تنقل، وبدون بطاقة إقامة في بلد آخر. لكن انتبه: كلمة Remote وحدها لا تعني أن دولتك مقبولة — ولهذا نوضح ذلك في كل بطاقة."
              />
            }
          />

          <Route
            path="/en/remote-jobs"
            element={
              <JobsExplorer
                jobs={jobs}
                loading={loading}
                locale="en"
                preset={{ workMode: 'remote' }}
                eyebrow="Remote jobs"
                title="Remote Jobs Worldwide"
                lead="Find remote opportunities and check geographic eligibility, experience and application details before you apply."
                canonicalPath="/en/remote-jobs"
                alternates={{
                  ar: "https://ezyjobs.com/remote",
                  en: "https://ezyjobs.com/en/remote-jobs",
                  fr: "https://ezyjobs.com/fr/emploi-teletravail",
                  "x-default": "https://ezyjobs.com/en/remote-jobs",
                }}
              />
            }
          />
          <Route
            path="/fr/emploi-teletravail"
            element={
              <JobsExplorer
                jobs={jobs}
                loading={loading}
                locale="fr"
                preset={{ workMode: 'remote' }}
                eyebrow="Télétravail"
                title="Emplois en télétravail"
                lead="Trouvez des emplois à distance et vérifiez l’éligibilité géographique avant de postuler."
                canonicalPath="/fr/emploi-teletravail"
                alternates={{
                  ar: "https://ezyjobs.com/remote",
                  en: "https://ezyjobs.com/en/remote-jobs",
                  fr: "https://ezyjobs.com/fr/emploi-teletravail",
                  "x-default": "https://ezyjobs.com/en/remote-jobs",
                }}
              />
            }
          />
          <Route
            path="/en/jobs"
            element={
              <JobsExplorer
                jobs={jobs}
                loading={loading}
                locale="en"
                eyebrow="Job search"
                title="Online & Remote Jobs"
                lead="Explore jobs, compare eligibility and prepare a stronger application."
                canonicalPath="/en/jobs"
                alternates={{
                  ar: "https://ezyjobs.com/jobs",
                  en: "https://ezyjobs.com/en/jobs",
                  fr: "https://ezyjobs.com/fr/emplois",
                  "x-default": "https://ezyjobs.com/en/jobs",
                }}
              />
            }
          />
          <Route
            path="/fr/emplois"
            element={
              <JobsExplorer
                jobs={jobs}
                loading={loading}
                locale="fr"
                eyebrow="Recherche d’emploi"
                title="Emplois en ligne et à distance"
                lead="Explorez les offres, comparez l’éligibilité et préparez votre candidature."
                canonicalPath="/fr/emplois"
                alternates={{
                  ar: "https://ezyjobs.com/jobs",
                  en: "https://ezyjobs.com/en/jobs",
                  fr: "https://ezyjobs.com/fr/emplois",
                  "x-default": "https://ezyjobs.com/en/jobs",
                }}
              />
            }
          />
          <Route path="/demand" element={<DemandPage locale="ar" />} />
          <Route path="/search/:slug" element={<SearchOpportunityPage jobs={jobs} loading={loading} />} />
          <Route path="/en/job-search-trends" element={<DemandPage locale="en" />} />
          <Route path="/fr/tendances-emploi" element={<DemandPage locale="fr" />} />
          <Route path="/country/:slug" element={<CountryPage jobs={jobs} loading={loading} />} />
          <Route path="/field/:slug" element={<FieldPage jobs={jobs} loading={loading} />} />
          <Route path="/jobs/:slug" element={<JobDetailRoute jobs={jobs} loading={loading} locale="ar" />} />
          <Route path="/en/jobs/:slug" element={<JobDetailRoute jobs={jobs} loading={loading} locale="en" />} />
          <Route path="/fr/jobs/:slug" element={<JobDetailRoute jobs={jobs} loading={loading} locale="fr" />} />

          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/guides/:slug" element={<GuidePage />} />
          <Route path="/articles" element={<GuidesPage />} />
          <Route path="/articles/:slug" element={<GuidePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/:tool" element={<ToolsPage />} />
          <Route path="/saved" element={<SavedPage jobs={jobs} />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route
            path="/applications"
            element={
              <RequireAuth>
                <ApplicationsPage jobs={jobs} />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage jobs={jobs} />
              </RequireAuth>
            }
          />
          <Route
            path="/applications/:jobId/kit"
            element={
              <RequireAuth>
                <ApplicationKitPage jobs={jobs} />
              </RequireAuth>
            }
          />
          <Route path="/about" element={<ManagedContentPage slug="about" fallback={<AboutPage jobCount={jobs.length} />} />} />
          <Route path="/student-writer" element={<StudentWriterLandingPage />} />
          <Route
            path="/tasks"
            element={
              <RequireAuth>
                <EzyTasksPage />
              </RequireAuth>
            }
          />

          <Route
            path="/publish"
            element={
              <RequireAuth>
                <EzyPublishPage />
              </RequireAuth>
            }
          />
          <Route path="/publish/:slug" element={<CreatorArticlePage />} />
          <Route path="/terms" element={<ManagedContentPage slug="terms" fallback={<TermsPage />} />} />
          <Route path="/privacy" element={<ManagedContentPage slug="privacy" fallback={<PrivacyPage />} />} />
          <Route path="/usage-policy" element={<ManagedContentPage slug="usage-policy" fallback={<UsagePolicyPage />} />} />
          <Route path="/page/:slug" element={<PublicManagedPageRoute />} />

          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth publisherOnly>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth adminOnly>
                <AdminDashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/creators"
            element={
              <RequireAuth adminOnly>
                <AdminCreatorsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <RequireAuth adminOnly>
                <AdminTasksPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <RequireAuth adminOnly>
                <AdminFinancePage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/pages"
            element={
              <RequireAuth adminOnly>
                <ContentPagesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/guides"
            element={
              <RequireAuth adminOnly>
                <AdminGuidesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RequireAuth adminOnly>
                <AdminSettingsPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      {loadError && (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-[12px] leading-relaxed text-danger">
          تعذّر تحميل الوظائف من الخادم — يتم عرض البيانات المحفوظة محلياً.
        </div>
      )}

      {loading && jobs.length === 0 && <FullPageLoader label="جارٍ تحميل المنصة" />}
    </>
  );
}

function JobDetailRoute({
  jobs,
  loading,
  locale,
}: {
  jobs: Job[];
  loading: boolean;
  locale?: 'ar' | 'en' | 'fr';
}) {
  const { slug } = useParams<{ slug: string }>();
  const job = jobs.find((j) => j.slug === slug);

  useEffect(() => {
    if (job) void trackUsage('job_view', `/jobs/${job.slug}`, job.id);
  }, [job]);

  return (
    <JobDetailPage
      job={job}
      allJobs={jobs}
      loading={loading}
      locale={locale}
    />
  );
}

function PublicManagedPageRoute() {
  const { slug = '' } = useParams<{ slug: string }>();
  return <ManagedContentPage slug={slug} fallback={<NotFoundPage />} />;
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ProfileProvider>
    </AuthProvider>
  );
}
