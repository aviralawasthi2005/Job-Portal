<script lang="ts">
  import { Building2, ShieldCheck } from 'lucide-svelte';

  const employers = [
    { name: 'Mayo Clinic Health', tag: 'Academic Medical Center' },
    { name: 'Cleveland Clinic', tag: 'Hospital Network' },
    { name: 'Teladoc Health', tag: 'Telehealth Pioneer' },
    { name: 'Abridge Healthcare', tag: 'Clinical AI & EHR' },
    { name: 'Kaiser Permanente', tag: 'Integrated Managed Care' },
    { name: 'CareHealth Virtual', tag: 'Digital Clinic' }
  ];
</script>

<div class="py-10 bg-slate-50/80 border-b border-slate-200/80">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-6">
      <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Trusted by Leading Healthcare Systems & Digital Health Innovators
      </p>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
      {#each employers as emp}
        <div class="flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs hover:border-blue-300 transition-colors">
          <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
            {emp.name.slice(0, 2).toUpperCase()}
          </div>
          <div class="text-left">
            <span class="text-xs font-bold text-slate-800 block">{emp.name}</span>
            <span class="text-[10px] text-slate-400 block">{emp.tag}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
