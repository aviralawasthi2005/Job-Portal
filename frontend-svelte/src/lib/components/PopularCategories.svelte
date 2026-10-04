<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Stethoscope, Dna, Microscope, Bot, Database, Pill, HeartPulse, Video, ArrowRight } from 'lucide-svelte';

  export let selectedCategory: string = 'All';
  const dispatch = createEventDispatcher();

  const categories = [
    {
      id: 'Nursing',
      name: 'Nursing & APRN',
      icon: Stethoscope,
      color: 'blue',
      description: 'Family Nurse Practitioners, ICU Staff RNs, Travel Nurses, CRNAs',
      count: '3,200+'
    },
    {
      id: 'Clinical Research & Life Sciences',
      name: 'Clinical Research & Trials',
      icon: Microscope,
      color: 'teal',
      description: 'CRAs, Clinical Trial Coordinators, Biostatisticians, Regulatory Affairs',
      count: '1,450+'
    },
    {
      id: 'Physicians & Surgeons',
      name: 'Physicians & Specialists',
      icon: HeartPulse,
      color: 'indigo',
      description: 'Primary Care, Hospitalists, Cardiologists, Medical Directors',
      count: '980+'
    },
    {
      id: 'Telehealth & Digital Health',
      name: 'Telehealth & Virtual Care',
      icon: Video,
      color: 'emerald',
      description: 'Remote Outpatient Providers, RPM Specialists, Tele-triage',
      count: '2,100+'
    },
    {
      id: 'Health Informatics & Medical Coding',
      name: 'Health Informatics & EHR',
      icon: Database,
      color: 'sky',
      description: 'Epic/Cerner Analysts, Medical Coders (CPC/RHIA), CDI Specialists',
      count: '1,890+'
    },
    {
      id: 'Pharmacy & Pharmacology',
      name: 'Pharmacy & Pharmacology',
      icon: Pill,
      color: 'amber',
      description: 'Clinical Pharmacists (PharmD), Compounding, MTM Consultants',
      count: '820+'
    },
    {
      id: 'Mental & Behavioral Health',
      name: 'Mental & Behavioral Health',
      icon: Dna,
      color: 'violet',
      description: 'Psychiatrists, PMHNPs, Licensed Therapists (LCSW, LMFT)',
      count: '1,640+'
    },
    {
      id: 'Allied Health',
      name: 'Diagnostics & Allied Health',
      icon: Bot,
      color: 'rose',
      description: 'Radiology Techs, Sonographers, Physical Therapists, Lab Techs',
      count: '1,120+'
    }
  ];

  function handleSelect(catId: string) {
    dispatch('selectCategory', catId);
    const el = document.getElementById('jobs-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<section id="categories-section" class="py-16 bg-white border-b border-slate-200/80">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-10">
      <div>
        <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <span>Specialized Career Domains</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Healthcare Specialties
        </h2>
        <p class="mt-1 text-sm text-slate-500 max-w-xl">
          Verified clinical and digital health positions indexed by specialty, credential requirements, and compensation tiers.
        </p>
      </div>

      <button
        type="button"
        on:click={() => handleSelect('All')}
        class="mt-4 md:mt-0 text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer transition-colors"
      >
        <span>View all specialties</span>
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Category Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each categories as cat}
        <button
          type="button"
          on:click={() => handleSelect(cat.id)}
          class="p-5 rounded-2xl border text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between {selectedCategory === cat.id ? 'border-blue-600 bg-blue-50/40 shadow-xs' : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md'}"
        >
          <div>
            <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 {cat.color === 'blue' ? 'bg-blue-50 text-blue-700' : cat.color === 'teal' ? 'bg-teal-50 text-teal-700' : cat.color === 'indigo' ? 'bg-indigo-50 text-indigo-700' : cat.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' : cat.color === 'sky' ? 'bg-sky-50 text-sky-700' : cat.color === 'amber' ? 'bg-amber-50 text-amber-700' : cat.color === 'violet' ? 'bg-violet-50 text-violet-700' : 'bg-rose-50 text-rose-700'}">
              <svelte:component this={cat.icon} class="w-5 h-5" />
            </div>

            <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {cat.name}
            </h3>
            <p class="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {cat.description}
            </p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
              {cat.count} Active Roles
            </span>
            <span class="font-semibold text-blue-600 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Browse</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>
