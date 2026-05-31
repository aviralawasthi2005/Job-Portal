import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, RotateCcw, X, GraduationCap, Briefcase, Sparkles, Filter } from 'lucide-react';

const HEALTHCARE_CATEGORIES = [
  'Doctor',
  'Nurse',
  'Medical Assistant',
  'Pharmacist',
  'Dentist',
  'Radiologist',
  'Healthcare Administrator',
  'Physiotherapist',
  'Lab Technician',
  'Clinical Research',
  'Mental Health',
  'Telemedicine',
  'Biomedical & Biotech'
];

const SENIORITY_LEVELS = [
  'Entry-level',
  'Mid-level',
  'Senior',
  'Manager',
  'Director',
  'Executive'
];

const EMPLOYMENT_TYPES = [
  'Full Time',
  'Part Time',
  'Contractor',
  'Temporary',
  'Intern'
];

const SORT_OPTIONS = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'salaryDesc', label: 'Highest Salary' },
  { value: 'salaryAsc', label: 'Lowest Salary' },
  { value: 'nameAToZ', label: 'Company A to Z' },
  { value: 'nameZToA', label: 'Company Z to A' },
  { value: 'jobs', label: 'Job Title A-Z' }
];

const JobFilters = ({ filters, onFilterChange, onReset }) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const handleInputChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value, page: 1 });
  };

  const handleCheckboxChange = (name, itemValue) => {
    // Himalayas API can take list filters as comma-separated values
    const currentValues = filters[name] ? filters[name].split(',') : [];
    let updatedValues = [];

    if (currentValues.includes(itemValue)) {
      updatedValues = currentValues.filter(val => val !== itemValue);
    } else {
      updatedValues = [...currentValues, itemValue];
    }

    onFilterChange({
      ...filters,
      [name]: updatedValues.join(','),
      page: 1
    });
  };

  const renderFilterFormContent = () => (
    <div className="space-y-6">
      
      {/* Header section (Desktop: clean, Mobile: include close button) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-health-600 dark:text-health-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Refine Search
          </h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-health-600 dark:text-slate-400 dark:hover:text-health-400 font-semibold transition-colors duration-200"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* 1. Keyword search */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Keyword Search
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="e.g. Cardiologist, Clinical..."
            value={filters.q || ''}
            onChange={(e) => handleInputChange('q', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-health-500/20 focus:border-health-500 dark:focus:ring-health-500/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* 2. Custom Medical Category selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-mint-500 animate-pulse" />
          <span>Medical Field</span>
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-health-500/20 focus:border-health-500 transition-all duration-200"
        >
          <option value="">All Health Categories</option>
          {HEALTHCARE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Sorting list */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Sort Results By
        </label>
        <select
          value={filters.sort || 'relevant'}
          onChange={(e) => handleInputChange('sort', e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-health-500/20 focus:border-health-500 transition-all duration-200"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <hr className="border-slate-100 dark:border-slate-800/80" />

      {/* 4. Geography/Country search */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Country Constraint
        </label>
        <select
          value={filters.country || ''}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-health-500/20 focus:border-health-500 transition-all duration-200"
        >
          <option value="">All Countries</option>
          <option value="India">India 🇮🇳</option>
          <option value="United States">United States 🇺🇸</option>
          <option value="United Kingdom">United Kingdom 🇬🇧</option>
          <option value="Canada">Canada 🇨🇦</option>
          <option value="Germany">Germany 🇩🇪</option>
        </select>
      </div>

      {/* 5. Geographic checkbox options */}
      <div className="space-y-2 pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.worldwide === 'true'}
            onChange={(e) => handleInputChange('worldwide', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded text-health-600 focus:ring-health-500 border-slate-300 dark:border-slate-700 dark:bg-slate-950 transition"
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Show Worldwide Only
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={filters.exclude_worldwide === 'true'}
            onChange={(e) => handleInputChange('exclude_worldwide', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded text-health-600 focus:ring-health-500 border-slate-300 dark:border-slate-700 dark:bg-slate-950 transition"
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Exclude Worldwide Listings
          </span>
        </label>
      </div>

      <hr className="border-slate-100 dark:border-slate-800/80" />

      {/* 6. Seniority check */}
      <div className="space-y-3.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-health-600 dark:text-health-400" />
          <span>Seniority Level</span>
        </label>
        <div className="space-y-2">
          {SENIORITY_LEVELS.map((level) => {
            const isChecked = (filters.seniority || '').split(',').includes(level);
            return (
              <label key={level} className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange('seniority', level)}
                  className="w-4.5 h-4.5 rounded text-health-600 focus:ring-health-500 border-slate-300 dark:border-slate-700 dark:bg-slate-950 transition-all duration-200"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {level}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800/80" />

      {/* 7. Employment Type check */}
      <div className="space-y-3.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-health-600 dark:text-health-400" />
          <span>Employment Style</span>
        </label>
        <div className="space-y-2">
          {EMPLOYMENT_TYPES.map((type) => {
            const isChecked = (filters.employment_type || '').split(',').includes(type);
            return (
              <label key={type} className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange('employment_type', type)}
                  className="w-4.5 h-4.5 rounded text-health-600 focus:ring-health-500 border-slate-300 dark:border-slate-700 dark:bg-slate-950 transition-all duration-200"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {type}
                </span>
              </label>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* 1. MOBILE FLOAT ACTION BUTTON AND TRIGGER */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mb-4 shadow-sm select-none">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Filtering Panel</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Toggle advanced healthcare filters</span>
        </div>
        <button
          onClick={() => setIsOpenMobile(true)}
          className="flex items-center gap-2 px-4 py-2 bg-health-600 hover:bg-health-700 text-white font-bold text-sm rounded-xl transition shadow-md"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* 2. MOBILE COLLAPSIBLE DRAWER CONTAINER */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-[100] flex justify-end lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOpenMobile(false)}
          ></div>
          
          {/* Drawer content */}
          <div className="relative w-full max-w-sm h-full bg-white dark:bg-slate-900 p-6 overflow-y-auto flex flex-col shadow-2xl animate-slide-up border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsOpenMobile(false)}
              className="absolute top-4 right-4 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mt-8 flex-grow">
              {renderFilterFormContent()}
            </div>
          </div>
        </div>
      )}

      {/* 3. DESKTOP PERMANENT FLOATING SIDEBAR PANEL */}
      <div className="hidden lg:block w-72 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm h-fit sticky top-24 select-none">
        {renderFilterFormContent()}
      </div>
    </>
  );
};

export default JobFilters;
