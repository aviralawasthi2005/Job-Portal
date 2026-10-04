<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { MapPin, DollarSign, Clock, Building2, Bookmark, CheckCircle2, Send, Sparkles, ShieldCheck } from 'lucide-svelte';
  import { savedJobs, trackedApplications, toggleSaveJob } from '../stores';
  import type { Job } from '../types';

  export let job: Job;
  const dispatch = createEventDispatcher();

  $: isSaved = $savedJobs.some((j) => j.guid === job.guid);
  $: hasApplied = $trackedApplications.some((a) => a.jobGuid === job.guid);

  function getInitials(name: string): string {
    return (name || 'HC')
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  function formatTime(iso: string | number): string {
    try {
      const timestamp = typeof iso === 'number' ? iso : new Date(iso).getTime();
      const diffDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  }

  function handleBookmark(e: MouseEvent) {
    e.stopPropagation();
    const nowSaved = toggleSaveJob(job);
    dispatch('saveToggle', { job, saved: nowSaved });
  }
</script>

<div class="group relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-blue-400 transition-all duration-200 flex flex-col justify-between">
  <!-- Card Header -->
  <div>
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start space-x-3.5">
        <!-- Logo or Initials -->
        <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-blue-200 transition-colors">
          {#if job.companyLogo}
            <img src={job.companyLogo} alt={job.companyName} class="w-full h-full object-contain p-1.5" />
          {:else}
            <span class="text-xs font-black text-blue-700 bg-blue-50 w-full h-full flex items-center justify-center">
              {getInitials(job.companyName)}
            </span>
          {/if}
        </div>

        <div>
          <div class="flex items-center space-x-1.5">
            <span class="text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors">
              {job.companyName}
            </span>
            <ShieldCheck class="w-3.5 h-3.5 text-blue-600" title="Verified Employer" />
          </div>

          <button
            type="button"
            on:click={() => dispatch('select', job)}
            class="text-left font-bold text-slate-900 group-hover:text-blue-700 transition-colors cursor-pointer text-base sm:text-lg line-clamp-1 mt-0.5 focus:outline-none"
          >
            {job.title}
          </button>
        </div>
      </div>

      <!-- Bookmark / Save Button -->
      <button
        type="button"
        on:click={handleBookmark}
        class="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
        title={isSaved ? 'Remove from saved' : 'Save opportunity'}
        aria-label="Save Job"
      >
        <Bookmark class="w-5 h-5 {isSaved ? 'fill-blue-600 text-blue-600' : ''}" />
      </button>
    </div>

    <!-- Metadata Row -->
    <div class="mt-3.5 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500 font-medium">
      <div class="flex items-center space-x-1">
        <MapPin class="w-3.5 h-3.5 text-slate-400" />
        <span>{job.location || 'Remote'}</span>
      </div>
      <div class="flex items-center space-x-1">
        <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
        <span class="text-slate-700 font-semibold">{job.type}</span>
      </div>
      <div class="flex items-center space-x-1 text-slate-400">
        <Clock class="w-3.5 h-3.5" />
        <span>{formatTime(job.publishedAt)}</span>
      </div>
      {#if job.featured}
        <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Sparkles class="w-3 h-3 text-amber-500" />
          <span>Priority Opening</span>
        </span>
      {/if}
    </div>

    <!-- Compensation Badge -->
    {#if job.salaryString}
      <div class="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/90">
        <DollarSign class="w-3.5 h-3.5 text-emerald-600" />
        <span>{job.salaryString}</span>
      </div>
    {/if}

    <!-- Description Excerpt -->
    <p class="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
      {job.description ? job.description.replace(/<[^>]*>?/gm, ' ') : ''}
    </p>

    <!-- Category & Credential Tags -->
    <div class="mt-4 flex flex-wrap gap-1.5">
      <span class="text-[11px] font-semibold px-2.5 py-0.8 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
        {job.category}
      </span>
      <span class="text-[11px] font-semibold px-2.5 py-0.8 rounded-md {job.workplaceType === 'Remote' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-600'}">
        {job.workplaceType}
      </span>
      {#if job.credentials && job.credentials.length > 0}
        {#each job.credentials.slice(0, 2) as cred}
          <span class="text-[11px] font-bold px-2 py-0.8 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            {cred}
          </span>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Footer Actions -->
  <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
    <button
      type="button"
      on:click={() => dispatch('select', job)}
      class="text-xs font-bold text-slate-600 hover:text-blue-700 transition-colors flex items-center space-x-1 cursor-pointer"
    >
      <span>Full Details & Benefits</span>
    </button>

    <div class="flex items-center space-x-2">
      {#if hasApplied}
        <span class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
          <span>Applied</span>
        </span>
      {:else}
        <button
          type="button"
          on:click={() => dispatch('apply', job)}
          class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <Send class="w-3 h-3" />
          <span>Apply Now</span>
        </button>
      {/if}
    </div>
  </div>
</div>
