<script lang="ts">
  import { ShieldCheck, Zap, Stethoscope, Building2, CheckCircle2, ArrowRight } from 'lucide-svelte';

  const benefits = [
    {
      icon: ShieldCheck,
      color: 'blue',
      title: '100% Curated Healthcare Only',
      description: 'Zero generic tech or sales noise. Every single opportunity is rigorously screened for clinical, telehealth, nursing, or health-tech authenticity.'
    },
    {
      icon: Stethoscope,
      color: 'teal',
      title: 'Clinical Credential & License Matching',
      description: 'Tailored for certified professionals. We match state licenses (RN, MD, PharmD, NP, LCSW, CPC) directly with clinic and hospital criteria.'
    },
    {
      icon: Zap,
      color: 'indigo',
      title: 'Automated Fast-Track Applications',
      description: 'No 40-minute forms. Apply in under 60 seconds with our n8n event-driven pipeline that directly logs candidates into employer ATS systems.'
    },
    {
      icon: Building2,
      color: 'emerald',
      title: 'Direct Hiring Partnerships',
      description: 'Connect with verified hospital networks, virtual telehealth clinics, genomics research labs, and Series-A digital health innovators.'
    }
  ];
</script>

<section id="why-section" class="py-18 bg-slate-50/70 border-b border-slate-200/80">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-14">
      <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
        <span>The Healthcare Advantage</span>
      </div>
      <h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        Why Healthcare Professionals Choose PulseCareers
      </h2>
      <p class="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
        Engineered specifically for clinical workflows, medical licensure standards, and digital health career trajectories.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each benefits as ben}
        <div class="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-5 {ben.color === 'blue' ? 'bg-blue-50 text-blue-700' : ben.color === 'teal' ? 'bg-teal-50 text-teal-700' : ben.color === 'indigo' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}">
              <svelte:component this={ben.icon} class="w-6 h-6" />
            </div>
            <h3 class="text-base font-bold text-slate-900">{ben.title}</h3>
            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {ben.description}
            </p>
          </div>

          <div class="mt-6 pt-3 border-t border-slate-100 flex items-center space-x-1 text-xs font-bold text-blue-600">
            <CheckCircle2 class="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Standard</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
