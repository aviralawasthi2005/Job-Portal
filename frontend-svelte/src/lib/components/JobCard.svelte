<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { MapPin, DollarSign, Clock, Building2, ExternalLink, Sparkles, Send } from 'lucide-svelte';
  import type { Job } from '../types';

  export let job: Job;
  const dispatch = createEventDispatcher();

  function getInitials(name: string): string {
    return (name || 'HC')
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  function formatTime(iso: string): string {
    try {
      const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  }
</script>

<div class="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-brand-300 transition-all duration-300 flex flex-col justify-between">
  <!-- Card Header -->
  <div>
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start space-x-3.5">
        <!-- Logo or Initials -->
        <div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-brand-200 transition-colors">
          {#if job.companyLogo}
            <img src={job.companyLogo} alt={job.companyName} class="w-full h-full object-contain p-1" />
          {:else}
            <span class="text-xs font-black text-brand-700 bg-brand-50 w-full h-full flex items-center justify-center">
              {getInitials(job.companyName)}
            </span>
          {/if}
        </div>

        <div>
          <span class="text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors flex items-center">
            {job.companyName}
          </span>
          <h2
            on:click={() => dispatch('select', job)}
            class="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer line-clamp-1 mt-0.5"
          >
            {job.title}
          </h2>
        </div>
      </div>

      <!-- Badges -->
      <div class="flex items-center space-x-1.5 shrink-0">
        {#if job.featured}
          <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles class="w-3 h-3 text-amber-500" />
            <span>Featured</span>
          </span>
        {/if}
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold {job.workplaceType === 'Remote' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'}">
          {job.workplaceType}
        </span>
      </div>
    </div>

    <!-- Metadata Row -->
    <div class="mt-3.5 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500">
      <div class="flex items-center space-x-1">
        <MapPin class="w-3.5 h-3.5 text-slate-400" />
        <span>{job.location || 'Remote'}</span>
      </div>
      <div class="flex items-center space-x-1">
        <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
        <span class="font-medium text-slate-600">{job.type}</span>
      </div>
      <div class="flex items-center space-x-1 text-slate-400">
        <Clock class="w-3.5 h-3.5" />
        <span>{formatTime(job.publishedAt)}</span>
      </div>
    </div>

    <!-- Salary Pill -->
    {#if job.salaryString}
      <div class="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80">
        <DollarSign class="w-3.5 h-3.5 text-emerald-600" />
        <span>{job.salaryString}</span>
      </div>
    {/if}

    <!-- Excerpt -->
    <p class="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
      {job.description ? job.description.replace(/<[^>]*>?/gm, '') : ''}
    </p>

    <!-- Category Tag -->
    <div class="mt-3.5 flex flex-wrap gap-1.5">
      <span class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
        {job.category}
      </span>
      {#if job.skills && job.skills.length > 0}
        {#each job.skills.slice(0, 2) as sk}
          <span class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-100">
            {sk}
          </span>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Actions -->
  <div class="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
    <button
      type="button"
      on:click={() => dispatch('select', job)}
      class="text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors flex items-center space-x-1 cursor-pointer"
    >
      <span>Full Details</span>
    </button>

    <button
      type="button"
      on:click={() => dispatch('apply', job)}
      class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all cursor-pointer"
    >
      <Send class="w-3 h-3" />
      <span>Apply Now</span>
    </button>
  </div>
</div>
