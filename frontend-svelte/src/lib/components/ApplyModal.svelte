<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Send, Award, FileText, CheckCircle, ShieldCheck, Sparkles } from 'lucide-svelte';
  import { ApiService } from '../api';
  import { addTrackedApplication } from '../stores';
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
      errorMessage = 'Please provide both your full legal name and email address.';
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

      // Record in candidate local application tracker
      addTrackedApplication({
        jobGuid: job.guid,
        jobTitle: job.title,
        companyName: job.companyName,
        location: job.location || 'Remote',
        clinicalLicense: clinicalLicenseNumber || undefined
      });

      dispatch('success', res.message || 'Application submitted successfully! Automated n8n candidate intake triggered.');
      close();
    } catch (e: any) {
      errorMessage = e.message || 'Could not submit application.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
  <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
    <!-- Header -->
    <div class="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 text-white flex items-start justify-between">
      <div>
        <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
          <Sparkles class="w-3 h-3 text-amber-300" />
          <span>Fast-Track Candidate Application</span>
        </div>
        <h2 class="text-xl font-bold mt-1.5">{job.title}</h2>
        <p class="text-xs text-blue-100 mt-0.5">{job.companyName} • {job.location || 'Remote'}</p>
      </div>
      <button
        type="button"
        on:click={close}
        class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Close dialog"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Application Form -->
    <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-4 text-sm text-slate-800">
      {#if errorMessage}
        <div class="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
          {errorMessage}
        </div>
      {/if}

      <!-- Legal Name -->
      <div>
        <label for="candidate-name" class="block text-xs font-bold text-slate-600 mb-1">
          Full Legal Name *
        </label>
        <input
          id="candidate-name"
          type="text"
          required
          bind:value={candidateName}
          placeholder="e.g. Dr. Jane Doe, MD or John Smith, BSN, RN"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
        />
      </div>

      <!-- Email & Phone -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="candidate-email" class="block text-xs font-bold text-slate-600 mb-1">
            Email Address *
          </label>
          <input
            id="candidate-email"
            type="email"
            required
            bind:value={candidateEmail}
            placeholder="jane.doe@hospital.org"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
        <div>
          <label for="candidate-phone" class="block text-xs font-bold text-slate-600 mb-1">
            Phone Number
          </label>
          <input
            id="candidate-phone"
            type="tel"
            bind:value={candidatePhone}
            placeholder="+1 (555) 000-0000"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
      </div>

      <!-- Licensure & Experience -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="candidate-license" class="block text-xs font-bold text-slate-600 mb-1">
            Clinical License # (if applicable)
          </label>
          <input
            id="candidate-license"
            type="text"
            bind:value={clinicalLicenseNumber}
            placeholder="e.g. RN-CA-994821 or MD-1204"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
        <div>
          <label for="candidate-experience" class="block text-xs font-bold text-slate-600 mb-1">
            Years of Healthcare Exp. ({yearsOfExperience} yrs)
          </label>
          <input
            id="candidate-experience"
            type="range"
            min="0"
            max="30"
            bind:value={yearsOfExperience}
            class="w-full accent-blue-600 mt-2 cursor-pointer"
          />
        </div>
      </div>

      <!-- Resume / Portfolio -->
      <div>
        <label for="candidate-resume" class="block text-xs font-bold text-slate-600 mb-1">
          Resume / LinkedIn URL
        </label>
        <input
          id="candidate-resume"
          type="url"
          bind:value={resumeUrl}
          placeholder="https://linkedin.com/in/username or Google Drive document link"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
        />
      </div>

      <!-- Introduction note -->
      <div>
        <label for="candidate-letter" class="block text-xs font-bold text-slate-600 mb-1">
          Clinical Background & Availability Note
        </label>
        <textarea
          id="candidate-letter"
          rows="3"
          bind:value={coverLetter}
          placeholder="Highlight clinical certifications, EHR familiarity (Epic/Cerner), and shift availability..."
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-medium"
        ></textarea>
      </div>

      <!-- Action buttons -->
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div class="flex items-center space-x-1.5 text-[11px] text-slate-400">
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted HIPAA-ready intake</span>
        </div>

        <div class="flex items-center space-x-2.5">
          <button
            type="button"
            on:click={close}
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {#if isSubmitting}
              <span>Processing...</span>
            {:else}
              <Send class="w-3.5 h-3.5" />
              <span>Submit Application</span>
            {/if}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
