<script lang="ts">
  import { Stethoscope, ShieldCheck, Heart, ArrowUp } from 'lucide-svelte';

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<footer class="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <div class="grid grid-cols-2 md:grid-cols-5 gap-8">
      <!-- Col 1: Brand Info -->
      <div class="col-span-2 space-y-4">
        <div class="flex items-center space-x-2.5 text-white">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Stethoscope class="w-4 h-4" />
          </div>
          <span class="text-lg font-bold">Pulse<span class="text-blue-400">Careers</span></span>
        </div>

        <p class="text-slate-400 text-xs leading-relaxed max-w-sm">
          The premier career network dedicated exclusively to healthcare practitioners, telehealth specialists, medical coders, and biotechnology innovators.
        </p>

        <div class="flex items-center space-x-2 text-[11px] text-slate-500 pt-2">
          <ShieldCheck class="w-4 h-4 text-emerald-400 shrink-0" />
          <span>HIPAA-Ready Intake & n8n Enterprise Workflows</span>
        </div>
      </div>

      <!-- Col 2: Specialties -->
      <div class="space-y-3">
        <h4 class="text-white font-bold text-xs uppercase tracking-wider">Specialties</h4>
        <ul class="space-y-2 text-slate-400">
          <li><span class="hover:text-white transition-colors cursor-pointer">Nursing & APRN</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Telehealth Medicine</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Clinical Research</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Health Informatics</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Pharmacy (PharmD)</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Psychiatry & LCSW</span></li>
        </ul>
      </div>

      <!-- Col 3: Candidates -->
      <div class="space-y-3">
        <h4 class="text-white font-bold text-xs uppercase tracking-wider">Candidates</h4>
        <ul class="space-y-2 text-slate-400">
          <li><span class="hover:text-white transition-colors cursor-pointer">Explore All Jobs</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Saved Opportunities</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Application Tracking</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Clinical Licensure Guide</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Salary Benchmarks</span></li>
        </ul>
      </div>

      <!-- Col 4: Employers -->
      <div class="space-y-3">
        <h4 class="text-white font-bold text-xs uppercase tracking-wider">Employers</h4>
        <ul class="space-y-2 text-slate-400">
          <li><span class="hover:text-white transition-colors cursor-pointer">Post a Healthcare Role</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">ATS Webhook Integrations</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Employer Dashboard</span></li>
          <li><span class="hover:text-white transition-colors cursor-pointer">Recruitment Solutions</span></li>
        </ul>
      </div>
    </div>

    <!-- Bottom copyright -->
    <div class="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
      <p>© 2026 PulseCareers. MIT Licensed Open Source Healthcare Marketplace.</p>

      <div class="flex items-center space-x-6">
        <span class="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
        <span class="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
        <button
          type="button"
          on:click={scrollToTop}
          class="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <span>Back to Top</span>
          <ArrowUp class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</footer>
