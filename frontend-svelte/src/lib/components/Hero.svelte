<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Search, MapPin, Sparkles, ShieldCheck, Zap, Stethoscope, ArrowRight } from 'lucide-svelte';

  export let searchTerm: string = '';
  export let locationFilter: string = '';
  export let selectedCategory: string = 'All';

  const dispatch = createEventDispatcher();

  const quickFilters = [
    { label: 'All Jobs', category: 'All' },
    { label: 'Nursing', category: 'Nursing' },
    { label: 'Clinical Research', category: 'Clinical Research & Life Sciences' },
    { label: 'Physicians & Surgeons', category: 'Physicians & Surgeons' },
    { label: 'Telehealth', category: 'Telehealth & Digital Health' },
    { label: 'Health Informatics & AI', category: 'Health Informatics & Medical Coding' },
    { label: 'Pharmacy', category: 'Pharmacy & Pharmacology' },
    { label: 'Mental Health', category: 'Mental & Behavioral Health' }
  ];

  function handleSubmit() {
    dispatch('search', { term: searchTerm, location: locationFilter, category: selectedCategory });
  }

  function selectChip(cat: string) {
    selectedCategory = cat;
    dispatch('categoryChange', cat);
  }
</script>

<div class="relative overflow-hidden bg-gradient-to-b from-slate-100/70 via-blue-50/30 to-white pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-slate-200/70">
  <!-- Subtle ambient glow -->
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-tr from-blue-300/15 via-teal-300/15 to-indigo-300/10 blur-3xl -z-10 pointer-events-none"></div>

  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <!-- Value pill -->
    <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white text-slate-700 text-xs font-semibold mb-5 border border-slate-200/90 shadow-xs">
      <span class="flex h-2 w-2 relative">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
      </span>
      <span class="text-blue-700 font-bold">100% Curated Healthcare Marketplace</span>
      <span class="text-slate-300">•</span>
      <span class="text-slate-600">Zero non-clinical noise</span>
    </div>

    <!-- Main Title -->
    <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
      Find Your Next <br class="hidden sm:inline" />
      <span class="bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-600 bg-clip-text text-transparent">
        Healthcare & Clinical Career
      </span>
    </h1>

    <p class="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
      Discover verified opportunities across nursing, telehealth, oncology trials, medical informatics, pharmacy, and health-tech innovation.
    </p>

    <!-- Dual Input Search Box (LinkedIn / Indeed Style) -->
    <div class="mt-8 max-w-4xl mx-auto">
      <form
        on:submit|preventDefault={handleSubmit}
        class="p-2 sm:p-2.5 rounded-2xl bg-white shadow-lg shadow-slate-200/60 border border-slate-200 flex flex-col md:flex-row gap-2 transition-all focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100"
      >
        <!-- Keywords Input -->
        <div class="flex-1 flex items-center px-3.5 py-2">
          <Search class="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            bind:value={searchTerm}
            placeholder="Job title, clinical skill, or keyword (e.g. FNP, Clinical Trial, Epic)..."
            class="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 focus:outline-none text-sm sm:text-base font-medium"
          />
        </div>

        <!-- Divider line -->
        <div class="hidden md:block w-px bg-slate-200 my-1"></div>

        <!-- Location Input -->
        <div class="md:w-64 flex items-center px-3.5 py-2">
          <MapPin class="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            bind:value={locationFilter}
            placeholder="Location or 'Remote'"
            class="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 focus:outline-none text-sm font-medium"
          />
        </div>

        <!-- Search CTA -->
        <button
          type="submit"
          class="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0 active:scale-98"
        >
          <span>Search Jobs</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>
    </div>

    <!-- Quick Filter Chips -->
    <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
      <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Specialties:</span>
      {#each quickFilters as filter}
        <button
          type="button"
          on:click={() => selectChip(filter.category)}
          class="px-3 py-1.2 rounded-full text-xs font-semibold transition-all cursor-pointer {selectedCategory === filter.category ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'}"
        >
          {filter.label}
        </button>
      {/each}
    </div>

    <!-- Trust proof highlights ribbon -->
    <div class="mt-12 pt-8 border-t border-slate-200/70 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      <div class="flex items-center space-x-3 p-2">
        <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
          <ShieldCheck class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-900">Verified Healthcare</h4>
          <p class="text-[11px] text-slate-500">100% strict clinical filtering</p>
        </div>
      </div>

      <div class="flex items-center space-x-3 p-2">
        <div class="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
          <Zap class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-900">Automated ATS</h4>
          <p class="text-[11px] text-slate-500">n8n workflow dispatch</p>
        </div>
      </div>

      <div class="flex items-center space-x-3 p-2">
        <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <Stethoscope class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-900">Licensure Matching</h4>
          <p class="text-[11px] text-slate-500">RN, MD, PharmD, APRN</p>
        </div>
      </div>

      <div class="flex items-center space-x-3 p-2">
        <div class="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
          <Sparkles class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-900">Salary Transparency</h4>
          <p class="text-[11px] text-slate-500">Clear annual compensation</p>
        </div>
      </div>
    </div>
  </div>
</div>
