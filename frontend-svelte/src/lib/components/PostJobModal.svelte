<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, PlusCircle, Sparkles, Building2, ShieldCheck, DollarSign } from 'lucide-svelte';
  import { ApiService } from '../api';
  import { currentUser } from '../stores';

  const dispatch = createEventDispatcher();

  let title = '';
  let companyName = $currentUser?.organization || '';
  let category = 'Nursing';
  let workplaceType: 'Remote' | 'On-site' | 'Hybrid' = 'Remote';
  let type = 'Full-time';
  let location = 'Remote (US)';
  let salaryMin: number | undefined = 110000;
  let salaryMax: number | undefined = 145000;
  let description = '';
  let applicationEmailOrUrl = '';
  let contactEmail = $currentUser?.email || '';
  let isSubmitting = false;
  let errorMessage = '';

  const categories = [
    'Nursing',
    'Clinical Research & Life Sciences',
    'Physicians & Surgeons',
    'Telehealth & Digital Health',
    'Health Informatics & Medical Coding',
    'Pharmacy & Pharmacology',
    'Mental & Behavioral Health',
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

<div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
  <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-fade-in">
    <!-- Header -->
    <div class="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 text-white flex items-start justify-between">
      <div>
        <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
          <Sparkles class="w-3.5 h-3.5 text-amber-300" />
          <span>Employer Portal • Automated n8n Broadcast</span>
        </div>
        <h2 class="text-xl font-bold mt-1.5">Post a Healthcare Opportunity</h2>
        <p class="text-xs text-blue-100 mt-0.5">Reach verified nurses, physicians, and digital health specialists.</p>
      </div>
      <button
        type="button"
        on:click={close}
        class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Close modal"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Body -->
    <form on:submit|preventDefault={handleSubmit} class="p-6 overflow-y-auto space-y-4 text-sm text-slate-800">
      {#if errorMessage}
        <div class="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
          {errorMessage}
        </div>
      {/if}

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="post-title" class="block text-xs font-bold text-slate-600 mb-1">Job Title *</label>
          <input
            id="post-title"
            type="text"
            required
            bind:value={title}
            placeholder="e.g. Telehealth Nurse Practitioner (FNP)"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
        <div>
          <label for="post-company" class="block text-xs font-bold text-slate-600 mb-1">Healthcare Organization *</label>
          <input
            id="post-company"
            type="text"
            required
            bind:value={companyName}
            placeholder="e.g. Mercy Virtual Care Clinic"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label for="post-category" class="block text-xs font-bold text-slate-600 mb-1">Specialty *</label>
          <select
            id="post-category"
            bind:value={category}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            {#each categories as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="post-workplace" class="block text-xs font-bold text-slate-600 mb-1">Workplace Mode</label>
          <select
            id="post-workplace"
            bind:value={workplaceType}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
        <div>
          <label for="post-type" class="block text-xs font-bold text-slate-600 mb-1">Employment Type</label>
          <select
            id="post-type"
            bind:value={type}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
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
          <label for="post-location" class="block text-xs font-bold text-slate-600 mb-1">Location</label>
          <input
            id="post-location"
            type="text"
            bind:value={location}
            placeholder="e.g. Remote (US) or Austin, TX"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
        <div>
          <label for="post-min-sal" class="block text-xs font-bold text-slate-600 mb-1">Min Salary ($/yr)</label>
          <input
            id="post-min-sal"
            type="number"
            step="1000"
            bind:value={salaryMin}
            placeholder="110000"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
        <div>
          <label for="post-max-sal" class="block text-xs font-bold text-slate-600 mb-1">Max Salary ($/yr)</label>
          <input
            id="post-max-sal"
            type="number"
            step="1000"
            bind:value={salaryMax}
            placeholder="145000"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
      </div>

      <div>
        <label for="post-apply-url" class="block text-xs font-bold text-slate-600 mb-1">Application URL or Email *</label>
        <input
          id="post-apply-url"
          type="text"
          required
          bind:value={applicationEmailOrUrl}
          placeholder="https://company.com/apply or jobs@hospital.org"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
        />
      </div>

      <div>
        <label for="post-desc" class="block text-xs font-bold text-slate-600 mb-1">Detailed Description *</label>
        <textarea
          id="post-desc"
          rows="4"
          required
          bind:value={description}
          placeholder="Provide clinical responsibilities, licensure requirements, patient caseload, and shift details..."
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-medium"
        ></textarea>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
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
