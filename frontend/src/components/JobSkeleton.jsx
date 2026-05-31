import React from 'react';

/**
 * Pulsing loading card skeleton
 */
export const JobCardSkeleton = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-4 animate-pulse relative overflow-hidden">
      
      {/* Top section: Logo & title skeleton */}
      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl flex-shrink-0"></div>
        <div className="flex-grow flex flex-col gap-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        </div>
      </div>

      {/* Middle: Description placeholder */}
      <div className="flex flex-col gap-1.5 mt-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2 mt-1">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 my-1"></div>

      {/* Footer info: Salary & apply button skeleton */}
      <div className="flex items-center justify-between mt-1">
        <div className="h-4.5 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg w-20"></div>
      </div>
    </div>
  );
};

/**
 * List layout containing multiple skeletons
 */
export const JobListSkeleton = ({ count = 5 }) => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <JobCardSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * Massive, beautiful job details loader skeleton
 */
export const JobDetailsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      
      {/* Left 2 Columns: Core Content */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6">
          
          {/* Header section skeleton */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex-shrink-0"></div>
            <div className="space-y-3 flex-grow w-full">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              
              <div className="flex flex-wrap gap-2.5 pt-1">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-28"></div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800/80" />

          {/* Description blocks skeleton */}
          <div className="space-y-4">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-11/12"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
            </div>
            <div className="space-y-2 pt-3">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            </div>
          </div>

        </div>
      </div>

      {/* Right Column: Company Sidebar Skeleton */}
      <div className="space-y-6">
        
        {/* Quick summary box */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="h-4.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 space-y-3">
            <div className="flex justify-between">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full pt-1"></div>
        </div>

        {/* Company summary box */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="h-4.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
          </div>
        </div>

      </div>
    </div>
  );
};
