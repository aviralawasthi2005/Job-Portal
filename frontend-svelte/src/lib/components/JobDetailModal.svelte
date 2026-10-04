<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Building2, MapPin, DollarSign, Calendar, ShieldCheck, CheckCircle2, Send, Bookmark, Share2, Sparkles, Clock, Check } from 'lucide-svelte';
  import { savedJobs, trackedApplications, toggleSaveJob } from '../stores';
  import type { Job } from '../types';

  export let job: Job | null = null;
  const dispatch = createEventDispatcher();

  let copied = false;

  $: isSaved = job ? $savedJobs.some((j) => j.guid === job!.guid) : false;
  $: hasApplied = job ? $trackedApplications.some((a) => a.jobGuid === job!.guid) : false;

  function close() {
    dispatch('close');
  }

  function handleApply() {
    if (job) {
      dispatch('apply', job);
    }
  }

  function handleSave() {
    if (job) {
      const nowSaved = toggleSaveJob(job);
      dispatch('saveToggle', { job, saved: nowSaved });
    }
  }

  function handleShare() {
    if (!job) return;
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    copied = true;
    setTimeout(() => { copied = false; }, 3000);
  }
</script>

{#if job}
  <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
    <div class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-fade-in">
      
      <!-- Top Banner Header -->
      <div class="p-6 sm:p-8 bg-gradient-to-r from-slate-50 via-blue-50/40 to-white border-b border-slate-200/90 flex items-start justify-between">
        <div class="flex items-start space-x-4 sm:space-x-5">
          <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {#if job.companyLogo}
              <img src={job.companyLogo} alt={job.companyName} class="w-full h-full object-contain p-2" />
            {:else}
              <span class="text-base font-black text-blue-700">{job.companyName.slice(0, 2).toUpperCase()}</span>
            {/if}
          </div>

          <div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-bold text-slate-700">{job.companyName}</span>
              <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                <ShieldCheck class="w-3 h-3 text-blue-600" />
                <span>Verified Employer</span>
              </span>
            </div>

            <h2 class="text-xl sm:text-2xl font-black text-slate-900 mt-1">{job.title}</h2>

            <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
              <span class="flex items-center"><MapPin class="w-3.5 h-3.5 mr-1 text-slate-400" />{job.location || 'Remote'}</span>
              <span class="flex items-center"><Calendar class="w-3.5 h-3.5 mr-1 text-slate-400" />Posted {new Date(job.publishedAt).toLocaleDateString()}</span>
              {#if job.salaryString}
                <span class="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md">
                  {job.salaryString}
                </span>
              {/if}
            </div>
          </div>
        </div>

        <button
          type="button"
          on:click={close}
          class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Main Layout: Content + Sticky Sidebar -->
      <div class="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Detailed Job Specs -->
        <div class="lg:col-span-2 space-y-7 text-slate-700 text-sm leading-relaxed">
          <!-- Badges -->
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs">
              Specialty: {job.category}
            </span>
            <span class="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold text-xs">
              Workplace: {job.workplaceType}
            </span>
            <span class="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs">
              Schedule: {job.type}
            </span>
            {#if job.credentials && job.credentials.length > 0}
              {#each job.credentials as cred}
                <span class="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                  License: {cred}
                </span>
              {/each}
            {/if}
          </div>

          <!-- Role Overview -->
          <div>
            <h3 class="text-base font-bold text-slate-900 mb-2">Role Overview</h3>
            <div class="prose max-w-none text-slate-600 text-sm leading-relaxed space-y-3">
              {@html job.description}
            </div>
          </div>

          <!-- Key Qualifications & Licensure -->
          {#if job.requirements && job.requirements.length > 0}
            <div class="pt-4 border-t border-slate-100">
              <h3 class="text-base font-bold text-slate-900 mb-3">Qualifications & Clinical Licensure</h3>
              <ul class="space-y-2.5">
                {#each job.requirements as req}
                  <li class="flex items-start space-x-2.5">
                    <CheckCircle2 class="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          <!-- Compensation & Benefits -->
          {#if job.benefits && job.benefits.length > 0}
            <div class="pt-4 border-t border-slate-100">
              <h3 class="text-base font-bold text-slate-900 mb-3">Compensation, Perks & Benefits</h3>
              <ul class="space-y-2.5">
                {#each job.benefits as ben}
                  <li class="flex items-start space-x-2.5">
                    <CheckCircle2 class="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ben}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>

        <!-- Right: Action Box (LinkedIn / Levels Style) -->
        <div class="lg:col-span-1">
          <div class="sticky top-0 p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Application Action</span>
              <h4 class="text-base font-bold text-slate-900 mt-1">Ready to apply?</h4>
              <p class="text-xs text-slate-500 mt-0.5">Fast-track submission directly processed by employer hiring team.</p>
            </div>

            <!-- Primary Apply CTA -->
            {#if hasApplied}
              <div class="w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold text-xs flex items-center justify-center space-x-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                <span>You've Applied to this Role</span>
              </div>
            {:else}
              <button
                type="button"
                on:click={handleApply}
                class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send class="w-4 h-4" />
                <span>Apply for Position</span>
              </button>
            {/if}

            <!-- Secondary Actions -->
            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                on:click={handleSave}
                class="py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors {isSaved ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}"
              >
                <Bookmark class="w-3.5 h-3.5 {isSaved ? 'fill-blue-600' : ''}" />
                <span>{isSaved ? 'Saved' : 'Save Job'}</span>
              </button>

              <button
                type="button"
                on:click={handleShare}
                class="py-2 px-3 rounded-xl border bg-white border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
              >
                {#if copied}
                  <Check class="w-3.5 h-3.5 text-emerald-600" />
                  <span class="text-emerald-700">Copied!</span>
                {:else}
                  <Share2 class="w-3.5 h-3.5 text-slate-500" />
                  <span>Share</span>
                {/if}
              </button>
            </div>

            <!-- Trust proof badges in box -->
            <div class="pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-500">
              <div class="flex items-center space-x-2">
                <ShieldCheck class="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Clinical licensure verification</span>
              </div>
              <div class="flex items-center space-x-2">
                <Clock class="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Replies in ~24h with n8n automation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Bar -->
      <div class="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Job Reference: {job.guid.slice(0, 16)}...</span>
        <button
          type="button"
          on:click={close}
          class="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          Close Preview
        </button>
      </div>
    </div>
  </div>
{/if}
