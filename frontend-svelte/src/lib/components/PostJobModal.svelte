<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, PlusCircle, CheckCircle, Sparkles, Building2 } from 'lucide-svelte';
  import { ApiService } from '../api';

  const dispatch = createEventDispatcher();

  let title = '';
  let companyName = '';
  let category = 'Nursing';
  let workplaceType: 'Remote' | 'On-site' | 'Hybrid' = 'Remote';
  let type = 'Full-time';
  let location = 'Remote (US)';
  let salaryMin: number | undefined = 110000;
  let salaryMax: number | undefined = 145000;
  let description = '';
  let applicationEmailOrUrl = '';
  let contactEmail = '';
  let isSubmitting = false;
  let errorMessage = '';

  const categories = [
    'Nursing',
    'Telehealth & Digital Health',
    'Physicians & Surgeons',
    'Health Informatics & IT',
    'Pharmacy',
    'Mental & Behavioral Health',
    'Clinical Research',
    'Allied Health'
  ];

  function close() {
    dispatch('close');
  }

  async function handleSubmit() {
    if (!title.trim() || !companyName.trim() || !description.trim() || !applicationEmailOrUrl.trim()) {
      errorMessage = 'Please complete all required fields.';
      return;
    }

    isSubmitting = true;
    errorMessage = '';

    const payload = {
      title,
      companyName,
      category,
      workplaceType,
      type,
      location,
      salaryMin,
      salaryMax,
      salaryCurrency: 'USD',
      description,
      applicationEmailOrUrl,
      contactEmail: contactEmail || applicationEmailOrUrl,
      requirements: ['Valid clinical credentials or healthcare background', 'Collaborative mindset'],
      benefits: ['Competitive compensation', 'Comprehensive healthcare benefits', 'Flexible scheduling']
    };

    try {
      const res = await ApiService.postJob(payload);
      dispatch('success', res.message || 'Job published! n8n automated broadcast has been triggered.');
      close();
    } catch (e: any) {
      errorMessage = e.message || 'Failed to post job.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
    <!-- Header -->
    <div class="p-6 bg-gradient-to-r from-brand-600 via-clinical-600 to-emerald-600 text-white flex items-start justify-between">
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-xs uppercase tracking-wider text-brand-100 font-bold">Employer Portal</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white flex items-center space-x-1">
            <Sparkles class="w-3 h-3 text-amber-300" />
            <span>n8n Auto-Broadcast</span>
          </span>
        </div>
        <h2 class="text-xl font-bold mt-1">Post a Healthcare Opportunity</h2>
        <p class="text-xs text-brand-100 mt-0.5">Reach thousands of active nurses, doctors, and health-tech professionals.</p>
      </div>
      <button
        type="button"
        on:click={close}
        class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Body -->
    <form on:submit|preventDefault={handleSubmit} class="p-6 overflow-y-auto space-y-4 text-sm text-slate-800">
      {#if errorMessage}
        <div class="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
          {errorMessage}
        </div>
      {/if}

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Job Title *</label>
          <input
            type="text"
            required
            bind:value={title}
            placeholder="e.g. Telehealth Nurse Practitioner (FNP)"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Healthcare Organization *</label>
          <input
            type="text"
            required
            bind:value={companyName}
            placeholder="e.g. Mercy Virtual Care Clinic"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Specialty *</label>
          <select
            bind:value={category}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {#each categories as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Workplace Mode</label>
          <select
            bind:value={workplaceType}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Employment Type</label>
          <select
            bind:value={type}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Per Diem">Per Diem</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Location</label>
          <input
            type="text"
            bind:value={location}
            placeholder="e.g. Remote (US) or Austin, TX"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Min Salary ($/yr)</label>
          <input
            type="number"
            step="1000"
            bind:value={salaryMin}
            placeholder="90000"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Max Salary ($/yr)</label>
          <input
            type="number"
            step="1000"
            bind:value={salaryMax}
            placeholder="130000"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Application URL or Email *</label>
        <input
          type="text"
          required
          bind:value={applicationEmailOrUrl}
          placeholder="https://company.com/apply or jobs@hospital.org"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Detailed Description *</label>
        <textarea
          rows="4"
          required
          bind:value={description}
          placeholder="Provide responsibilities, clinical team structure, patient caseload, and shift details..."
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
            <span>Publishing...</span>
          {:else}
            <PlusCircle class="w-3.5 h-3.5" />
            <span>Publish & Trigger n8n</span>
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
