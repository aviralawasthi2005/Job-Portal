import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useJobDetails } from '../hooks/useJobs';
import { JobDetailsSkeleton } from '../components/JobSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeft, Stethoscope, MapPin, Globe, Wallet, Clock, Compass, Calendar, Building2, Send, ShieldCheck, HeartPulse, Search, ExternalLink } from 'lucide-react';

const JobDetails = () => {
  const { guid } = useParams();
  const location = useLocation();
  const [logoError, setLogoError] = useState(false);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1. Optimize load using route state (instant render!)
  const stateJob = location.state?.job;

  // 2. Fetch using query hook (caches and acts as deep link recovery)
  const { data, isLoading, isError, error, refetch } = useJobDetails(stateJob ? null : guid);

  // Decide on actual job object
  const job = stateJob || data?.job;

  if (isLoading && !stateJob) {
    return <JobDetailsSkeleton />;
  }

  if (isError && !stateJob) {
    return (
      <div className="py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-health-600 dark:text-health-400 hover:text-health-500 mb-6 group transition-all"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Jobs Directory</span>
        </Link>
        <ErrorMessage
          message={error?.message || 'We could not fetch the job details from the proxy cache. The listing may have expired.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-health-600 dark:text-health-400 hover:text-health-500 mb-6 group transition-all"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Jobs Directory</span>
        </Link>
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md mx-auto shadow-sm">
          <p className="text-slate-600 dark:text-slate-400 font-medium">Job listing not found or listing has expired.</p>
        </div>
      </div>
    );
  }

  const {
    title,
    excerpt,
    description,
    companyName,
    companyLogo,
    companySlug,
    employmentType,
    seniority,
    minSalary,
    maxSalary,
    currency,
    locationRestrictions = [],
    timezoneRestrictions = [],
    categories = [],
    pubDate,
    expiryDate,
    applicationLink
  } = job;

  // Format date helper according to India Time Zone (IST)
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      }) + ' IST';
    } catch (e) {
      return new Date(dateStr).toLocaleDateString('en-IN') + ' IST';
    }
  };

  // Salary range parser
  const getSalaryInfo = () => {
    if (!minSalary && !maxSalary) return 'Competitive Salary';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : `${currency} `;
    const formatNum = (num) => (num >= 1000 ? `${(num / 1000).toFixed(0)}k` : num);

    if (minSalary && maxSalary) {
      return `${currencySymbol}${formatNum(minSalary)} - ${currencySymbol}${formatNum(maxSalary)} / yr`;
    } else if (minSalary) {
      return `${currencySymbol}${formatNum(minSalary)}+ / yr`;
    } else {
      return `Up to ${currencySymbol}${formatNum(maxSalary)} / yr`;
    }
  };

  // Initials generator
  const getInitials = (name) => {
    if (!name) return 'H';
    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  const renderRemoteBadge = () => {
    const locStr = locationRestrictions.join(', ').toLowerCase();
    const isHybrid = locStr.includes('hybrid');
    const isOnsite = locStr.includes('onsite') || locStr.includes('on-site');
    const hasConstraints = locationRestrictions.length > 0;
    
    if (isHybrid) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 px-2 py-0.5 rounded-full">
          <Compass className="w-2.5 h-2.5" />
          <span>Hybrid Remote</span>
        </span>
      );
    }
    if (isOnsite) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 px-2 py-0.5 rounded-full">
          <MapPin className="w-2.5 h-2.5" />
          <span>On-site</span>
        </span>
      );
    }
    if (hasConstraints) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 border border-sky-100/50 dark:border-sky-900/30 px-2 py-0.5 rounded-full">
          <Globe className="w-2.5 h-2.5" />
          <span>Remote (Regional)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 px-2 py-0.5 rounded-full">
        <Globe className="w-2.5 h-2.5" />
        <span>100% Remote</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Navigation Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-health-600 dark:hover:text-health-400 group transition-all"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Jobs Directory</span>
      </Link>

      {/* Grid: 2 Cols Core details, 1 Col sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Core Content: Left Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Header Details Box */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-t-4 border-t-health-600 border-x border-b border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative overflow-hidden">

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              
              {/* Logo with backup */}
              <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
                {companyLogo && !logoError ? (
                  <img
                    src={companyLogo}
                    alt={`${companyName} logo`}
                    className="w-full h-full object-contain p-1"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-lg font-bold text-health-600 dark:text-health-400 tracking-wider">
                    {getInitials(companyName)}
                  </span>
                )}
              </div>

              {/* Title & Basics */}
              <div className="space-y-2 flex-grow min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-health-600 dark:text-health-400 uppercase tracking-wider">
                    {companyName}
                  </span>
                  {renderRemoteBadge()}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {title}
                </h1>

                {/* Tags row */}
                <div className="flex flex-wrap gap-2 pt-2 items-center">
                  {employmentType && (
                    <span className="text-[11px] font-semibold bg-health-50 dark:bg-health-950/20 text-health-700 dark:text-health-300 border border-health-100/50 dark:border-health-900/30 px-2.5 py-0.5 rounded-full">
                      {employmentType}
                    </span>
                  )}
                  {seniority && (
                    <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/30 px-2.5 py-0.5 rounded-full">
                      {seniority}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 px-2.5 py-0.5 rounded-full">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{getSalaryInfo()}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Divider */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 my-6"></div>

            {/* Core Restrictions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Geographic Scope</div>
                  <span className="text-slate-850 dark:text-slate-200">
                    {locationRestrictions.length > 0 ? locationRestrictions.join(', ') : 'Worldwide Remote'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Timezone Limits</div>
                  <span className="text-slate-850 dark:text-slate-200">
                    {timezoneRestrictions.length > 0 ? timezoneRestrictions.join(', ') : 'Any Timezone'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Job Description Box (Render HTML) */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HeartPulse className="w-4.5 h-4.5 text-health-600" />
              <span>Full Job Description & Role Profile</span>
            </h2>

            {/* Custom styled HTML description */}
            <div 
              className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 select-text
                prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-headings:mt-6 prose-headings:mb-3
                prose-h2:text-lg prose-h3:text-base
                prose-p:mb-4
                prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-2 prose-ul:mb-4
                prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-2 prose-ol:mb-4
                prose-li:text-slate-600 dark:prose-li:text-slate-300
                prose-strong:font-extrabold prose-strong:text-slate-900 dark:prose-strong:text-slate-100"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

        </div>

        {/* Sidebar: Right Column - Sticky container so all cards stay aligned and consistent */}
        <div className="space-y-6 lg:sticky lg:top-24">
          
          {/* 1. Apply Action Summary Center */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-health-600" />
              <span>Job Application Summary</span>
            </h3>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between items-center">
                <span>Company</span>
                <span className="text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{companyName || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Salary Scale</span>
                <span className="text-emerald-600 dark:text-emerald-400">{getSalaryInfo()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Geographics</span>
                <span className="text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                  {locationRestrictions.length > 0 ? locationRestrictions.join(', ') : 'Worldwide Remote'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Employment</span>
                <span className="text-slate-800 dark:text-slate-200">{employmentType || 'Remote'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Seniority</span>
                <span className="text-slate-800 dark:text-slate-200">{seniority || 'General'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Published</span>
                <span className="text-slate-800 dark:text-slate-200">{formatDate(pubDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Closing Date</span>
                <span className="text-slate-800 dark:text-slate-200">{formatDate(expiryDate)}</span>
              </div>
            </div>

            {applicationLink && (
              <a
                href={applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 bg-health-600 hover:bg-health-700 active:scale-98 text-white font-bold text-xs rounded-lg transition-colors duration-200 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply on Hiring Site</span>
              </a>
            )}

            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal text-center pt-2">
              By clicking "Apply on Hiring Site", you will be redirected to the secure portal. Ensure credentials match clinical requirements.
            </p>
          </div>

          {/* 2. Company Info Box */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-health-600" />
              <span>Hiring Organization</span>
            </h3>

            <div className="space-y-3">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{companyName}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Explore remote jobs and medical opportunities with {companyName}. Check full details and explore careers with this premium medical provider.
              </p>
              
              {companySlug && (
                <Link
                  to={`/?company=${companySlug}`}
                  className="inline-flex items-center text-xs font-bold text-health-600 dark:text-health-400 hover:underline pt-1 mb-2"
                >
                  View more jobs from {companyName}
                </Link>
              )}

              {/* Visual Divider & Verification Grid */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
                  Verify Organization
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(companyName + ' official website')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors group text-[11px] font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="truncate">Official Website</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(companyName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors group text-[11px] font-semibold"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="truncate">LinkedIn Page</span>
                  </a>
                  <a
                    href={`https://www.glassdoor.co.in/Search/results.htm?keyword=${encodeURIComponent(companyName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors group text-[11px] font-semibold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="truncate">Glassdoor Reviews</span>
                  </a>
                  <a
                    href={`https://in.indeed.com/jobs?q=${encodeURIComponent(companyName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors group text-[11px] font-semibold"
                  >
                    <Search className="w-3.5 h-3.5 text-teal-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="truncate">Indeed India</span>
                  </a>
                  <a
                    href={`https://www.naukri.com/${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-jobs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 flex items-center justify-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors group text-[11px] font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-orange-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span>Explore on Naukri.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default JobDetails;
