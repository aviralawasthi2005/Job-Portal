<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Bookmark, FileText, Trash2, Send, ExternalLink, CheckCircle2, Clock, MapPin, Building2, Briefcase, ArrowRight } from 'lucide-svelte';
  import { savedJobs, trackedApplications, toggleSaveJob } from '../stores';
  import type { Job } from '../types';

  export let initialTab: 'saved' | 'applications' = 'saved';
  let activeTab: 'saved' | 'applications' = initialTab;

  $: activeTab = initialTab;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function handleSelectJob(job: Job) {
    dispatch('selectJob', job);
  }

  function handleApplyJob(job: Job) {
    dispatch('applyJob', job);
  }

  function removeSaved(job: Job) {
    toggleSaveJob(job);
  }

  const pipelineStages = [
    { key: 'applied', label: 'Applied', color: 'blue' },
    { key: 'under_review', label: 'Under Review', color: 'indigo' },
    { key: 'shortlisted', label: 'Shortlisted', color: 'teal' },
    { key: 'interview', label: 'Interview', color: 'amber' },
    { key: 'offer', label: 'Offer', color: 'emerald' }
  ];

  function getStageIndex(status: string): number {
    const idx = pipelineStages.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  }
</script>

<div class="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fade-in">
  <div class="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col overflow-hidden">
    <!-- Drawer Header -->
    <div class="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Candidate Hub</span>
        <h2 class="text-xl font-bold text-slate-900 mt-0.5">Your Healthcare Journey</h2>
      </div>

      <button
        type="button"
        on:click={close}
        class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
        aria-label="Close drawer"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Tab Selector -->
    <div class="flex border-b border-slate-200 bg-white px-6">
      <button
        type="button"
        on:click={() => (activeTab = 'saved')}
        class="py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 {activeTab === 'saved' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-900'}"
      >
        <Bookmark class="w-4 h-4" />
        <span>Saved Jobs ({$savedJobs.length})</span>
      </button>

      <button
        type="button"
        on:click={() => (activeTab = 'applications')}
        class="py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 {activeTab === 'applications' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-900'}"
      >
        <FileText class="w-4 h-4" />
        <span>My Applications ({$trackedApplications.length})</span>
      </button>
    </div>

    <!-- Drawer Body -->
    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      {#if activeTab === 'saved'}
        <!-- SAVED JOBS VIEW -->
        {#if $savedJobs.length === 0}
          <div class="py-16 text-center space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Bookmark class="w-7 h-7" />
            </div>
            <h3 class="text-base font-bold text-slate-900">No saved opportunities yet</h3>
            <p class="text-xs text-slate-500 max-w-xs mx-auto">
              Click the bookmark icon on any healthcare role to save it here for quick review and one-click applying.
            </p>
            <button
              type="button"
              on:click={close}
              class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Explore Opportunities
            </button>
          </div>
        {:else}
          <div class="space-y-3">
            {#each $savedJobs as job (job.guid)}
              <div class="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 shadow-2xs transition-all space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="text-xs font-semibold text-slate-500">{job.companyName}</span>
                    <h4 class="text-sm font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                    <div class="flex items-center space-x-3 mt-1 text-xs text-slate-400">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.salaryString || job.type}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    on:click={() => removeSaved(job)}
                    class="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                    title="Remove from saved"
                    aria-label="Remove from saved"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>

                <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    on:click={() => handleSelectJob(job)}
                    class="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    on:click={() => handleApplyJob(job)}
                    class="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <Send class="w-3 h-3" />
                    <span>Apply Now</span>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}

      {:else}
        <!-- TRACKED APPLICATIONS VIEW -->
        {#if $trackedApplications.length === 0}
          <div class="py-16 text-center space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
              <FileText class="w-7 h-7" />
            </div>
            <h3 class="text-base font-bold text-slate-900">No applications submitted yet</h3>
            <p class="text-xs text-slate-500 max-w-xs mx-auto">
              When you submit fast-track applications through PulseCareers, they automatically sync here for live stage tracking.
            </p>
          </div>
        {:else}
          <!-- Candidate Application Metrics -->
          <div class="grid grid-cols-3 gap-2.5 mb-4">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span class="text-lg font-black text-slate-900">{$trackedApplications.length}</span>
              <span class="text-[10px] font-bold text-slate-500 block uppercase">Submitted</span>
            </div>
            <div class="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-center">
              <span class="text-lg font-black text-blue-700">
                {$trackedApplications.filter((a) => a.status !== 'applied').length}
              </span>
              <span class="text-[10px] font-bold text-blue-700 block uppercase">In Review</span>
            </div>
            <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-center">
              <span class="text-lg font-black text-emerald-700">~24h</span>
              <span class="text-[10px] font-bold text-emerald-700 block uppercase">Avg Response</span>
            </div>
          </div>

          <!-- Application Cards with Pipeline Stepper -->
          <div class="space-y-4">
            {#each $trackedApplications as app (app.id)}
              <div class="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-3.5">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="text-xs font-semibold text-slate-500">{app.companyName}</span>
                    <h4 class="text-sm font-bold text-slate-900">{app.jobTitle}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                    {app.status.replace('_', ' ')}
                  </span>
                </div>

                <!-- Visual 5-Stage Pipeline -->
                <div class="pt-2">
                  <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                    {#each pipelineStages as stage, i}
                      <span class="{getStageIndex(app.status) >= i ? 'text-blue-700 font-extrabold' : ''}">
                        {stage.label}
                      </span>
                    {/each}
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
                    {#each pipelineStages as _, i}
                      <div class="flex-1 border-r border-white/60 transition-all {getStageIndex(app.status) >= i ? 'bg-blue-600' : 'bg-slate-200'}"></div>
                    {/each}
                  </div>
                </div>

                <div class="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Licensure: {app.clinicalLicense || 'On file'}</span>
                  <span class="text-teal-700 font-medium flex items-center space-x-1">
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    <span>n8n Sync Verified</span>
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>
