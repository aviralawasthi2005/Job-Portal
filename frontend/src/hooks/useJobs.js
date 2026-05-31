import { useQuery } from '@tanstack/react-query';
import { JobService } from '../services/api';

/**
 * Hook to retrieve jobs from backend with query caching and dependencies
 */
export const useJobs = (filters = {}) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => JobService.getJobs(filters),
    placeholderData: (previousData) => previousData, // smooth pagination (keeps old data while loading new page)
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale duration
    gcTime: 10 * 60 * 1000, // garbage collection 10 minutes
    retry: 1, // retry once on failure
  });
};

/**
 * Hook to retrieve details of a single job by GUID
 */
export const useJobDetails = (guid) => {
  return useQuery({
    queryKey: ['job', guid],
    queryFn: () => JobService.getJobDetails(guid),
    enabled: !!guid,
    staleTime: 10 * 60 * 1000, // Details can remain fresh longer
    retry: 1,
  });
};
