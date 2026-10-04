<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Filter, RotateCcw, Briefcase, MapPin, DollarSign, Stethoscope } from 'lucide-svelte';

  export let selectedCategory: string = 'All';
  export let selectedWorkplace: string = 'All';
  export let selectedType: string = 'All';
  export let minSalary: number = 0;

  const dispatch = createEventDispatcher();

  const categories = [
    'All',
    'Nursing',
    'Telehealth & Digital Health',
    'Physicians & Surgeons',
    'Health Informatics & IT',
    'Pharmacy',
    'Mental & Behavioral Health',
    'Clinical Research',
    'Allied Health'
  ];

  const workplaceTypes = ['All', 'Remote', 'On-site', 'Hybrid'];
  const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Per Diem'];

  function handleFilterChange() {
    dispatch('filterChange', {
      category: selectedCategory,
      workplaceType: selectedWorkplace,
      type: selectedType,
      minSalary
    });
  }

  function resetFilters() {
    selectedCategory = 'All';
    selectedWorkplace = 'All';
    selectedType = 'All';
    minSalary = 0;
    handleFilterChange();
  }
</script>

<aside class="w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between pb-4 border-b border-slate-100">
    <div class="flex items-center space-x-2 text-slate-900 font-bold text-base">
      <Filter class="w-4 h-4 text-brand-600" />
      <span>Filter Opportunities</span>
    </div>
    <button
      type="button"
      on:click={resetFilters}
      class="text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center space-x-1 cursor-pointer transition-colors"
    >
      <RotateCcw class="w-3 h-3" />
      <span>Reset</span>
    </button>
  </div>

  <!-- Medical Category -->
  <div class="space-y-2">
    <label class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
      <Stethoscope class="w-3.5 h-3.5 text-brand-600" />
      <span>Specialty / Category</span>
    </label>
    <select
      bind:value={selectedCategory}
      on:change={handleFilterChange}
      class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
    >
      {#each categories as cat}
        <option value={cat}>{cat}</option>
      {/each}
    </select>
  </div>

  <!-- Workplace Mode (Remote / On-site / Hybrid) -->
  <div class="space-y-2">
    <label class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
      <MapPin class="w-3.5 h-3.5 text-clinical-600" />
      <span>Workplace Mode</span>
    </label>
    <div class="grid grid-cols-2 gap-1.5">
      {#each workplaceTypes as wp}
        <button
          type="button"
          on:click={() => { selectedWorkplace = wp; handleFilterChange(); }}
          class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-center transition-all {selectedWorkplace === wp ? 'bg-brand-600 text-white font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}"
        >
          {wp}
        </button>
      {/each}
    </div>
  </div>

  <!-- Employment Type -->
  <div class="space-y-2">
    <label class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
      <Briefcase class="w-3.5 h-3.5 text-brand-600" />
      <span>Employment Type</span>
    </label>
    <select
      bind:value={selectedType}
      on:change={handleFilterChange}
      class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
    >
      {#each jobTypes as jt}
        <option value={jt}>{jt}</option>
      {/each}
    </select>
  </div>

  <!-- Minimum Annual Salary -->
  <div class="space-y-3 pt-2">
    <div class="flex items-center justify-between">
      <label class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
        <DollarSign class="w-3.5 h-3.5 text-emerald-600" />
        <span>Min. Compensation</span>
      </label>
      <span class="text-xs font-bold text-emerald-600">
        {minSalary === 0 ? 'Any Salary' : `$${minSalary.toLocaleString()}+ / yr`}
      </span>
    </div>
    <input
      type="range"
      min="0"
      max="200000"
      step="10000"
      bind:value={minSalary}
      on:input={handleFilterChange}
      class="w-full accent-brand-600 cursor-pointer"
    />
    <div class="flex justify-between text-[10px] text-slate-400">
      <span>$0</span>
      <span>$100k</span>
      <span>$200k+</span>
    </div>
  </div>
</aside>
