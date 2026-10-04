<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Building2, MapPin, DollarSign, Calendar, ShieldCheck, CheckCircle2, Send, ExternalLink } from 'lucide-svelte';
  import type { Job } from '../types';

  export let job: Job | null = null;
  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function handleApply() {
    if (job) {
      dispatch('apply', job);
    }
  }
</script>

{#if job}
  <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="p-6 sm:p-8 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white border-b border-slate-200 flex items-start justify-between">
        <div class="flex items-start space-x-4">
          <div class="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0">
            {#if job.companyLogo}
              <img src={job.companyLogo} alt={job.companyName} class="w-full h-full object-contain p-1.5" />
            {:else}
              <span class="text-sm font-black text-brand-700">{job.companyName.slice(0, 2).toUpperCase()}</span>
            {/if}
          </div>

          <div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-bold text-slate-700">{job.companyName}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800">
                {job.workplaceType}
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 mt-1">{job.title}</h2>
            <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span class="flex items-center"><MapPin class="w-3.5 h-3.5 mr-1 text-slate-400" />{job.location}</span>
              <span class="flex items-center"><Calendar class="w-3.5 h-3.5 mr-1 text-slate-400" />Posted {new Date(job.publishedAt).toLocaleDateString()}</span>
              {#if job.salaryString}
                <span class="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">{job.salaryString}</span>
              {/if}
            </div>
          </div>
        </div>

        <button
          type="button"
          on:click={close}
          class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
        <!-- Badges summary -->
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs">
            Specialty: {job.category}
          </span>
          <span class="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs">
            Contract: {job.type}
          </span>
          <span class="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs">
            Source: {job.source === 'himalayas' ? 'Himalayas Verified Remote' : 'Direct Employer Posting'}
          </span>
        </div>

        <!-- Description -->
        <div>
          <h3 class="text-base font-bold text-slate-900 mb-2">Role Overview</h3>
          <div class="prose max-w-none text-slate-600">
            {@html job.description}
          </div>
        </div>

        <!-- Requirements -->
        {#if job.requirements && job.requirements.length > 0}
          <div>
            <h3 class="text-base font-bold text-slate-900 mb-2.5">Key Qualifications & Licensure</h3>
            <ul class="space-y-2">
              {#each job.requirements as req}
                <li class="flex items-start space-x-2">
                  <CheckCircle2 class="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Benefits -->
        {#if job.benefits && job.benefits.length > 0}
          <div>
            <h3 class="text-base font-bold text-slate-900 mb-2.5">Compensation & Benefits</h3>
            <ul class="space-y-2">
              {#each job.benefits as ben}
                <li class="flex items-start space-x-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{ben}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <!-- Modal Footer -->
      <div class="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div class="text-xs text-slate-500">
          Auto-dispatches to n8n candidate tracking pipeline
        </div>
        <div class="flex items-center space-x-3">
          <button
            type="button"
            on:click={close}
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            on:click={handleApply}
            class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-clinical-600 hover:from-brand-500 hover:to-clinical-500 shadow-md shadow-brand-500/20 cursor-pointer"
          >
            <Send class="w-3.5 h-3.5" />
            <span>Apply For Position</span>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
