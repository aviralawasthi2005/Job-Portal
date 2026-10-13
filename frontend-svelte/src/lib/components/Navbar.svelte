<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    Stethoscope,
    Bookmark,
    FileText,
    PlusCircle,
    Menu,
    X,
    ShieldCheck,
    LogIn,
    LogOut,
    User as UserIcon,
    ChevronDown,
    Building2,
    Sparkles
  } from 'lucide-svelte';
  import { savedJobs, trackedApplications, currentUser, logoutUser } from '../stores';

  export let isBackendLive: boolean = true;

  const dispatch = createEventDispatcher();
  let isMobileMenuOpen = false;
  let isUserDropdownOpen = false;

  function scrollToSection(id: string) {
    isMobileMenuOpen = false;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleSignOut() {
    logoutUser();
    isUserDropdownOpen = false;
    isMobileMenuOpen = false;
    dispatch('logout');
  }

  function getInitials(name: string): string {
    if (!name) return 'HC';
    const parts = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
</script>

<header class="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
  <div class="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    <!-- Brand Logo -->
    <button
      type="button"
      class="flex items-center space-x-3 text-left cursor-pointer group focus:outline-none"
      on:click={() => { dispatch('reset'); scrollToSection('jobs-section'); }}
    >
      <div class="flex h-10 w-10 items-center justify-center rounded-[14px] bg-emerald-700 text-white shadow-md shadow-emerald-900/15 transition-transform duration-200 group-hover:scale-105">
        <Stethoscope class="h-5 w-5" />
      </div>
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-800">
            Pulse<span class="text-emerald-700">Careers</span>
          </span>
          <span class="hidden items-center space-x-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 sm:inline-flex">
            <ShieldCheck class="h-3 w-3 text-emerald-700" />
            <span>Healthcare</span>
          </span>
        </div>
        <p class="text-[11px] text-slate-500 font-medium hidden md:block">Clinical & Health-Tech Marketplace</p>
      </div>
    </button>

    <!-- Desktop Center Nav Links -->
    <nav class="hidden items-center space-x-1 text-[13px] font-semibold text-slate-600 lg:flex">
      <button
        type="button"
        on:click={() => scrollToSection('jobs-section')}
        class="cursor-pointer rounded-lg px-3.5 py-2 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
      >
        Explore Jobs
      </button>

      <button
        type="button"
        on:click={() => scrollToSection('categories-section')}
        class="cursor-pointer rounded-lg px-3.5 py-2 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
      >
        Specialties
      </button>

      <button
        type="button"
        on:click={() => scrollToSection('why-section')}
        class="cursor-pointer rounded-lg px-3.5 py-2 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
      >
        Why PulseCareers
      </button>

      <button
        type="button"
        on:click={() => dispatch('openSavedJobs')}
        class="flex cursor-pointer items-center space-x-1.5 rounded-lg px-3.5 py-2 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
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
        class="flex cursor-pointer items-center space-x-1.5 rounded-lg px-3.5 py-2 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
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
    <div class="hidden sm:flex items-center space-x-3">
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

      <!-- Auth Buttons / User Profile Chip -->
      {#if $currentUser}
        <div class="relative">
          <button
            type="button"
            on:click={() => (isUserDropdownOpen = !isUserDropdownOpen)}
            class="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            aria-haspopup="true"
            aria-expanded={isUserDropdownOpen}
          >
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br {$currentUser.role === 'candidate' ? 'from-blue-600 to-indigo-600' : 'from-indigo-600 to-teal-600'} text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              {getInitials($currentUser.name)}
            </div>
            <div class="text-left hidden md:block">
              <div class="text-xs font-bold text-slate-800 truncate max-w-[120px]">{$currentUser.name}</div>
              <div class="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                {#if $currentUser.role === 'candidate'}
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{$currentUser.specialty || 'Clinician'}</span>
                {:else}
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  <span>Employer</span>
                {/if}
              </div>
            </div>
            <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
          </button>

          <!-- User Profile Dropdown Menu -->
          {#if isUserDropdownOpen}
            <div
              class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-up"
            >
              <div class="px-4 py-3 border-b border-slate-100">
                <p class="text-xs font-bold text-slate-900 truncate">{$currentUser.name}</p>
                <p class="text-[11px] text-slate-500 truncate">{$currentUser.email}</p>
                {#if $currentUser.clinicalLicenseNumber}
                  <div class="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    <ShieldCheck class="w-3 h-3 text-blue-600" />
                    <span>Lic: {$currentUser.clinicalLicenseNumber}</span>
                  </div>
                {:else if $currentUser.organization}
                  <div class="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                    <Building2 class="w-3 h-3 text-teal-600" />
                    <span class="truncate max-w-[170px]">{$currentUser.organization}</span>
                  </div>
                {/if}
              </div>

              <div class="py-1 text-xs text-slate-700">
                <button
                  type="button"
                  on:click={() => { isUserDropdownOpen = false; dispatch('openSavedJobs'); }}
                  class="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span class="flex items-center space-x-2">
                    <Bookmark class="w-3.5 h-3.5 text-slate-400" />
                    <span>Saved Jobs</span>
                  </span>
                  <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">{$savedJobs.length}</span>
                </button>

                <button
                  type="button"
                  on:click={() => { isUserDropdownOpen = false; dispatch('openApplications'); }}
                  class="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span class="flex items-center space-x-2">
                    <FileText class="w-3.5 h-3.5 text-slate-400" />
                    <span>Tracked Applications</span>
                  </span>
                  <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700">{$trackedApplications.length}</span>
                </button>
              </div>

              <div class="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  on:click={handleSignOut}
                  class="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut class="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Unauthenticated Buttons -->
        <button
          type="button"
          on:click={() => dispatch('openLogin')}
          class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <LogIn class="w-3.5 h-3.5 text-slate-500" />
          <span>Sign In</span>
        </button>

        <button
          type="button"
          on:click={() => dispatch('openSignup')}
          class="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-2xs"
        >
          Create Account
        </button>
      {/if}

      <!-- Post Job Button -->
      <button
        type="button"
        on:click={() => dispatch('openPostJob')}
        class="inline-flex cursor-pointer items-center space-x-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-900/15 transition-all hover:bg-emerald-800 active:scale-[0.98]"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Post a Job</span>
      </button>
    </div>

    <!-- Mobile Menu Button -->
    <div class="flex items-center space-x-2 lg:hidden">
      {#if $currentUser}
        <button
          type="button"
          on:click={() => (isMobileMenuOpen = !isMobileMenuOpen)}
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs"
        >
          {getInitials($currentUser.name)}
        </button>
      {/if}

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
      {#if $currentUser}
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-3 flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <div class="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              {getInitials($currentUser.name)}
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900">{$currentUser.name}</div>
              <div class="text-[10px] text-slate-500">{$currentUser.email}</div>
            </div>
          </div>
          <button
            type="button"
            on:click={handleSignOut}
            class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
            title="Sign Out"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
          <button
            type="button"
            on:click={() => { isMobileMenuOpen = false; dispatch('openLogin'); }}
            class="py-2.2 text-center rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
          >
            Sign In
          </button>
          <button
            type="button"
            on:click={() => { isMobileMenuOpen = false; dispatch('openSignup'); }}
            class="py-2.2 text-center rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            Create Account
          </button>
        </div>
      {/if}

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
