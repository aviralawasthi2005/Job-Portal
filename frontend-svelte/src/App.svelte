<script lang="ts">
  import { onMount } from 'svelte';
  import { RefreshCw, AlertTriangle, Briefcase, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-svelte';
  import Navbar from './lib/components/Navbar.svelte';
  import Hero from './lib/components/Hero.svelte';
  import TrustedEmployers from './lib/components/TrustedEmployers.svelte';
  import PopularCategories from './lib/components/PopularCategories.svelte';
  import JobFilters from './lib/components/JobFilters.svelte';
  import JobCard from './lib/components/JobCard.svelte';
  import JobDetailModal from './lib/components/JobDetailModal.svelte';
  import ApplyModal from './lib/components/ApplyModal.svelte';
  import CandidateDrawer from './lib/components/CandidateDrawer.svelte';
  import PostJobModal from './lib/components/PostJobModal.svelte';
  import AuthModal from './lib/components/AuthModal.svelte';
  import WhyPlatform from './lib/components/WhyPlatform.svelte';
  import JobAlertsCTA from './lib/components/JobAlertsCTA.svelte';
  import Footer from './lib/components/Footer.svelte';
  import Toast from './lib/components/Toast.svelte';
  import SupportDashboard from './lib/components/SupportDashboard.svelte';
  import { ApiService } from './lib/api';
  import { currentUser } from './lib/stores';
  import type { Job, JobFilterParams, PaginatedJobResponse } from './lib/types';

  let jobs: Job[] = [];
  let isLoading = true;
  let error: string | null = null;
  let isBackendLive = true;

  // Filter state
  let searchTerm = '';
  let locationFilter = '';
  let selectedCategory = 'All';
  let selectedWorkplace = 'All';
  let selectedType = 'All';
  let minSalary = 0;
  let selectedSort: 'newest' | 'salary_high' | 'featured' = 'newest';
  let currentPage = 1;
  let totalJobs = 0;
  let totalPages = 1;

  // Modals & Drawers state
  let selectedJobForDetail: Job | null = null;
  let selectedJobForApply: Job | null = null;
  let isCandidateDrawerOpen = false;
  let candidateDrawerTab: 'saved' | 'applications' = 'saved';
  let isPostJobModalOpen = false;
  let isSupportOpen = false;
  let isAdminDashboardOpen = false;

  // Auth Modal state
  let isAuthModalOpen = false;
  let authModalMode: 'login' | 'signup' = 'login';
  let authModalRole: 'candidate' | 'employer' = 'candidate';

  function handleOpenLogin() {
    authModalMode = 'login';
    isAuthModalOpen = true;
  }

  function handleOpenSignup(role: 'candidate' | 'employer' = 'candidate') {
    authModalMode = 'signup';
    authModalRole = role;
    isAuthModalOpen = true;
  }

  // Toast
  let toastMessage = '';
  let toastType: 'success' | 'error' = 'success';

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    toastMessage = msg;
    toastType = type;
    setTimeout(() => {
      toastMessage = '';
    }, 4500);
  }

  async function loadJobs() {
    isLoading = true;
    error = null;

    const params: JobFilterParams = {
      search: searchTerm || undefined,
      location: locationFilter || undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      workplaceType: selectedWorkplace !== 'All' ? selectedWorkplace : undefined,
      type: selectedType !== 'All' ? selectedType : undefined,
      minSalary: minSalary > 0 ? minSalary : undefined,
      sort: selectedSort,
      page: currentPage,
      limit: 12
    };

    try {
      const response: PaginatedJobResponse = await ApiService.getJobs(params);
      jobs = response.data || [];
      totalJobs = response.pagination?.total || jobs.length;
      totalPages = response.pagination?.totalPages || 1;
      isBackendLive = true;
    } catch (err: any) {
      console.warn('Jobs fetch error:', err);
      error = err.message || 'Could not load jobs from backend API';
      isBackendLive = false;
    } finally {
      isLoading = false;
    }
  }

  function handleSearch(e: CustomEvent<{ term: string; location: string; category: string }>) {
    searchTerm = e.detail.term;
    locationFilter = e.detail.location;
    selectedCategory = e.detail.category;
    currentPage = 1;
    loadJobs();
    const el = document.getElementById('jobs-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function handleCategoryChange(e: CustomEvent<string>) {
    selectedCategory = e.detail;
    currentPage = 1;
    loadJobs();
  }

  function handleFilterChange(e: CustomEvent<any>) {
    selectedCategory = e.detail.category;
    selectedWorkplace = e.detail.workplaceType;
    selectedType = e.detail.type;
    minSalary = e.detail.minSalary;
    selectedSort = e.detail.sort || 'newest';
    currentPage = 1;
    loadJobs();
  }

  function handleReset() {
    searchTerm = '';
    locationFilter = '';
    selectedCategory = 'All';
    selectedWorkplace = 'All';
    selectedType = 'All';
    minSalary = 0;
    selectedSort = 'newest';
    currentPage = 1;
    loadJobs();
  }

  function handleSelectJob(e: CustomEvent<Job>) {
    selectedJobForDetail = e.detail;
  }

  function handleOpenApply(e: CustomEvent<Job>) {
    selectedJobForDetail = null;
    selectedJobForApply = e.detail;
  }

  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
      loadJobs();
      const el = document.getElementById('jobs-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function openSavedJobs() {
    candidateDrawerTab = 'saved';
    isCandidateDrawerOpen = true;
  }

  function openApplications() {
    candidateDrawerTab = 'applications';
    isCandidateDrawerOpen = true;
  }

  function openSupportLogin() {
    isSupportOpen = false;
    handleOpenLogin();
  }

  onMount(() => {
    loadJobs();
  });
</script>

<div class="min-h-screen flex flex-col bg-[#f6f8f7] text-slate-900 selection:bg-emerald-700 selection:text-white">
  <!-- Navbar -->
  <Navbar
    {isBackendLive}
    on:reset={handleReset}
    on:openSavedJobs={openSavedJobs}
    on:openApplications={openApplications}
    on:openSupport={() => (isSupportOpen = true)}
    on:openAdminDashboard={() => {
      if ($currentUser?.role === 'admin') isAdminDashboardOpen = true;
    }}
    on:openPostJob={() => (isPostJobModalOpen = true)}
    on:openLogin={handleOpenLogin}
    on:openSignup={() => handleOpenSignup('candidate')}
    on:logout={() => {
      isAdminDashboardOpen = false;
      isSupportOpen = false;
      showToast('Signed out of PulseCareers.', 'success');
    }}
  />

  {#if isAdminDashboardOpen && $currentUser?.role === 'admin'}
    <div class="fixed inset-0 z-50 overflow-y-auto bg-[#f6f8f7]">
      <SupportDashboard adminView on:close={() => (isAdminDashboardOpen = false)} />
    </div>
  {/if}

  <!-- Hero Section with Dual Search -->
  <Hero
    bind:searchTerm
    bind:locationFilter
    bind:selectedCategory
    on:search={handleSearch}
    on:categoryChange={handleCategoryChange}
  />

  <!-- Trusted Employers Banner -->
  <TrustedEmployers />

  <!-- Popular Categories Section -->
  <PopularCategories
    {selectedCategory}
    on:selectCategory={(e) => {
      selectedCategory = e.detail;
      currentPage = 1;
      loadJobs();
    }}
  />

  <!-- Main Marketplace Search & Job Listing Section -->
  <section id="jobs-section" class="mx-auto w-full max-w-7xl flex-1 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
    <!-- Section Title & Status Strip -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.17em] text-emerald-800">
            <ShieldCheck class="h-4 w-4" />
            A more focused job search
          </div>
          <h2 class="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Find your next opportunity
          </h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Browse verified clinical roles, telehealth positions, and medical informatics leadership.
          </p>
        </div>

        <div class="flex items-center space-x-2">
          {#if selectedCategory !== 'All'}
            <span class="inline-flex items-center space-x-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <span>{selectedCategory}</span>
              <button
                type="button"
                on:click={() => { selectedCategory = 'All'; loadJobs(); }}
                class="ml-1 cursor-pointer font-black hover:text-emerald-950"
                title="Clear category"
              >×</button>
            </span>
          {/if}

          <button
            type="button"
            on:click={loadJobs}
            class="flex cursor-pointer items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-800"
          >
            <RefreshCw class="w-3.5 h-3.5 {isLoading ? 'animate-spin text-blue-600' : ''}" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2-Column Marketplace Grid -->
    <div class="grid grid-cols-1 items-start gap-7 lg:grid-cols-4 lg:gap-8">
      <!-- Left Sidebar: Filters -->
      <div class="lg:sticky lg:top-24 lg:col-span-1">
        <JobFilters
          {selectedCategory}
          {selectedWorkplace}
          {selectedType}
          {minSalary}
          {selectedSort}
          on:filterChange={handleFilterChange}
        />
      </div>

      <!-- Right Area: Results Grid -->
      <div class="space-y-5 lg:col-span-3">
        <!-- Results Header Count -->
        <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <span class="text-xs font-bold text-slate-800 sm:text-sm">
            {#if isLoading}
              Screening verified healthcare positions...
            {:else}
              Showing <span class="font-extrabold text-emerald-800">{jobs.length}</span> of {totalJobs} opportunities
            {/if}
          </span>

          <span class="hidden items-center gap-1.5 text-[11px] font-semibold text-slate-400 sm:flex">
            <span class="h-1.5 w-1.5 rounded-full {isBackendLive ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
            {isBackendLive ? 'Live job feed' : 'Service reconnecting'}
          </span>
        </div>

        <!-- Loading State: Professional Skeleton Cards -->
        {#if isLoading}
          <div class="grid grid-cols-1 gap-4">
            {#each Array(6) as _}
              <div class="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div class="flex space-x-3.5">
                  <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div class="h-3 bg-slate-100 rounded w-full"></div>
                <div class="h-3 bg-slate-100 rounded w-2/3"></div>
                <div class="pt-4 border-t border-slate-100 flex justify-between">
                  <div class="h-3 bg-slate-200 rounded w-20"></div>
                  <div class="h-7 bg-slate-200 rounded-xl w-24"></div>
                </div>
              </div>
            {/each}
          </div>
        {:else if error}
          <!-- Error State -->
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
            <AlertTriangle class="w-8 h-8 text-amber-600 mx-auto" />
            <h3 class="text-base font-bold text-amber-900">Connecting to Healthcare Service...</h3>
            <p class="text-xs text-amber-700 max-w-md mx-auto">{error}</p>
            <button
              type="button"
              on:click={loadJobs}
              class="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-500 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        {:else if jobs.length === 0}
          <!-- Empty State -->
          <div class="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-10 text-center shadow-sm sm:p-14">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Briefcase class="w-7 h-7" />
            </div>
            <h3 class="text-lg font-bold text-slate-900">No matching healthcare positions found</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We couldn't find roles matching your current search parameters. Try clearing filters or widening your salary criteria.
            </p>
            <button
              type="button"
              on:click={handleReset}
              class="cursor-pointer rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-800"
            >
              Reset All Filters
            </button>
          </div>
        {:else}
          <!-- Jobs Grid -->
          <div class="grid grid-cols-1 gap-4">
            {#each jobs as job (job.guid)}
              <JobCard
                {job}
                on:select={handleSelectJob}
                on:apply={handleOpenApply}
                on:saveToggle={(e) => {
                  showToast(e.detail.saved ? `Saved "${e.detail.job.title}" to your candidate hub` : `Removed "${e.detail.job.title}" from saved`);
                }}
              />
            {/each}
          </div>

          <!-- Pagination Bar -->
          {#if totalPages > 1}
            <div class="pt-8 flex items-center justify-center space-x-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                on:click={() => handlePageChange(currentPage - 1)}
                class="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>

              <span class="text-xs font-bold text-slate-700 px-4 py-2 bg-white rounded-xl border border-slate-200">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                on:click={() => handlePageChange(currentPage + 1)}
                class="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer transition-colors"
                aria-label="Next page"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </section>

  <!-- Why Choose PulseCareers Section -->
  <WhyPlatform />

  <!-- Job Alerts / Newsletter CTA -->
  <JobAlertsCTA
    on:subscribed={(e) => {
      showToast(`Daily ${e.detail.specialty} alert configured for ${e.detail.email}!`);
    }}
  />

  <!-- Footer -->
  <Footer />

  <!-- Modals & Drawers -->
  <JobDetailModal
    job={selectedJobForDetail}
    on:close={() => (selectedJobForDetail = null)}
    on:apply={handleOpenApply}
    on:saveToggle={(e) => {
      showToast(e.detail.saved ? `Saved "${e.detail.job.title}"` : `Removed "${e.detail.job.title}"`);
    }}
  />

  {#if selectedJobForApply}
    <ApplyModal
      job={selectedJobForApply}
      on:close={() => (selectedJobForApply = null)}
      on:success={(e) => showToast(e.detail, 'success')}
    />
  {/if}

  {#if isCandidateDrawerOpen}
    <CandidateDrawer
      initialTab={candidateDrawerTab}
      on:close={() => (isCandidateDrawerOpen = false)}
      on:selectJob={(e) => {
        isCandidateDrawerOpen = false;
        selectedJobForDetail = e.detail;
      }}
      on:applyJob={(e) => {
        isCandidateDrawerOpen = false;
        selectedJobForApply = e.detail;
      }}
    />
  {/if}

  {#if isPostJobModalOpen}
    <PostJobModal
      on:close={() => (isPostJobModalOpen = false)}
      on:success={(e) => {
        showToast(e.detail, 'success');
        loadJobs();
      }}
    />
  {/if}

  <!-- Authentication Modal (Login / Sign Up) -->
  <AuthModal
    isOpen={isAuthModalOpen}
    initialMode={authModalMode}
    initialRole={authModalRole}
    on:close={() => (isAuthModalOpen = false)}
    on:authSuccess={(e) => {
      showToast(e.detail.message, 'success');
    }}
  />

  <!-- Toast Notification -->
  <Toast
    message={toastMessage}
    type={toastType}
    onDismiss={() => (toastMessage = '')}
  />
  {#if isSupportOpen}
    <SupportDashboard
      on:close={() => (isSupportOpen = false)}
      on:openLogin={openSupportLogin}
    />
  {/if}
</div>
