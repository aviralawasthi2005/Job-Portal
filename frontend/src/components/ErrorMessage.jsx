import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="p-6 max-w-md mx-auto bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 rounded-xl flex flex-col items-center text-center gap-3.5 shadow-sm">
      <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-200">
          Search request issue
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {message || 'Unable to communicate with the remote server. Please verify your query parameters or try again.'}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-semibold text-xs rounded-lg transition-colors duration-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Search</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
