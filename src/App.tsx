import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import MarqueeBanner from './components/MarqueeBanner';
import SourcesSection from './components/SourcesSection';
import BentoGrid from './components/BentoGrid';
import JobsSection from './components/JobsSection';
import HowItWorks from './components/HowItWorks';
import ForStudents from './components/ForStudents';
import RevenueSection from './components/RevenueSection';
import PublisherDashboard from './components/PublisherDashboard';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import { jobsData, Job } from './data/jobs';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedType, setSelectedType] = useState('الكل');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredJobs = jobsData.filter((job: Job) => {
    const matchesSearch = job.title.includes(searchQuery) || 
                         job.company.includes(searchQuery) ||
                         job.description.includes(searchQuery);
    const matchesCategory = selectedCategory === 'الكل' || job.category === selectedCategory;
    const matchesType = selectedType === 'الكل' || job.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navigation scrollY={scrollY} />
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <MarqueeBanner />
      <SourcesSection />
      <BentoGrid />
      <JobsSection 
        jobs={filteredJobs}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
      <HowItWorks />
      <ForStudents />
      <RevenueSection />
      <PublisherDashboard />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default App;
