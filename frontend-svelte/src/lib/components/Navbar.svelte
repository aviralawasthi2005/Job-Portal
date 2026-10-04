<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Stethoscope, PlusCircle, Activity, Sparkles } from 'lucide-svelte';

  export let isBackendLive: boolean = true;
  const dispatch = createEventDispatcher();
</script>

<header class="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <!-- Brand Logo -->
    <div class="flex items-center space-x-3 cursor-pointer" on:click={() => dispatch('reset')}>
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-clinical-500 to-emerald-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
        <Stethoscope class="w-5 h-5" />
      </div>
      <div>
        <div class="flex items-center space-x-1.5">
          <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-clinical-700 bg-clip-text text-transparent">
            Pulse<span class="text-brand-600">Careers</span>
          </span>
          <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
            Svelte + Adonis
          </span>
        </div>
        <p class="text-xs text-slate-500 hidden sm:block">Healthcare & Telehealth Talent Network</p>
      </div>
    </div>

    <!-- Navigation Actions -->
    <div class="flex items-center space-x-3 sm:space-x-4">
      <!-- Live Status Badge -->
      <div class="hidden md:flex items-center space-x-2 text-xs font-medium px-2.5 py-1 rounded-full {isBackendLive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
        <span class="relative flex h-2 w-2">
          {#if isBackendLive}
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          {/if}
          <span class="relative inline-flex rounded-full h-2 w-2 {isBackendLive ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
        </span>
        <span>{isBackendLive ? 'API & n8n Synced' : 'Offline / Standalone'}</span>
      </div>

      <!-- Post Job Button -->
      <button
        on:click={() => dispatch('openPostJob')}
        class="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-clinical-600 hover:from-brand-500 hover:to-clinical-500 shadow-md shadow-brand-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Post a Job</span>
      </button>
    </div>
  </div>
</header>
