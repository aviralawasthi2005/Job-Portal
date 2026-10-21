<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Filter, RotateCcw, Briefcase, MapPin, DollarSign, Stethoscope, ArrowUpDown } from 'lucide-svelte';

  export let selectedCategory: string = 'All';
  export let selectedWorkplace: string = 'All';
  export let selectedType: string = 'All';
  export let minSalary: number = 0;
  export let selectedSort: 'newest' | 'salary_high' | 'featured' = 'newest';

  const dispatch = createEventDispatcher();

  const categories = [
    'All',
    'Nursing',
    'Clinical Research & Life Sciences',
    'Physicians & Surgeons',
    'Telehealth & Digital Health',
    'Health Informatics & Medical Coding',
    'Pharmacy & Pharmacology',
    'Mental & Behavioral Health',
    'Allied Health'
  ];

  const workplaceTypes = ['All', 'Remote', 'On-site', 'Hybrid'];
  const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Per Diem'];

  function handleFilterChange() {
    dispatch('filterChange', {
      category: selectedCategory,
      workplaceType: selectedWorkplace,
      type: selectedType,
      minSalary,
      sort: selectedSort
    });
  }

  function resetFilters() {
    selectedCategory = 'All';
    selectedWorkplace = 'All';
    selectedType = 'All';
    minSalary = 0;
    selectedSort = 'newest';
    handleFilterChange();
  }

  $: activeCount = (selectedCategory !== 'All' ? 1 : 0) +
                   (selectedWorkplace !== 'All' ? 1 : 0) +
                   (selectedType !== 'All' ? 1 : 0) +
                   (minSalary > 0 ? 1 : 0);
</script>

<aside class="w-full space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
  <!-- Header -->
  <div class="flex items-center justify-between pb-4 border-b border-slate-100">
    <div class="flex items-center space-x-2">
      <Filter class="h-4 w-4 text-emerald-700" />
      <span class="text-slate-900 font-bold text-sm sm:text-base">Filters</span>
      {#if activeCount > 0}
        <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
          {activeCount} active
        </span>
      {/if}
    </div>
    {#if activeCount > 0}
      <button
        type="button"
        on:click={resetFilters}
        class="flex cursor-pointer items-center space-x-1 text-xs font-semibold text-slate-500 transition-colors hover:text-emerald-700"
      >
        <RotateCcw class="w-3 h-3" />
        <span>Reset</span>
      </button>
    {/if}
  </div>

  <!-- Sort By -->
  <div class="space-y-2">
    <label for="sort-select" class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
      <ArrowUpDown class="h-3.5 w-3.5 text-emerald-700" />
      <span>Sort Order</span>
    </label>
    <select
      id="sort-select"
      bind:value={selectedSort}
      on:change={handleFilterChange}
      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
    >
      <option value="newest">Newest First</option>
      <option value="salary_high">Highest Compensation</option>
      <option value="featured">Featured / Priority</option>
    </select>
  </div>

  <!-- Medical Category / Specialty -->
  <div class="space-y-2">
    <label for="category-select" class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
      <Stethoscope class="h-3.5 w-3.5 text-emerald-700" />
      <span>Specialty / Domain</span>
    </label>
    <select
      id="category-select"
      bind:value={selectedCategory}
      on:change={handleFilterChange}
      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
    >
      {#each categories as cat}
        <option value={cat}>{cat === 'All' ? 'All Specialties' : cat}</option>
      {/each}
    </select>
  </div>

  <!-- Workplace Mode (Remote / Hybrid / On-site) -->
  <div class="space-y-2">
    <span class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
      <MapPin class="h-3.5 w-3.5 text-emerald-700" />
      <span>Workplace Mode</span>
    </span>
    <div class="grid grid-cols-2 gap-1.5">
      {#each workplaceTypes as wp}
        <button
          type="button"
          on:click={() => { selectedWorkplace = wp; handleFilterChange(); }}
          class="cursor-pointer rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold transition-all {selectedWorkplace === wp ? 'bg-emerald-700 text-white shadow-sm' : 'border border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
        >
          {wp}
        </button>
      {/each}
    </div>
  </div>

  <!-- Employment Type -->
  <div class="space-y-2">
    <label for="type-select" class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
      <Briefcase class="h-3.5 w-3.5 text-emerald-700" />
      <span>Employment Type</span>
    </label>
    <select
      id="type-select"
      bind:value={selectedType}
      on:change={handleFilterChange}
      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
    >
      {#each jobTypes as jt}
        <option value={jt}>{jt === 'All' ? 'All Contract Types' : jt}</option>
      {/each}
    </select>
  </div>

  <!-- Minimum Compensation Slider -->
  <div class="space-y-3 pt-2">
    <div class="flex items-center justify-between">
      <label for="salary-slider" class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
        <DollarSign class="w-3.5 h-3.5 text-emerald-600" />
        <span>Min. Compensation</span>
      </label>
      <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
        {minSalary === 0 ? 'Any Salary' : `$${minSalary.toLocaleString()}+ / yr`}
      </span>
    </div>
    <input
      id="salary-slider"
      type="range"
      min="0"
      max="200000"
      step="10000"
      bind:value={minSalary}
      on:input={handleFilterChange}
      class="w-full cursor-pointer accent-emerald-700"
    />
    <div class="flex justify-between text-[10px] text-slate-400 font-semibold">
      <span>$0</span>
      <span>$100k</span>
      <span>$200k+</span>
    </div>
  </div>
</aside>
