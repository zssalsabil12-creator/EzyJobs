import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import JobListings from './components/JobListings';
import HowItWorks from './components/HowItWorks';
import RevenueModel from './components/RevenueModel';
import Stats from './components/Stats';
import Footer from './components/Footer';
import { jobsData, Job } from './data/jobs';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedType, setSelectedType] = useState('الكل');

  const filteredJobs = jobsData.filter((job: Job) => {
    const matchesSearch = job.title.includes(searchQuery) || 
                         job.company.includes(searchQuery) ||
                         job.description.includes(searchQuery);
    const matchesCategory = selectedCategory === 'الكل' || job.category === selectedCategory;
    const matchesType = selectedType === 'الكل' || job.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Stats />
      <Categories 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
      />
      <JobListings 
        jobs={filteredJobs}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
      <HowItWorks />
      <RevenueModel />
      <Footer />
    </div>
  );
}

export default App;
