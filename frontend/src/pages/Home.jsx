import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import JobFilters from '../components/JobFilters';
import JobCard from '../components/JobCard';
import { JobListSkeleton } from '../components/JobSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import { Stethoscope, HeartPulse } from 'lucide-react';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Deriving filters state directly from URL query parameters (source of truth)
  const filters = {
    q: searchParams.get('q') || '',
    country: searchParams.get('country') || '',
    worldwide: searchParams.get('worldwide') || '',
    exclude_worldwide: searchParams.get('exclude_worldwide') || '',
    seniority: searchParams.get('seniority') || '',
    employment_type: searchParams.get('employment_type') || '',
    company: searchParams.get('company') || '',
    sort: searchParams.get('sort') || 'relevant',
    page: searchParams.get('page') ? parseInt(searchParams.get('page')) : 1,
    category: searchParams.get('category') || ''
  };

  // Query hook using React Query linked to search parameters
  const { data, isLoading, isError, error, refetch } = useJobs(filters);

  // Scroll to top on page or filter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters.page, filters.category, filters.q, filters.company]);

  const handleFilterChange = (newFilters) => {
    const params = {};
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] !== undefined && newFilters[key] !== '') {
        params[key] = String(newFilters[key]);
      }
    });
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    handleFilterChange({ ...filters, page: newPage });
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* 1. HERO BANNER HEADER - Clean, Formal & Modern Search Panel */}
      <section className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-semibold">
            <span>Clinical & Administrative Roles</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Explore Remote{' '}
            <span className="text-health-600 dark:text-health-400">
              Healthcare Careers
            </span>
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Discover verified remote opportunities for clinical specialists, nurse practitioners, telehealth coordinators, research analysts, and medical administrators.
          </p>
        </div>
      </section>

      {/* 2. LAYOUT DIVISION: FILTERS & RESULTS */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left section: Filter sidebar */}
        <JobFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Right section: Job listing feed */}
        <div className="flex-grow w-full space-y-6">
          
          {/* Top header stats bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {filters.category ? `${filters.category} Positions` : 'All Medical Openings'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isLoading
                  ? 'Loading listings...'
                  : data?.success
                  ? `Showing ${data.jobs?.length || 0} of ${data.totalCount || 0} matching jobs`
                  : 'No jobs fetched'}
              </span>
            </div>
          </div>

          {/* Dynamic Feed Content rendering */}
          {isLoading ? (
            <JobListSkeleton count={4} />
          ) : isError ? (
            <ErrorMessage
              message={error?.message || 'Error occurred while executing jobs search.'}
              onRetry={refetch}
            />
          ) : data?.jobs && data.jobs.length > 0 ? (
            <div className="space-y-4">
              {data.jobs.map((job) => (
                <JobCard key={job.guid} job={job} />
              ))}

              {/* Pagination controls */}
              <Pagination
                currentPage={data.page || 1}
                totalPages={data.totalPages || 1}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col items-center gap-4 select-none">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl">
                <Stethoscope className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-200">
                  No remote healthcare jobs found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Try broadening your keyword query, choosing a different medical category, or removing country restrictions.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-health-600 hover:bg-health-700 text-white font-bold text-sm rounded-xl transition shadow"
              >
                Clear Search filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
