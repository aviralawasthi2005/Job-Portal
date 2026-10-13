<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    ArrowRight,
    BadgeCheck,
    BriefcaseMedical,
    CheckCircle2,
    HeartPulse,
    MapPin,
    Search,
    ShieldCheck,
    Sparkles,
    Stethoscope
  } from 'lucide-svelte';

  export let searchTerm: string = '';
  export let locationFilter: string = '';
  export let selectedCategory: string = 'All';

  const dispatch = createEventDispatcher();

  const quickFilters = [
    { label: 'All roles', category: 'All' },
    { label: 'Nursing', category: 'Nursing' },
    { label: 'Clinical research', category: 'Clinical Research & Life Sciences' },
    { label: 'Physicians', category: 'Physicians & Surgeons' },
    { label: 'Telehealth', category: 'Telehealth & Digital Health' },
    { label: 'Health informatics', category: 'Health Informatics & Medical Coding' },
    { label: 'Pharmacy', category: 'Pharmacy & Pharmacology' },
    { label: 'Mental health', category: 'Mental & Behavioral Health' }
  ];

  function handleSubmit() {
    dispatch('search', { term: searchTerm, location: locationFilter, category: selectedCategory });
  }

  function selectChip(category: string) {
    selectedCategory = category;
    dispatch('categoryChange', category);
  }
</script>

<section class="relative isolate overflow-hidden border-b border-slate-200/80 bg-[#f5f8f7]">
  <div class="pointer-events-none absolute -right-40 -top-44 -z-10 h-[34rem] w-[34rem] rounded-full bg-emerald-200/35 blur-3xl"></div>
  <div class="pointer-events-none absolute -bottom-56 left-[-8rem] -z-10 h-[28rem] w-[28rem] rounded-full bg-sky-100/70 blur-3xl"></div>

  <div class="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
    <div class="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
      <div class="max-w-3xl">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-sm">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
          </span>
          <ShieldCheck class="h-3.5 w-3.5 text-emerald-700" />
          A career marketplace made for healthcare
        </div>

        <h1 class="max-w-3xl text-[2.65rem] font-extrabold leading-[1.08] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-[4.25rem]">
          Your next chapter in
          <span class="relative whitespace-nowrap text-emerald-700">
            healthcare.
            <span class="absolute -bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-emerald-200/70"></span>
          </span>
        </h1>

        <p class="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          Find meaningful clinical and health-tech roles, thoughtfully organized around the work you do and the care you give.
        </p>

        <form
          on:submit|preventDefault={handleSubmit}
          class="mt-8 grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.25)] transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 sm:grid-cols-[1fr_0.72fr_auto] sm:gap-0"
        >
          <label class="flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 sm:py-2.5">
            <Search class="h-5 w-5 shrink-0 text-slate-400" />
            <span class="sr-only">Search job title, specialty or keyword</span>
            <input
              type="search"
              bind:value={searchTerm}
              placeholder="Job title, specialty or keyword"
              class="w-full min-w-0 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </label>

          <label class="flex min-w-0 items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-3 sm:border-l sm:border-t-0 sm:py-2.5">
            <MapPin class="h-5 w-5 shrink-0 text-slate-400" />
            <span class="sr-only">Location</span>
            <input
              type="search"
              bind:value={locationFilter}
              placeholder="City, state or remote"
              class="w-full min-w-0 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </label>

          <button
            type="submit"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 active:scale-[0.98] sm:px-6"
          >
            Search roles
            <ArrowRight class="h-4 w-4" />
          </button>
        </form>

        <div class="mt-5 flex flex-wrap items-center gap-2">
          <span class="mr-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Explore</span>
          {#each quickFilters as filter}
            <button
              type="button"
              on:click={() => selectChip(filter.category)}
              aria-pressed={selectedCategory === filter.category}
              class="rounded-full border px-3 py-1.5 text-xs font-semibold transition {selectedCategory === filter.category ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm' : 'border-slate-200 bg-white/80 text-slate-600 hover:border-emerald-300 hover:text-emerald-800'}"
            >
              {filter.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-[30rem] lg:max-w-none">
        <div class="absolute -right-4 top-10 h-36 w-36 rounded-full border border-emerald-200/80 sm:-right-8 sm:h-48 sm:w-48"></div>
        <div class="absolute -bottom-5 left-2 h-24 w-24 rounded-full border border-sky-200/80"></div>

        <div class="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_30px_80px_-36px_rgba(15,23,42,0.6)] sm:p-8">
          <div class="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"></div>
          <div class="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl"></div>

          <div class="relative">
            <div class="flex items-center justify-between">
              <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200">
                <Sparkles class="h-3.5 w-3.5" />
                Healthcare, in focus
              </div>
              <HeartPulse class="h-6 w-6 text-emerald-300" />
            </div>

            <h2 class="mt-10 max-w-sm text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl">
              A better search for the people who care.
            </h2>
            <p class="mt-3 max-w-sm text-sm leading-6 text-slate-300">
              Spend less time sorting through noise and more time finding work that fits your expertise.
            </p>

            <div class="mt-8 space-y-3">
              <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <BadgeCheck class="h-5 w-5" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-bold text-white">Healthcare-first discovery</span>
                  <span class="mt-0.5 block text-xs text-slate-400">Clinical, research and digital health roles</span>
                </span>
                <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-300" />
              </div>

              <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
                  <Stethoscope class="h-5 w-5" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-bold text-white">Made for your specialty</span>
                  <span class="mt-0.5 block text-xs text-slate-400">Explore opportunities by clinical domain</span>
                </span>
                <BriefcaseMedical class="h-4 w-4 shrink-0 text-sky-300" />
              </div>
            </div>

            <div class="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
              <span class="text-xs font-medium text-slate-400">Your next opportunity starts here</span>
              <span class="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-emerald-200">
                <ArrowRight class="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
