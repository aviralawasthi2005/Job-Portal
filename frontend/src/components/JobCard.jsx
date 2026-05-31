import React, { useState } from 'react';
import { MapPin, Globe, Wallet, Clock, ArrowUpRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
  const [logoError, setLogoError] = useState(false);

  const {
    guid,
    title,
    excerpt,
    companyName,
    companyLogo,
    employmentType,
    seniority,
    minSalary,
    maxSalary,
    currency,
    locationRestrictions = []
  } = job;

  // Format salary display helper
  const formatSalary = () => {
    if (!minSalary && !maxSalary) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
          <Wallet className="w-3.5 h-3.5" />
          <span>Competitive Salary</span>
        </span>
      );
    }

    const formatNum = (num) => {
      if (num >= 1000) return `${Math.floor(num / 1000)}k`;
      return num;
    };

    const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : `${currency} `;
    
    let salaryText = '';
    if (minSalary && maxSalary) {
      salaryText = `${currencySymbol}${formatNum(minSalary)} - ${formatNum(maxSalary)}`;
    } else if (minSalary) {
      salaryText = `${currencySymbol}${formatNum(minSalary)}+`;
    } else {
      salaryText = `Up to ${currencySymbol}${formatNum(maxSalary)}`;
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
        <Wallet className="w-3.5 h-3.5" />
        <span>{salaryText} / yr</span>
      </span>
    );
  };

  // Generate backup placeholder logo using company initials
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
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-200 hover:border-health-400 hover:shadow-sm">

      <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
        
        {/* Company Logo Section with fallback initials */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          {companyLogo && !logoError ? (
            <img
              src={companyLogo}
              alt={`${companyName} logo`}
              className="w-full h-full object-contain p-1"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-sm font-extrabold text-health-600 dark:text-health-400 tracking-wider">
              {getInitials(companyName)}
            </span>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-health-600 dark:text-health-400 uppercase tracking-wider">
              {companyName}
            </span>
            
            {/* Remote status indicator */}
            {renderRemoteBadge()}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 hover:text-health-600 dark:hover:text-health-400 transition-colors duration-200 line-clamp-1">
            <Link to={`/jobs/${encodeURIComponent(guid)}`} state={{ job }}>
              {title}
            </Link>
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {excerpt || 'Explore this remote healthcare career opening. Tap to read detailed scope of practice, roles, requirements, and submit application.'}
          </p>

          {/* Metadata badges row */}
          <div className="flex flex-wrap gap-2 mt-4 items-center">
            {employmentType && (
              <span className="text-[11px] font-semibold bg-health-50 dark:bg-health-950/20 text-health-700 dark:text-health-300 border border-health-100/50 dark:border-health-900/30 px-2.5 py-0.5 rounded-full">
                {employmentType}
              </span>
            )}
            
            {seniority && (
              <span className="text-[11px] font-semibold bg-mint-50 dark:bg-mint-950/20 text-mint-700 dark:text-mint-300 border border-mint-100/50 dark:border-mint-900/30 px-2.5 py-0.5 rounded-full">
                {seniority}
              </span>
            )}

            {formatSalary()}

            {/* Location restrictions details */}
            {locationRestrictions.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span className="max-w-[150px] truncate">
                  {locationRestrictions.join(', ')}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Worldwide Remote</span>
              </span>
            )}
          </div>
        </div>

        {/* Action button linked to details */}
        <div className="w-full md:w-auto mt-2 md:mt-0 flex-shrink-0 flex items-center justify-end">
          <Link
            to={`/jobs/${encodeURIComponent(guid)}`}
            state={{ job }}
            className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-health-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-health-600 dark:hover:text-white text-slate-700 font-semibold text-xs rounded-lg transition-colors duration-200 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default JobCard;
