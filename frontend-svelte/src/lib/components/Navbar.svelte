<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Stethoscope, Bookmark, FileText, PlusCircle, Menu, X, ShieldCheck } from 'lucide-svelte';
  import { savedJobs, trackedApplications } from '../stores';

  export let isBackendLive: boolean = true;

  const dispatch = createEventDispatcher();
  let isMobileMenuOpen = false;

  function scrollToSection(id: string) {
    isMobileMenuOpen = false;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<header class="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
    <!-- Brand Logo -->
    <button
      type="button"
      class="flex items-center space-x-3 text-left cursor-pointer group focus:outline-none"
      on:click={() => { dispatch('reset'); scrollToSection('jobs-section'); }}
    >
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
        <Stethoscope class="w-5 h-5" />
      </div>
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
            Pulse<span class="text-blue-600">Careers</span>
          </span>
          <span class="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            <ShieldCheck class="w-3 h-3 text-blue-600" />
            <span>Healthcare</span>
          </span>
        </div>
        <p class="text-[11px] text-slate-500 font-medium hidden md:block">Clinical & Health-Tech Marketplace</p>
      </div>
    </button>

    <!-- Desktop Center Nav Links -->
    <nav class="hidden lg:flex items-center space-x-1 text-sm font-semibold text-slate-600">
      <button
        type="button"
        on:click={() => scrollToSection('jobs-section')}
        class="px-3.5 py-2 rounded-lg hover:text-blue-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
      >
        Explore Jobs
      </button>

      <button
        type="button"
        on:click={() => scrollToSection('categories-section')}
        class="px-3.5 py-2 rounded-lg hover:text-blue-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
      >
        Specialties
      </button>

      <button
        type="button"
        on:click={() => scrollToSection('why-section')}
        class="px-3.5 py-2 rounded-lg hover:text-blue-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
      >
        Why PulseCareers
      </button>

      <button
        type="button"
        on:click={() => dispatch('openSavedJobs')}
        class="px-3.5 py-2 rounded-lg hover:text-blue-700 hover:bg-slate-100/80 transition-colors flex items-center space-x-1.5 cursor-pointer"
      >
        <Bookmark class="w-4 h-4 text-slate-500" />
        <span>Saved</span>
        {#if $savedJobs.length > 0}
          <span class="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
            {$savedJobs.length}
          </span>
        {/if}
      </button>

      <button
        type="button"
        on:click={() => dispatch('openApplications')}
        class="px-3.5 py-2 rounded-lg hover:text-blue-700 hover:bg-slate-100/80 transition-colors flex items-center space-x-1.5 cursor-pointer"
      >
        <FileText class="w-4 h-4 text-slate-500" />
        <span>Applications</span>
        {#if $trackedApplications.length > 0}
          <span class="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
            {$trackedApplications.length}
          </span>
        {/if}
      </button>
    </nav>

    <!-- Right Actions -->
    <div class="hidden sm:flex items-center space-x-3.5">
      <!-- Live Sync Status -->
      <div class="hidden xl:flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full {isBackendLive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
        <span class="relative flex h-2 w-2">
          {#if isBackendLive}
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          {/if}
          <span class="relative inline-flex rounded-full h-2 w-2 {isBackendLive ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
        </span>
        <span>{isBackendLive ? 'Live Verified & n8n Synced' : 'Standalone Mode'}</span>
      </div>

      <!-- Post Job Button -->
      <button
        type="button"
        on:click={() => dispatch('openPostJob')}
        class="inline-flex items-center space-x-2 px-4.5 py-2.2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Post a Job</span>
      </button>
    </div>

    <!-- Mobile Menu Button -->
    <div class="flex items-center space-x-2 lg:hidden">
      <button
        type="button"
        on:click={() => dispatch('openSavedJobs')}
        class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative"
        aria-label="View Saved Jobs"
      >
        <Bookmark class="w-5 h-5" />
        {#if $savedJobs.length > 0}
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600"></span>
        {/if}
      </button>

      <button
        type="button"
        on:click={() => (isMobileMenuOpen = !isMobileMenuOpen)}
        class="p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none"
        aria-label="Toggle navigation menu"
      >
        {#if isMobileMenuOpen}
          <X class="w-6 h-6" />
        {:else}
          <Menu class="w-6 h-6" />
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Dropdown Nav Sheet -->
  {#if isMobileMenuOpen}
    <div class="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fade-in">
      <button
        type="button"
        on:click={() => scrollToSection('jobs-section')}
        class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
      >
        Explore Healthcare Jobs
      </button>
      <button
        type="button"
        on:click={() => scrollToSection('categories-section')}
        class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
      >
        Browse Specialties & Categories
      </button>
      <button
        type="button"
        on:click={() => scrollToSection('why-section')}
        class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
      >
        Why PulseCareers
      </button>
      <button
        type="button"
        on:click={() => { isMobileMenuOpen = false; dispatch('openSavedJobs'); }}
        class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 flex items-center justify-between"
      >
        <span>Saved Jobs</span>
        <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{$savedJobs.length}</span>
      </button>
      <button
        type="button"
        on:click={() => { isMobileMenuOpen = false; dispatch('openApplications'); }}
        class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 flex items-center justify-between"
      >
        <span>Tracked Applications</span>
        <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">{$trackedApplications.length}</span>
      </button>
      <div class="pt-3 border-t border-slate-100">
        <button
          type="button"
          on:click={() => { isMobileMenuOpen = false; dispatch('openPostJob'); }}
          class="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          Post a Healthcare Position
        </button>
      </div>
    </div>
  {/if}
</header>
