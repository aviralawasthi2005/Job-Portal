import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Briefcase, Link2, DollarSign, MapPin, PlusCircle, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { JobService } from '../services/api';

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    companyLogo: '',
    category: 'Biomedical & Biotech',
    employmentType: 'Full Time',
    seniority: 'Mid-level',
    workStyle: 'Remote (Worldwide)',
    minSalary: '',
    maxSalary: '',
    currency: 'INR',
    locationRestrictions: '',
    description: '',
    applicationLink: ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const categories = [
    'Biomedical & Biotech',
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
    'Telemedicine'
  ];

  const seniorities = [
    { label: 'Entry-level / Junior', value: 'Entry-level' },
    { label: 'Mid-level', value: 'Mid-level' },
    { label: 'Senior', value: 'Senior' },
    { label: 'Manager / Lead', value: 'Manager' },
    { label: 'Director / Executive', value: 'Director' }
  ];

  const employmentTypes = [
    { label: 'Full Time', value: 'Full Time' },
    { label: 'Part Time', value: 'Part Time' },
    { label: 'Contract / Freelance', value: 'Contractor' },
    { label: 'Internship', value: 'Intern' }
  ];

  const currencies = ['INR', 'USD', 'EUR', 'GBP'];

  const workStyles = [
    'Remote (Worldwide)',
    'Remote (Regional)',
    'Hybrid Remote',
    'On-site'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    // Client-side validation
    if (!formData.title.trim() || !formData.companyName.trim() || !formData.applicationLink.trim()) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please fill out all required fields: Job Title, Company Name, and Application Link.'
      });
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      let finalLocations = [];
      const rawLocs = formData.locationRestrictions
        ? formData.locationRestrictions.split(',').map(l => l.trim()).filter(Boolean)
        : [];
      
      if (formData.workStyle === 'Remote (Worldwide)') {
        finalLocations = [];
      } else if (formData.workStyle === 'Remote (Regional)') {
        finalLocations = rawLocs;
      } else if (formData.workStyle === 'Hybrid Remote') {
        finalLocations = rawLocs.some(l => l.toLowerCase() === 'hybrid')
          ? rawLocs 
          : [...rawLocs, 'Hybrid'];
      } else if (formData.workStyle === 'On-site') {
        finalLocations = rawLocs.some(l => l.toLowerCase() === 'on-site' || l.toLowerCase() === 'onsite')
          ? rawLocs 
          : [...rawLocs, 'On-site'];
      }

      // Send data to backend manual jobs creator endpoint
      await JobService.createManualJob({
        ...formData,
        locationRestrictions: finalLocations
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Excellent! Your job listing was manually aggregated successfully.'
      });

      // Navigate back to home feed after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 2500);

    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: err.message || 'An error occurred while saving the manual listing. Please try again.'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-2">
      
      {/* Back Button with subtle micro-animation */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-health-600 dark:hover:text-health-400 mb-6 transition-all duration-200 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
        <span>Back to Job Board</span>
      </Link>

      {/* Main glassmorphic container card */}
      <div className="glass-card shadow-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden p-6 md:p-8">
        
        {/* Header Title */}
        <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-5 mb-6">
          <div className="p-2.5 bg-health-600 text-white rounded-xl shadow-md">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Post a Job Manually
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Instantly aggregate remote clinical, nursing, and biotech vacancies into the feed.
            </p>
          </div>
        </div>

        {/* Alerts Banner */}
        {alert.show && (
          <div 
            className={`p-4 rounded-xl flex items-start gap-3 mb-6 animate-fadeIn ${
              alert.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/30 text-rose-800 dark:text-rose-300'
            }`}
          >
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="text-xs font-semibold leading-relaxed">{alert.message}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Grid section for Job Title & Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Job Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Job Title</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Telehealth Nurse Practitioner"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="companyName" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Company Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Apollo Hospitals"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
            </div>

          </div>

          {/* Grid section for Category, Seniority, Employment Type & Work Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Seniority Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="seniority" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Seniority Level
              </label>
              <select
                id="seniority"
                name="seniority"
                value={formData.seniority}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
              >
                {seniorities.map(snr => (
                  <option key={snr.value} value={snr.value}>{snr.label}</option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="employmentType" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Employment Style
              </label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
              >
                {employmentTypes.map(emp => (
                  <option key={emp.value} value={emp.value}>{emp.label}</option>
                ))}
              </select>
            </div>

            {/* Work Style Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="workStyle" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Work Style
              </label>
              <select
                id="workStyle"
                name="workStyle"
                value={formData.workStyle}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
              >
                {workStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Grid section for Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Currency Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="currency" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Salary Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
              >
                {currencies.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>

            {/* Min Salary */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="minSalary" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Min Annual Salary (optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  id="minSalary"
                  name="minSalary"
                  value={formData.minSalary}
                  onChange={handleChange}
                  placeholder="e.g. 600000"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
                />
              </div>
            </div>

            {/* Max Salary */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="maxSalary" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Max Annual Salary (optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  id="maxSalary"
                  name="maxSalary"
                  value={formData.maxSalary}
                  onChange={handleChange}
                  placeholder="e.g. 1000000"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
                />
              </div>
            </div>

          </div>

          {/* Grid section for Company Logo & Geographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Company Logo URL */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="companyLogo" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Company Logo Image URL (optional)
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  id="companyLogo"
                  name="companyLogo"
                  value={formData.companyLogo}
                  onChange={handleChange}
                  placeholder="e.g. https://example.com/logo.svg"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
                />
              </div>
            </div>

            {/* Location Restrictions */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="locationRestrictions" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>
                  {formData.workStyle === 'Hybrid Remote' 
                    ? 'Hybrid Office Location' 
                    : formData.workStyle === 'On-site' 
                    ? 'Physical Site Location' 
                    : 'Geographic Restrictions'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {formData.workStyle === 'Remote (Worldwide)' 
                    ? '(Global open remote)' 
                    : formData.workStyle === 'Hybrid Remote' 
                    ? '(e.g. Bengaluru, India)' 
                    : formData.workStyle === 'On-site' 
                    ? '(e.g. Mumbai Hospital)' 
                    : '(e.g. India, APAC)'}
                </span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="locationRestrictions"
                  name="locationRestrictions"
                  value={formData.locationRestrictions}
                  onChange={handleChange}
                  disabled={formData.workStyle === 'Remote (Worldwide)'}
                  placeholder={
                    formData.workStyle === 'Remote (Worldwide)' 
                      ? 'No constraints — worldwide remote' 
                      : formData.workStyle === 'Hybrid Remote' 
                      ? 'e.g. Delhi, India' 
                      : formData.workStyle === 'On-site' 
                      ? 'e.g. Apollo Hospital, Mumbai' 
                      : 'e.g. India, APAC'
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                />
              </div>
            </div>

          </div>

          {/* Direct Apply URL */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="applicationLink" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Application Link</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                id="applicationLink"
                name="applicationLink"
                value={formData.applicationLink}
                onChange={handleChange}
                placeholder="https://example.com/apply"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* Description Content */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Job Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Provide a comprehensive job description, key responsibilities, and requirements..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-health-500 dark:focus:border-health-400 rounded-xl shadow-inner focus:outline-none transition-colors duration-200"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <Link
              to="/"
              className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 rounded-xl transition-all duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-health-600 hover:bg-health-700 dark:bg-health-600 dark:hover:bg-health-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all duration-200 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Aggregating...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Listing</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default PostJob;
