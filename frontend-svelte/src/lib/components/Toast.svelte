<script lang="ts">
  import { CheckCircle2, AlertCircle, X } from 'lucide-svelte';

  export let message: string = '';
  export let type: 'success' | 'error' = 'success';
  export let onDismiss: () => void;
</script>

{#if message}
  <div class="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-in">
    <div class="rounded-2xl p-4 shadow-xl border flex items-start space-x-3 {type === 'success' ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-900/30' : 'bg-rose-900 text-white border-rose-700 shadow-rose-900/30'}">
      {#if type === 'success'}
        <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      {:else}
        <AlertCircle class="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      {/if}

      <div class="flex-1 text-xs sm:text-sm font-medium leading-snug">
        {message}
      </div>

      <button
        type="button"
        on:click={onDismiss}
        class="text-white/60 hover:text-white transition-colors cursor-pointer"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
{/if}

<style>
  @keyframes bounceIn {
    0% { transform: translateY(100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  .animate-bounce-in {
    animation: bounceIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
