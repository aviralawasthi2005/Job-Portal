<script lang="ts">
  import { onMount } from 'svelte';
  import { Loader2, Briefcase, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import Navbar from './lib/components/Navbar.svelte';
  import Hero from './lib/components/Hero.svelte';
  import JobFilters from './lib/components/JobFilters.svelte';
  import JobCard from './lib/components/JobCard.svelte';
  import JobDetailModal from './lib/components/JobDetailModal.svelte';
  import ApplyModal from './lib/components/ApplyModal.svelte';
  import PostJobModal from './lib/components/PostJobModal.svelte';
  import Toast from './lib/components/Toast.svelte';
  import { ApiService } from './lib/api';
  import type { Job, JobFilterParams, PaginatedJobResponse } from './lib/types';

  let jobs: Job[] = [];
  let isLoading = true;
  let error: string | null = null;
  let isBackendLive = true;

  // Filter state
  let searchTerm = '';
  let selectedCategory = 'All';
  let selectedWorkplace = 'All';
  let selectedType = 'All';
  let minSalary = 0;
  let currentPage = 1;
  let totalJobs = 0;
  let totalPages = 1;

  // Modals state
  let selectedJobForDetail: Job | null = null;
  let selectedJobForApply: Job | null = null;
  let isPostJobModalOpen = false;

  // Toast
  let toastMessage = '';
  let toastType: 'success' | 'error' = 'success';

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    toastMessage = msg;
    toastType = type;
    setTimeout(() => {
      toastMessage = '';
    }, 5000);
  }

  async function loadJobs() {
    isLoading = true;
    error = null;

    const params: JobFilterParams = {
      search: searchTerm || undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      workplaceType: selectedWorkplace !== 'All' ? selectedWorkplace : undefined,
      type: selectedType !== 'All' ? selectedType : undefined,
      minSalary: minSalary > 0 ? minSalary : undefined,
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

  function handleSearch(e: CustomEvent<{ term: string; category: string }>) {
    searchTerm = e.detail.term;
    selectedCategory = e.detail.category;
    currentPage = 1;
    loadJobs();
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
    currentPage = 1;
    loadJobs();
  }

  function handleReset() {
    searchTerm = '';
    selectedCategory = 'All';
    selectedWorkplace = 'All';
    selectedType = 'All';
    minSalary = 0;
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
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  }

  onMount(() => {
    loadJobs();
  });
</script>

<div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
  <!-- Navbar -->
  <Navbar
    {isBackendLive}
    on:reset={handleReset}
    on:openPostJob={() => (isPostJobModalOpen = true)}
  />

  <!-- Hero Header -->
  <Hero
    bind:searchTerm
    bind:selectedCategory
    on:search={handleSearch}
    on:categoryChange={handleCategoryChange}
  />

  <!-- Main Content Layout -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Left Sidebar: Filters -->
      <div class="lg:col-span-1">
        <div class="sticky top-20">
          <JobFilters
            {selectedCategory}
            {selectedWorkplace}
            {selectedType}
            {minSalary}
            on:filterChange={handleFilterChange}
          />
        </div>
      </div>

      <!-- Right Area: Results Grid -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Results Header -->
        <div class="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <span class="text-sm font-bold text-slate-800">
              {#if isLoading}
                Fetching healthcare opportunities...
              {:else}
                Showing <span class="text-brand-600">{jobs.length}</span> of {totalJobs} Positions
              {/if}
            </span>
          </div>

          <button
            type="button"
            on:click={loadJobs}
            class="text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <RefreshCw class="w-3.5 h-3.5 {isLoading ? 'animate-spin text-brand-600' : ''}" />
            <span>Refresh</span>
          </button>
        </div>

        <!-- Loading State -->
        {#if isLoading}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each Array(6) as _}
              <div class="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-4">
                <div class="flex space-x-3">
                  <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div class="h-3 bg-slate-100 rounded w-full"></div>
                <div class="h-3 bg-slate-100 rounded w-2/3"></div>
              </div>
            {/each}
          </div>
        {:else if error}
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
            <AlertTriangle class="w-8 h-8 text-amber-600 mx-auto" />
            <h3 class="text-base font-bold text-amber-900">Backend API Connecting...</h3>
            <p class="text-xs text-amber-700 max-w-md mx-auto">{error}</p>
            <button
              on:click={loadJobs}
              class="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-500 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        {:else if jobs.length === 0}
          <div class="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Briefcase class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-bold text-slate-800">No matching healthcare roles found</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms, widening salary criteria, or clearing filters.
            </p>
            <button
              on:click={handleReset}
              class="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-500 cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        {:else}
          <!-- Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each jobs as job (job.guid)}
              <JobCard
                {job}
                on:select={handleSelectJob}
                on:apply={handleOpenApply}
              />
            {/each}
          </div>

          <!-- Pagination Bar -->
          {#if totalPages > 1}
            <div class="pt-6 flex items-center justify-center space-x-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                on:click={() => handlePageChange(currentPage - 1)}
                class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>
              <span class="text-xs font-semibold text-slate-600 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                on:click={() => handlePageChange(currentPage + 1)}
                class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </main>

  <!-- Modals -->
  <JobDetailModal
    job={selectedJobForDetail}
    on:close={() => (selectedJobForDetail = null)}
    on:apply={handleOpenApply}
  />

  {#if selectedJobForApply}
    <ApplyModal
      job={selectedJobForApply}
      on:close={() => (selectedJobForApply = null)}
      on:success={(e) => showToast(e.detail, 'success')}
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

  <!-- Toast Notification -->
  <Toast
    message={toastMessage}
    type={toastType}
    onDismiss={() => (toastMessage = '')}
  />
</div>
