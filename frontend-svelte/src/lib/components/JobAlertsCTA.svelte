<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Bell, Mail, Sparkles, CheckCircle2 } from 'lucide-svelte';

  const dispatch = createEventDispatcher();
  let email = '';
  let specialty = 'Nursing';
  let isSubscribed = false;

  const specialties = [
    'Nursing & APRN',
    'Clinical Research & Trials',
    'Physicians & Surgeons',
    'Telehealth & Virtual Care',
    'Health Informatics & Medical Coding',
    'Pharmacy & Pharmacology',
    'Mental & Behavioral Health'
  ];

  function handleSubscribe() {
    if (!email || !email.includes('@')) return;
    isSubscribed = true;
    dispatch('subscribed', { email, specialty });
  }
</script>

<section class="py-16 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white relative overflow-hidden">
  <!-- Subtle ambient decorative circles -->
  <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
  <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-4 border border-white/15">
      <Bell class="w-3.5 h-3.5 text-blue-300" />
      <span>Automated Daily Job Digest via n8n</span>
    </div>

    <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight">
      Never Miss Your Next Clinical Opportunity
    </h2>
    <p class="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
      Receive tailored daily notifications for priority openings matching your clinical specialty, state licensure, and compensation requirements.
    </p>

    <!-- Email Form -->
    <div class="mt-8 max-w-2xl mx-auto">
      {#if isSubscribed}
        <div class="p-5 rounded-2xl bg-white/10 border border-white/20 text-center space-y-2 animate-fade-in">
          <CheckCircle2 class="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 class="text-base font-bold text-white">Alert Configured Successfully!</h3>
          <p class="text-xs text-slate-300">
            We will dispatch tailored {specialty} opportunities directly to <span class="font-bold text-white">{email}</span>.
          </p>
        </div>
      {:else}
        <form on:submit|preventDefault={handleSubscribe} class="p-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex flex-col sm:flex-row gap-2">
          <div class="flex-1 flex items-center px-3 py-2">
            <Mail class="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="email"
              required
              bind:value={email}
              placeholder="Enter your professional email..."
              class="w-full bg-transparent border-none text-white placeholder-slate-400 focus:outline-none text-sm font-medium"
            />
          </div>

          <div class="sm:w-56 flex items-center px-2 py-1">
            <select
              bind:value={specialty}
              class="w-full bg-white/10 border border-white/20 text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none"
            >
              {#each specialties as sp}
                <option value={sp} class="bg-slate-900 text-white">{sp}</option>
              {/each}
            </select>
          </div>

          <button
            type="submit"
            class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            Get Daily Alerts
          </button>
        </form>
      {/if}
    </div>

    <!-- Final CTA snippet -->
    <div class="mt-14 pt-10 border-t border-white/10">
      <p class="text-xs text-slate-400">
        Trusted by 15,000+ active nurses, physicians, clinical trial coordinators, and medical coders nationwide.
      </p>
    </div>
  </div>
</section>
