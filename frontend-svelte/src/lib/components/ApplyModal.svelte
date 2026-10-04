<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Send, Award, FileText, CheckCircle } from 'lucide-svelte';
  import { ApiService } from '../api';
  import type { Job, CandidateApplication } from '../types';

  export let job: Job;
  const dispatch = createEventDispatcher();

  let candidateName = '';
  let candidateEmail = '';
  let candidatePhone = '';
  let clinicalLicenseNumber = '';
  let yearsOfExperience: number = 3;
  let resumeUrl = '';
  let coverLetter = '';
  let isSubmitting = false;
  let errorMessage = '';

  function close() {
    dispatch('close');
  }

  async function handleSubmit() {
    if (!candidateName.trim() || !candidateEmail.trim()) {
      errorMessage = 'Please provide both your name and email address.';
      return;
    }

    isSubmitting = true;
    errorMessage = '';

    const payload: CandidateApplication = {
      jobGuid: job.guid,
      candidateName,
      candidateEmail,
      candidatePhone,
      clinicalLicenseNumber,
      yearsOfExperience,
      resumeUrl,
      coverLetter
    };

    try {
      const res = await ApiService.submitApplication(payload);
      dispatch('success', res.message || 'Application submitted successfully! n8n automation triggered.');
      close();
    } catch (e: any) {
      errorMessage = e.message || 'Could not submit application.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
    <!-- Header -->
    <div class="p-6 bg-gradient-to-r from-brand-600 to-clinical-600 text-white flex items-start justify-between">
      <div>
        <span class="text-xs uppercase tracking-wider text-brand-100 font-bold">Fast-Track Application</span>
        <h2 class="text-xl font-bold mt-0.5">{job.title}</h2>
        <p class="text-xs text-brand-100 mt-1">{job.companyName} • {job.location}</p>
      </div>
      <button
        type="button"
        on:click={close}
        class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-4 text-sm text-slate-800">
      {#if errorMessage}
        <div class="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
          {errorMessage}
        </div>
      {/if}

      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Full Legal Name *</label>
        <input
          type="text"
          required
          bind:value={candidateName}
          placeholder="e.g. Dr. Jane Doe, MD or John Smith, BSN, RN"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Email Address *</label>
          <input
            type="email"
            required
            bind:value={candidateEmail}
            placeholder="jane.doe@hospital.org"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
          <input
            type="tel"
            bind:value={candidatePhone}
            placeholder="+1 (555) 000-0000"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Clinical License #</label>
          <input
            type="text"
            bind:value={clinicalLicenseNumber}
            placeholder="e.g. RN-982142"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Years of Healthcare Exp.</label>
          <input
            type="number"
            min="0"
            max="40"
            bind:value={yearsOfExperience}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Resume / Portfolio URL</label>
        <input
          type="url"
          bind:value={resumeUrl}
          placeholder="https://linkedin.com/in/username or Google Drive link"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Brief Introduction</label>
        <textarea
          rows="3"
          bind:value={coverLetter}
          placeholder="Summarize your clinical background, specialty, and availability..."
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
        ></textarea>
      </div>

      <div class="pt-2 flex items-center justify-end space-x-3">
        <button
          type="button"
          on:click={close}
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-clinical-600 hover:from-brand-500 hover:to-clinical-500 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {#if isSubmitting}
            <span>Processing...</span>
          {:else}
            <Send class="w-3.5 h-3.5" />
            <span>Submit Application</span>
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
