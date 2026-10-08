<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    X,
    Stethoscope,
    Building2,
    ShieldCheck,
    Mail,
    Lock,
    User as UserIcon,
    Award,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    ArrowRight
  } from 'lucide-svelte';
  import { ApiService } from '../api';
  import { setAuthenticatedUser, quickDemoLogin } from '../stores';

  export let isOpen: boolean = false;
  export let initialMode: 'login' | 'signup' = 'login';
  export let initialRole: 'candidate' | 'employer' = 'candidate';

  const dispatch = createEventDispatcher();

  let mode: 'login' | 'signup' = initialMode;
  let role: 'candidate' | 'employer' = initialRole;

  // Form Fields
  let name = '';
  let email = '';
  let password = '';
  let clinicalLicenseNumber = '';
  let specialty = 'Nursing';
  let organization = '';
  let title = '';

  let showPassword = false;
  let isSubmitting = false;
  let errorMessage = '';

  // Synchronize when initial mode changes
  $: if (isOpen) {
    mode = initialMode;
    role = initialRole;
    errorMessage = '';
  }

  const SPECIALTY_OPTIONS = [
    'Nursing',
    'Physicians & Surgeons',
    'Telehealth & Digital Health',
    'Pharmacy',
    'Mental & Behavioral Health',
    'Health Informatics & IT',
    'Clinical Research',
    'Allied Health',
    'Healthcare Administration'
  ];

  function closeModal() {
    errorMessage = '';
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      closeModal();
    }
  }

  async function handleSubmit() {
    errorMessage = '';

    if (!email || !email.includes('@')) {
      errorMessage = 'Please provide a valid medical or work email address.';
      return;
    }

    if (!password || password.length < 6) {
      errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (mode === 'signup' && (!name || !name.trim())) {
      errorMessage = 'Please provide your full legal or professional name.';
      return;
    }

    isSubmitting = true;

    try {
      if (mode === 'login') {
        const res = await ApiService.login({ email, password });
        setAuthenticatedUser(res.user, res.token);
        dispatch('authSuccess', { user: res.user, mode: 'login', message: res.message || 'Signed in successfully' });
        closeModal();
      } else {
        const payload = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          specialty: role === 'candidate' ? specialty : undefined,
          clinicalLicenseNumber: role === 'candidate' ? clinicalLicenseNumber.trim() : undefined,
          organization: role === 'employer' ? (organization.trim() || 'Healthcare Organization') : undefined,
          title: title.trim() || undefined
        };

        const res = await ApiService.signup(payload);
        setAuthenticatedUser(res.user, res.token);
        dispatch('authSuccess', {
          user: res.user,
          mode: 'signup',
          message: `Account created for ${res.user.name}! Welcome to PulseCareers.`
        });
        closeModal();
      }
    } catch (err: any) {
      errorMessage = err.message || 'Authentication error. Please check your details.';
    } finally {
      isSubmitting = false;
    }
  }

  function handleQuickDemo(demoRole: 'clinician' | 'employer') {
    const user = quickDemoLogin(demoRole);
    dispatch('authSuccess', {
      user,
      mode: 'demo',
      message: `Signed in as ${user.name} (${demoRole === 'clinician' ? 'Clinical Candidate' : 'Employer'})`
    });
    closeModal();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-modal-title"
  >
    <!-- Accessible Backdrop Click -->
    <button
      type="button"
      class="fixed inset-0 w-full h-full bg-transparent border-0 cursor-default"
      on:click={closeModal}
      aria-label="Close modal backdrop"
    ></button>

    <!-- Modal Card -->
    <div
      class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 z-10 animate-scale-up"
    >
      <!-- Modal Header Banner -->
      <div class="bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 px-6 py-6 text-white relative">
        <button
          type="button"
          on:click={closeModal}
          class="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="flex items-center space-x-2.5 mb-2">
          <div class="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Stethoscope class="w-5 h-5 text-white" />
          </div>
          <span class="text-xs font-bold tracking-wider uppercase text-blue-200">PulseCareers Identity</span>
        </div>

        <h2 id="auth-modal-title" class="text-xl sm:text-2xl font-bold tracking-tight">
          {mode === 'login' ? 'Sign In to Your Healthcare Account' : 'Join PulseCareers Marketplace'}
        </h2>
        <p class="text-xs sm:text-sm text-blue-100/90 mt-1">
          {mode === 'login'
            ? 'Access your saved openings, clinical credentials, and application status.'
            : 'Connect with verified healthcare facilities and verified clinical roles.'}
        </p>

        <!-- Mode Toggle Switcher -->
        <div class="mt-4 flex p-1 bg-black/20 rounded-xl backdrop-blur-xs border border-white/10">
          <button
            type="button"
            class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer {mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'}"
            on:click={() => { mode = 'login'; errorMessage = ''; }}
          >
            Sign In
          </button>
          <button
            type="button"
            class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer {mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'}"
            on:click={() => { mode = 'signup'; errorMessage = ''; }}
          >
            Create Account
          </button>
        </div>
      </div>

      <!-- Quick 1-Click Demo Evaluation Bar -->
      <div class="bg-blue-50/80 px-6 py-3 border-b border-blue-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span class="text-slate-600 font-medium flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-blue-600" />
          <span>Quick Demo Access:</span>
        </span>
        <div class="flex items-center space-x-2">
          <button
            type="button"
            on:click={() => handleQuickDemo('clinician')}
            class="px-2.5 py-1 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
          >
            🩺 Dr. Jenkins (MD)
          </button>
          <button
            type="button"
            on:click={() => handleQuickDemo('employer')}
            class="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors shadow-2xs cursor-pointer"
          >
            🏥 CareHealth Recruiter
          </button>
        </div>
      </div>

      <!-- Error Message Banner -->
      {#if errorMessage}
        <div class="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
          <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      {/if}

      <!-- Modal Body Form -->
      <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-4">
        <!-- Role Selection for Signup -->
        {#if mode === 'signup'}
          <div>
            <span class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role
            </span>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                on:click={() => (role = 'candidate')}
                class="p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-3 {role === 'candidate' ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'}"
              >
                <div class="w-8 h-8 rounded-lg {role === 'candidate' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center shrink-0">
                  <Stethoscope class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900">Clinician</div>
                  <div class="text-[10px] text-slate-500">Nurse, MD, Tech</div>
                </div>
              </button>

              <button
                type="button"
                on:click={() => (role = 'employer')}
                class="p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-3 {role === 'employer' ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'}"
              >
                <div class="w-8 h-8 rounded-lg {role === 'employer' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center shrink-0">
                  <Building2 class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900">Employer</div>
                  <div class="text-[10px] text-slate-500">Hospital, Clinic</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Full Name -->
          <div>
            <label for="auth-name" class="block text-xs font-semibold text-slate-700 mb-1">
              {role === 'candidate' ? 'Full Legal / Clinical Name' : 'Recruiter / Contact Name'} *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserIcon class="w-4 h-4" />
              </div>
              <input
                id="auth-name"
                type="text"
                bind:value={name}
                required
                placeholder={role === 'candidate' ? 'e.g. Elena Rostova, RN' : 'e.g. Marcus Vance'}
                class="w-full pl-9 pr-3.5 py-2.2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        {/if}

        <!-- Email -->
        <div>
          <label for="auth-email" class="block text-xs font-semibold text-slate-700 mb-1">
            {role === 'candidate' ? 'Professional Email' : 'Work / Organization Email'} *
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail class="w-4 h-4" />
            </div>
            <input
              id="auth-email"
              type="email"
              bind:value={email}
              required
              placeholder={role === 'candidate' ? 'nurse.jenkins@hospital.org' : 'recruiting@carehealth.com'}
              class="w-full pl-9 pr-3.5 py-2.2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="auth-password" class="block text-xs font-semibold text-slate-700">Password *</label>
            {#if mode === 'login'}
              <span class="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer">
                Demo password: <code class="bg-blue-50 px-1 py-0.5 rounded font-mono">pulse123</code>
              </span>
            {/if}
          </div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock class="w-4 h-4" />
            </div>
            {#if showPassword}
              <input
                id="auth-password"
                type="text"
                bind:value={password}
                required
                placeholder="••••••••"
                class="w-full pl-9 pr-10 py-2.2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            {:else}
              <input
                id="auth-password"
                type="password"
                bind:value={password}
                required
                placeholder="••••••••"
                class="w-full pl-9 pr-10 py-2.2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            {/if}
            <button
              type="button"
              on:click={() => (showPassword = !showPassword)}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              tabindex="-1"
            >
              {#if showPassword}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>
          </div>
        </div>

        <!-- Candidate Specific Fields on Signup -->
        {#if mode === 'signup' && role === 'candidate'}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label for="auth-license" class="block text-xs font-semibold text-slate-700 mb-1">
                Clinical License #
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Award class="w-4 h-4" />
                </div>
                <input
                  id="auth-license"
                  type="text"
                  bind:value={clinicalLicenseNumber}
                  placeholder="e.g. RN-994821-NY"
                  class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label for="auth-specialty" class="block text-xs font-semibold text-slate-700 mb-1">
                Primary Specialty
              </label>
              <select
                id="auth-specialty"
                bind:value={specialty}
                class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                {#each SPECIALTY_OPTIONS as spec}
                  <option value={spec}>{spec}</option>
                {/each}
              </select>
            </div>
          </div>
        {/if}

        <!-- Employer Specific Fields on Signup -->
        {#if mode === 'signup' && role === 'employer'}
          <div class="space-y-3 pt-1">
            <div>
              <label for="auth-org" class="block text-xs font-semibold text-slate-700 mb-1">
                Healthcare Organization / Health System Name *
              </label>
              <input
                id="auth-org"
                type="text"
                bind:value={organization}
                required
                placeholder="e.g. Mayo Clinic Network or CareHealth Telemedicine"
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label for="auth-title" class="block text-xs font-semibold text-slate-700 mb-1">
                Your Title / Hiring Role
              </label>
              <input
                id="auth-title"
                type="text"
                bind:value={title}
                placeholder="e.g. Director of Clinical Talent Acquisition"
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>
        {/if}

        <!-- Submit Button -->
        <div class="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full py-2.8 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:opacity-95 shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {#if isSubmitting}
              <Loader2 class="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            {:else}
              <span>{mode === 'login' ? 'Sign In to Portal' : 'Create Verified Account'}</span>
              <ArrowRight class="w-4 h-4" />
            {/if}
          </button>
        </div>

        <!-- Footer switch mode note -->
        <div class="pt-1 text-center text-xs text-slate-500">
          {#if mode === 'login'}
            Don't have an account yet?
            <button
              type="button"
              on:click={() => { mode = 'signup'; errorMessage = ''; }}
              class="text-blue-600 font-bold hover:underline cursor-pointer ml-1"
            >
              Create Account
            </button>
          {:else}
            Already registered on PulseCareers?
            <button
              type="button"
              on:click={() => { mode = 'login'; errorMessage = ''; }}
              class="text-blue-600 font-bold hover:underline cursor-pointer ml-1"
            >
              Sign In
            </button>
          {/if}
        </div>
      </form>
    </div>
  </div>
{/if}
