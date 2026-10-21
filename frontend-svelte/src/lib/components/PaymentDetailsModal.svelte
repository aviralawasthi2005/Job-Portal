<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { Building2, Check, CreditCard, LoaderCircle, ShieldCheck, X } from 'lucide-svelte';
  import { ApiService } from '../api';
  import { authToken } from '../stores';
  import type { PaymentDetails } from '../types';

  const dispatch = createEventDispatcher();
  let details: PaymentDetails = {
    upiId: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  };
  let isLoading = true;
  let isSaving = false;
  let errorMessage = '';
  let successMessage = '';

  onMount(() => {
    void loadDetails();
  });

  async function loadDetails() {
    if (!$authToken) {
      errorMessage = 'Sign in again to manage payment details.';
      isLoading = false;
      return;
    }
    try {
      details = await ApiService.getPaymentDetails($authToken);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Could not load payment details.';
    } finally {
      isLoading = false;
    }
  }

  async function saveDetails() {
    if (!$authToken) {
      errorMessage = 'Sign in again to save payment details.';
      return;
    }
    isSaving = true;
    errorMessage = '';
    successMessage = '';
    try {
      details = await ApiService.savePaymentDetails($authToken, details);
      successMessage = 'Your payment details are saved securely.';
      dispatch('success');
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Could not save payment details.';
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 backdrop-blur-sm sm:p-5">
  <section class="relative my-auto flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
    <header class="flex items-start justify-between bg-gradient-to-r from-emerald-800 to-teal-700 p-6 text-white">
      <div>
        <div class="inline-flex items-center gap-2 text-xs font-bold text-emerald-100">
          <ShieldCheck class="h-4 w-4" /> Private & encrypted
        </div>
        <h2 class="mt-1 text-xl font-extrabold">Payment details</h2>
        <p class="mt-1 text-xs leading-5 text-emerald-100">Save UPI or bank information for future payouts. Details are encrypted before storage.</p>
      </div>
      <button type="button" on:click={() => dispatch('close')} class="rounded-full p-2 text-white/90 hover:bg-white/15" aria-label="Close payment details">
        <X class="h-4 w-4" />
      </button>
    </header>

    <form on:submit|preventDefault={saveDetails} class="space-y-5 overflow-y-auto p-6">
      {#if errorMessage}
        <p role="alert" class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{errorMessage}</p>
      {/if}
      {#if successMessage}
        <p role="status" class="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <Check class="h-4 w-4" /> {successMessage}
        </p>
      {/if}
      {#if isLoading}
        <div class="flex items-center justify-center gap-2 py-10 text-sm font-medium text-slate-500">
          <LoaderCircle class="h-4 w-4 animate-spin" /> Loading saved details…
        </div>
      {:else}
        <fieldset disabled={isSaving} class="space-y-5 disabled:opacity-60">
          <div>
            <label for="payment-upi" class="mb-1.5 block text-xs font-bold text-slate-700">UPI ID</label>
            <input id="payment-upi" bind:value={details.upiId} autocomplete="off" placeholder="name@bank" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            <p class="mt-1 text-[11px] text-slate-500">Optional. Example: yourname@okbank</p>
          </div>

          <div class="border-t border-slate-100 pt-5">
            <div class="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Building2 class="h-4 w-4 text-emerald-700" /> Bank account
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="payment-holder" class="mb-1.5 block text-xs font-bold text-slate-700">Account holder name</label>
                <input id="payment-holder" bind:value={details.accountHolderName} autocomplete="name" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>
              <div>
                <label for="payment-bank" class="mb-1.5 block text-xs font-bold text-slate-700">Bank name</label>
                <input id="payment-bank" bind:value={details.bankName} autocomplete="off" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>
              <div>
                <label for="payment-account" class="mb-1.5 block text-xs font-bold text-slate-700">Account number</label>
                <input id="payment-account" type="password" bind:value={details.accountNumber} inputmode="numeric" autocomplete="off" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>
              <div>
                <label for="payment-ifsc" class="mb-1.5 block text-xs font-bold text-slate-700">IFSC code</label>
                <input id="payment-ifsc" bind:value={details.ifscCode} autocomplete="off" maxlength="11" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>
            </div>
            <p class="mt-3 text-[11px] leading-5 text-slate-500">All four bank fields are required when adding a bank account. Leave them blank to remove it.</p>
          </div>
        </fieldset>
      {/if}

      <footer class="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button type="button" on:click={() => dispatch('close')} class="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100">Close</button>
        <button type="submit" disabled={isLoading || isSaving} class="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
          {#if isSaving}<LoaderCircle class="h-3.5 w-3.5 animate-spin" /> Saving…{:else}<CreditCard class="h-3.5 w-3.5" /> Save details{/if}
        </button>
      </footer>
    </form>
  </section>
</div>
