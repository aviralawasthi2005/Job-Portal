<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Search, Sparkles, Building2, MapPin, ShieldCheck, Zap } from 'lucide-svelte';

  export let searchTerm: string = '';
  export let selectedCategory: string = 'All';

  const dispatch = createEventDispatcher();

  const specialties = [
    'All',
    'Nursing',
    'Telehealth & Digital Health',
    'Physicians & Surgeons',
    'Health Informatics & IT',
    'Pharmacy',
    'Mental & Behavioral Health'
  ];

  function handleSearchSubmit() {
    dispatch('search', { term: searchTerm, category: selectedCategory });
  }

  function selectChip(cat: string) {
    selectedCategory = cat;
    dispatch('categoryChange', cat);
  }
</script>

<div class="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-teal-50/30 to-slate-50 pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-200/60">
  <!-- Subtle background glow -->
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-tr from-brand-300/20 via-clinical-400/20 to-transparent blur-3xl -z-10 pointer-events-none"></div>

  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <!-- Subtitle pill -->
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-4 border border-brand-200/80 shadow-sm">
      <Sparkles class="w-3.5 h-3.5 text-brand-600" />
      <span>Empowering Modern Healthcare Careers with n8n Automation</span>
    </div>

    <!-- Main Title -->
    <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
      Find Your Next Mission in <br class="hidden sm:inline" />
      <span class="bg-gradient-to-r from-brand-600 via-clinical-600 to-emerald-500 bg-clip-text text-transparent">
        Healthcare & Telehealth
      </span>
    </h1>

    <p class="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
      Curated clinical roles, remote nursing, physician leadership, and health-tech opportunities powered by AdonisJS and automated by n8n.
    </p>

    <!-- Search Input Box -->
    <div class="mt-8 max-w-3xl mx-auto">
      <form on:submit|preventDefault={handleSearchSubmit} class="p-2 rounded-2xl bg-white shadow-xl shadow-slate-200/70 border border-slate-200/90 flex flex-col sm:flex-row gap-2">
        <div class="flex-1 flex items-center px-3 py-2">
          <Search class="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            bind:value={searchTerm}
            placeholder="Search job title, clinical specialty, or keyword (e.g. Telehealth Nurse)..."
            class="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 focus:outline-none text-sm sm:text-base"
          />
        </div>

        <button
          type="submit"
          class="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-clinical-600 hover:from-brand-500 hover:to-clinical-500 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Find Jobs</span>
        </button>
      </form>
    </div>

    <!-- Quick Filter Chips -->
    <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
      <span class="text-xs font-semibold text-slate-400 mr-1">Trending:</span>
      {#each specialties as spec}
        <button
          type="button"
          on:click={() => selectChip(spec)}
          class="px-3 py-1 rounded-full text-xs font-medium transition-all {selectedCategory === spec ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}"
        >
          {spec}
        </button>
      {/each}
    </div>

    <!-- Highlights ribbon -->
    <div class="mt-10 pt-6 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
      <div class="flex items-center space-x-2.5">
        <ShieldCheck class="w-5 h-5 text-brand-600 shrink-0" />
        <span class="text-xs font-semibold text-slate-700">Verified Healthcare Employers</span>
      </div>
      <div class="flex items-center space-x-2.5">
        <Zap class="w-5 h-5 text-clinical-600 shrink-0" />
        <span class="text-xs font-semibold text-slate-700">Automated n8n ATS Sync</span>
      </div>
      <div class="flex items-center space-x-2.5">
        <Building2 class="w-5 h-5 text-emerald-600 shrink-0" />
        <span class="text-xs font-semibold text-slate-700">Direct Recruiter Ingestion</span>
      </div>
      <div class="flex items-center space-x-2.5">
        <MapPin class="w-5 h-5 text-teal-600 shrink-0" />
        <span class="text-xs font-semibold text-slate-700">Remote & Hybrid Options</span>
      </div>
    </div>
  </div>
</div>
