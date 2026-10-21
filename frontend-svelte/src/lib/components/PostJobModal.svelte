<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { X, PlusCircle, Sparkles, Building2, ShieldCheck, DollarSign, HeartHandshake, LoaderCircle } from 'lucide-svelte';
  import { ApiService } from '../api';
  import { authToken, currentUser } from '../stores';

  interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    method: { upi?: boolean; netbanking?: boolean };
    prefill: { name: string; email: string };
    theme: { color: string };
    handler: (payment: RazorpayPaymentResponse) => void;
    modal: { ondismiss: () => void };
  }

  interface RazorpayCheckout {
    open(): void;
    on(event: 'payment.failed', handler: (response: { error?: { description?: string } }) => void): void;
  }

  declare global {
    interface Window {
      Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
    }
  }

  const dispatch = createEventDispatcher();
  let razorpayScriptPromise: Promise<void> | undefined;

  let title = '';
  let companyName = $currentUser?.organization || '';
  let category = 'Nursing';
  let workplaceType: 'Remote' | 'On-site' | 'Hybrid' = 'Remote';
  let type = 'Full-time';
  let location = 'Remote (US)';
  let salaryMin: number | undefined = 110000;
  let salaryMax: number | undefined = 145000;
  let description = '';
  let applicationEmailOrUrl = '';
  let contactEmail = $currentUser?.email || '';
  let isSubmitting = false;
  let errorMessage = '';
  let paymentEnabled = false;
  let paymentConfigMessage = '';
  let contributeToPortal = false;
  let contributionAmount = 500;
  let paymentOrderId = '';
  let paymentMethod: 'upi' | 'netbanking' = 'upi';

  onMount(() => {
    void loadPaymentConfig();
  });

  const categories = [
    'Nursing',
    'Clinical Research & Life Sciences',
    'Physicians & Surgeons',
    'Telehealth & Digital Health',
    'Health Informatics & Medical Coding',
    'Pharmacy & Pharmacology',
    'Mental & Behavioral Health',
    'Allied Health'
  ];

  function close() {
    dispatch('close');
  }

  async function loadPaymentConfig() {
    try {
      const config = await ApiService.getRazorpayConfig();
      paymentEnabled = config.enabled;
      if (!config.enabled) {
        paymentConfigMessage = 'Optional Razorpay contributions are not configured. You can still post your job for free.';
      }
    } catch (error) {
      paymentConfigMessage = error instanceof Error
        ? `${error.message} Free job posting is still available.`
        : 'Could not check Razorpay availability. Free job posting is still available.';
    }
  }

  function loadRazorpayScript(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();
    if (razorpayScriptPromise) return razorpayScriptPromise;

    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        razorpayScriptPromise = undefined;
        reject(new Error('Could not load Razorpay Checkout. You can still publish this job for free.'));
      };
      document.head.appendChild(script);
    });
    return razorpayScriptPromise;
  }

  async function openRazorpayCheckout(order: { id: string; amount: number; currency: string }, keyId: string): Promise<string> {
    await loadRazorpayScript();
    if (!window.Razorpay) {
      throw new Error('Razorpay Checkout did not initialize. You can still publish this job for free.');
    }
    if (!$currentUser || !$authToken) {
      throw new Error('Sign in to your employer account before making an optional contribution.');
    }

    return new Promise((resolve, reject) => {
      let isSettled = false;
      const fail = (message: string) => {
        if (!isSettled) {
          isSettled = true;
          reject(new Error(message));
        }
      };
      const checkout = new window.Razorpay!({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'PulseCareers',
        description: 'Optional contribution for your job post',
        order_id: order.id,
        method: {
          upi: paymentMethod === 'upi',
          netbanking: paymentMethod === 'netbanking'
        },
        prefill: { name: $currentUser.name, email: $currentUser.email },
        theme: { color: '#047857' },
        handler: (payment) => {
          void ApiService.verifyRazorpayPayment($authToken!, payment).then(() => {
            if (!isSettled) {
              isSettled = true;
              resolve(order.id);
            }
          }).catch((error: unknown) => {
            fail(error instanceof Error ? error.message : 'Payment verification failed. Please contact support before retrying.');
          });
        },
        modal: { ondismiss: () => fail('Checkout was closed. Your job can still be posted for free.') }
      });
      checkout.on('payment.failed', (response) => {
        fail(response.error?.description || 'Payment did not complete. You can still post your job for free.');
      });
      checkout.open();
    });
  }

  async function publishJob(verifiedPaymentOrderId?: string) {
    const payload = {
      title,
      companyName,
      category,
      workplaceType,
      type,
      location,
      salaryMin,
      salaryMax,
      salaryCurrency: 'USD',
      description,
      applicationEmailOrUrl,
      contactEmail: contactEmail || applicationEmailOrUrl,
      requirements: ['Valid clinical credentials or healthcare background', 'Collaborative mindset'],
      benefits: ['Competitive compensation', 'Comprehensive healthcare benefits', 'Flexible scheduling']
    };
    const res = await ApiService.postJob(payload, $authToken || undefined, verifiedPaymentOrderId);
    dispatch('success', res.message || 'Job published! n8n automated broadcast has been triggered.');
    close();
  }

  async function handleSubmit() {
    if (!title.trim() || !companyName.trim() || !description.trim() || !applicationEmailOrUrl.trim()) {
      errorMessage = 'Please complete all required fields.';
      return;
    }

    isSubmitting = true;
    errorMessage = '';

    try {
      let verifiedOrderId = paymentOrderId;
      if (contributeToPortal && !verifiedOrderId) {
        if (!$currentUser || $currentUser.role !== 'employer' || !$authToken) {
          throw new Error('Sign in to a verified employer account to make a contribution. Posting without payment is free.');
        }
        if (!Number.isFinite(contributionAmount) || contributionAmount < 1 || contributionAmount > 1_000_000) {
          throw new Error('Enter an optional contribution between ₹1 and ₹10,00,000.');
        }
        const { order, keyId } = await ApiService.createRazorpayOrder($authToken, contributionAmount);
        verifiedOrderId = await openRazorpayCheckout(order, keyId);
        paymentOrderId = verifiedOrderId;
      }
      await publishJob(verifiedOrderId || undefined);
    } catch (e: any) {
      errorMessage = e.message || 'Failed to post job.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
  <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-fade-in">
    <!-- Header -->
    <div class="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 text-white flex items-start justify-between">
      <div>
        <div class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
          <Sparkles class="w-3.5 h-3.5 text-amber-300" />
          <span>Employer Portal • Automated n8n Broadcast</span>
        </div>
        <h2 class="text-xl font-bold mt-1.5">Post a Healthcare Opportunity</h2>
        <p class="text-xs text-blue-100 mt-0.5">Reach verified nurses, physicians, and digital health specialists.</p>
      </div>
      <button
        type="button"
        on:click={close}
        class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Close modal"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Body -->
    <form on:submit|preventDefault={handleSubmit} class="p-6 overflow-y-auto space-y-4 text-sm text-slate-800">
      {#if errorMessage}
        <div class="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
          {errorMessage}
        </div>
      {/if}

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="post-title" class="block text-xs font-bold text-slate-600 mb-1">Job Title *</label>
          <input
            id="post-title"
            type="text"
            required
            bind:value={title}
            placeholder="e.g. Telehealth Nurse Practitioner (FNP)"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
        <div>
          <label for="post-company" class="block text-xs font-bold text-slate-600 mb-1">Healthcare Organization *</label>
          <input
            id="post-company"
            type="text"
            required
            bind:value={companyName}
            placeholder="e.g. Mercy Virtual Care Clinic"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label for="post-category" class="block text-xs font-bold text-slate-600 mb-1">Specialty *</label>
          <select
            id="post-category"
            bind:value={category}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            {#each categories as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="post-workplace" class="block text-xs font-bold text-slate-600 mb-1">Workplace Mode</label>
          <select
            id="post-workplace"
            bind:value={workplaceType}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
        <div>
          <label for="post-type" class="block text-xs font-bold text-slate-600 mb-1">Employment Type</label>
          <select
            id="post-type"
            bind:value={type}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Per Diem">Per Diem</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label for="post-location" class="block text-xs font-bold text-slate-600 mb-1">Location</label>
          <input
            id="post-location"
            type="text"
            bind:value={location}
            placeholder="e.g. Remote (US) or Austin, TX"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
        <div>
          <label for="post-min-sal" class="block text-xs font-bold text-slate-600 mb-1">Min Salary ($/yr)</label>
          <input
            id="post-min-sal"
            type="number"
            step="1000"
            bind:value={salaryMin}
            placeholder="110000"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
        <div>
          <label for="post-max-sal" class="block text-xs font-bold text-slate-600 mb-1">Max Salary ($/yr)</label>
          <input
            id="post-max-sal"
            type="number"
            step="1000"
            bind:value={salaryMax}
            placeholder="145000"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          />
        </div>
      </div>

      <div>
        <label for="post-apply-url" class="block text-xs font-bold text-slate-600 mb-1">Application URL or Email *</label>
        <input
          id="post-apply-url"
          type="text"
          required
          bind:value={applicationEmailOrUrl}
          placeholder="https://company.com/apply or jobs@hospital.org"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
        />
      </div>

      <div>
        <label for="post-desc" class="block text-xs font-bold text-slate-600 mb-1">Detailed Description *</label>
        <textarea
          id="post-desc"
          rows="4"
          required
          bind:value={description}
          placeholder="Provide clinical responsibilities, licensure requirements, patient caseload, and shift details..."
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-medium"
        ></textarea>
      </div>

      {#if paymentEnabled && $currentUser?.role === 'employer' && $authToken}
        <section class="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
          {#if paymentOrderId}
            <div class="flex items-start gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white"><ShieldCheck class="h-4 w-4" /></span>
              <div>
                <p class="text-sm font-bold text-emerald-950">Contribution verified</p>
                <p class="mt-1 text-xs leading-5 text-emerald-800">Your Razorpay payment is verified. Publish the job to complete your post.</p>
              </div>
            </div>
          {:else}
            <label class="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                bind:checked={contributeToPortal}
                disabled={isSubmitting || Boolean(paymentOrderId)}
                class="mt-0.5 h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span>
                <span class="flex items-center gap-2 text-sm font-bold text-emerald-950">
                  <HeartHandshake class="h-4 w-4" />
                  Make an optional contribution
                </span>
                <span class="mt-1 block text-xs leading-5 text-emerald-800">Job postings are free. Contribute any amount in INR via Razorpay to support the platform; payment does not change listing placement.</span>
              </span>
            </label>
            {#if contributeToPortal}
              <fieldset class="mt-4">
                <legend class="mb-2 block text-xs font-bold text-emerald-900">Payment method</legend>
                <div class="grid gap-2 sm:grid-cols-2">
                  <label class="flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700">
                    <input type="radio" name="contribution-method" value="upi" bind:group={paymentMethod} class="h-4 w-4 text-emerald-700 focus:ring-emerald-600" />
                    UPI
                  </label>
                  <label class="flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700">
                    <input type="radio" name="contribution-method" value="netbanking" bind:group={paymentMethod} class="h-4 w-4 text-emerald-700 focus:ring-emerald-600" />
                    Bank account (Netbanking)
                  </label>
                </div>
              </fieldset>
              <label for="post-contribution" class="mt-4 block text-xs font-bold text-emerald-900">Contribution amount (INR)</label>
              <div class="mt-1.5 flex max-w-xs items-center rounded-xl border border-emerald-200 bg-white px-3">
                <span class="pr-2 text-sm font-semibold text-slate-500">₹</span>
                <input
                  id="post-contribution"
                  type="number"
                  required
                  disabled={isSubmitting}
                  min="1"
                  max="1000000"
                  step="0.01"
                  bind:value={contributionAmount}
                  class="w-full border-0 px-0 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-0"
                  aria-describedby="contribution-limit"
                />
              </div>
              <p id="contribution-limit" class="mt-1.5 text-[10px] text-emerald-800">Enter ₹1–₹10,00,000. Razorpay checkout will verify the payment before the job is published.</p>
            {/if}
          {/if}
        </section>
      {:else if paymentConfigMessage}
        <p class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-600">{paymentConfigMessage}</p>
      {:else if paymentEnabled && $currentUser?.role !== 'employer'}
        <p class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-600">Optional Razorpay contributions are available to signed-in employer accounts. Job postings remain free.</p>
      {/if}

      <div class="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
        <button
          type="button"
          on:click={close}
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-98"
        >
          {#if isSubmitting}
            <LoaderCircle class="w-3.5 h-3.5 animate-spin" />
            <span>{contributeToPortal && !paymentOrderId ? 'Opening secure checkout…' : 'Publishing...'}</span>
          {:else}
            {#if contributeToPortal && !paymentOrderId}
              <DollarSign class="w-3.5 h-3.5" />
              <span>Contribute & Publish</span>
            {:else}
              <PlusCircle class="w-3.5 h-3.5" />
              <span>{paymentOrderId ? 'Publish job' : 'Publish job for free'}</span>
            {/if}
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
