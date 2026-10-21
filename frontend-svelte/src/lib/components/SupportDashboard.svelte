<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import {
    ArrowLeft,
    ArrowUpRight,
    Check,
    Clock3,
    Headset,
    Inbox,
    LifeBuoy,
    LoaderCircle,
    MessageSquareText,
    Plus,
    Search,
    Send,
    ShieldCheck,
    TicketCheck,
    X
  } from 'lucide-svelte';
  import { authToken, currentUser } from '../stores';
  import { ApiService } from '../api';
  import type { SupportTicket, SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '../types';

  export let adminView = false;

  const dispatch = createEventDispatcher();
  const categories: SupportTicketCategory[] = [
    'Account access',
    'Applications',
    'Job listings',
    'Employer support',
    'Other'
  ];
  const statuses: SupportTicketStatus[] = ['open', 'in_progress', 'resolved'];
  const statusFilters: { id: 'all' | SupportTicketStatus; label: string }[] = [
    { id: 'all', label: 'All requests' },
    { id: 'open', label: 'Open' },
    { id: 'in_progress', label: 'In progress' },
    { id: 'resolved', label: 'Resolved' }
  ];

  let tickets: SupportTicket[] = [];
  let activeTicket: SupportTicket | null = null;
  let statusFilter: 'all' | SupportTicketStatus = 'all';
  let searchTerm = '';
  let subject = '';
  let category: SupportTicketCategory = 'Account access';
  let priority: SupportTicketPriority = 'normal';
  let message = '';
  let chatMessage = '';
  let replyStatus: SupportTicketStatus = 'in_progress';
  let isLoading = true;
  let isSubmitting = false;
  let isSendingMessage = false;
  let isSavingStatus = false;
  let errorMessage = '';
  let successMessage = '';

  $: isAuthorizedAdmin = $currentUser?.role === 'admin';
  $: visibleTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const query = searchTerm.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [ticket.id, ticket.subject, ticket.customerName, ticket.customerEmail]
        .some((value) => value.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });
  $: openCount = tickets.filter((ticket) => ticket.status === 'open').length;
  $: inProgressCount = tickets.filter((ticket) => ticket.status === 'in_progress').length;
  $: resolvedCount = tickets.filter((ticket) => ticket.status === 'resolved').length;

  function close() {
    dispatch('close');
  }

  function getStatusLabel(status: SupportTicketStatus): string {
    return status === 'in_progress' ? 'In progress' : status === 'resolved' ? 'Resolved' : 'Open';
  }

  function selectStatusFilter(status: 'all' | SupportTicketStatus) {
    statusFilter = status;
  }

  function formatDate(date: string): string {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  function formatMessageDate(date: string): string {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date));
  }

  async function loadTickets(showLoading = true) {
    if (!$authToken) {
      tickets = [];
      isLoading = false;
      return;
    }
    if (showLoading) {
      isLoading = true;
      errorMessage = '';
    }
    try {
      const refreshed = await ApiService.getSupportTickets($authToken);
      tickets = refreshed;
      if (activeTicket) {
        activeTicket = refreshed.find((ticket) => ticket.id === activeTicket?.id) || null;
      }
    } catch (error) {
      if (showLoading) {
        errorMessage = error instanceof Error ? error.message : 'Could not load support requests.';
      }
    } finally {
      if (showLoading) isLoading = false;
    }
  }

  async function submitTicket() {
    if (!$authToken) return;
    isSubmitting = true;
    errorMessage = '';
    successMessage = '';
    try {
      const ticket = await ApiService.createSupportTicket($authToken, {
        subject,
        category,
        priority,
        message
      });
      tickets = [ticket, ...tickets];
      activeTicket = ticket;
      subject = '';
      category = 'Account access';
      priority = 'normal';
      message = '';
      successMessage = `Request ${ticket.id} was sent to our support team.`;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Could not submit your request.';
    } finally {
      isSubmitting = false;
    }
  }

  function selectTicket(ticket: SupportTicket) {
    activeTicket = ticket;
    chatMessage = '';
    replyStatus = ticket.status === 'open' ? 'in_progress' : ticket.status;
    errorMessage = '';
    successMessage = '';
  }

  async function sendMessage() {
    if (!$authToken || !activeTicket || !chatMessage.trim()) return;
    isSendingMessage = true;
    errorMessage = '';
    successMessage = '';
    try {
      const updated = await ApiService.sendSupportMessage($authToken, activeTicket.id, chatMessage.trim());
      tickets = tickets.map((ticket) => ticket.id === updated.id ? updated : ticket);
      activeTicket = updated;
      chatMessage = '';
      replyStatus = updated.status;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Could not send the chat message.';
    } finally {
      isSendingMessage = false;
    }
  }

  async function saveStatus() {
    if (!$authToken || !activeTicket) return;
    isSavingStatus = true;
    errorMessage = '';
    successMessage = '';
    try {
      const updated = await ApiService.updateSupportTicket($authToken, activeTicket.id, {
        status: replyStatus
      });
      tickets = tickets.map((ticket) => ticket.id === updated.id ? updated : ticket);
      activeTicket = updated;
      successMessage = 'Support request updated.';
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Could not update the request.';
    } finally {
      isSavingStatus = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') close();
  }

  onMount(() => {
    void loadTickets();
    const refreshInterval = window.setInterval(() => void loadTickets(false), 5000);
    return () => window.clearInterval(refreshInterval);
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if adminView}
  <main class="min-h-[calc(100vh-76px)] bg-[#f6f8f7]">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {#if !isAuthorizedAdmin}
        <section class="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck class="mx-auto h-10 w-10 text-rose-600" />
          <h1 class="mt-4 text-xl font-bold text-slate-950">Administrator access required</h1>
          <p class="mt-2 text-sm leading-6 text-slate-600">This support dashboard is only available to server-configured administrators.</p>
          <button type="button" on:click={close} class="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">Return to jobs</button>
        </section>
      {:else}
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <button type="button" on:click={close} class="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-emerald-800">
              <ArrowLeft class="h-4 w-4" />
              Back to marketplace
            </button>
            <div class="flex items-center gap-3">
              <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><Headset class="h-6 w-6" /></span>
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Support operations</p>
                <h1 class="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Customer support</h1>
              </div>
            </div>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Review customer requests, send a response, and keep each issue moving to resolution.</p>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            Secure administrator view
          </div>
        </div>

        <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between text-sm font-semibold text-slate-500"><span>Open requests</span><Inbox class="h-4 w-4 text-amber-600" /></div>
            <p class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{openCount}</p>
          </div>
          <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between text-sm font-semibold text-slate-500"><span>In progress</span><Clock3 class="h-4 w-4 text-sky-700" /></div>
            <p class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{inProgressCount}</p>
          </div>
          <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between text-sm font-semibold text-slate-500"><span>Resolved</span><TicketCheck class="h-4 w-4 text-emerald-700" /></div>
            <p class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{resolvedCount}</p>
          </div>
        </div>

        {#if errorMessage}
          <div role="alert" class="mb-5 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <span>{errorMessage}</span>
            <button type="button" on:click={loadTickets} class="shrink-0 font-bold underline">Retry</button>
          </div>
        {/if}
        {#if successMessage}
          <p role="status" class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{successMessage}</p>
        {/if}

        <div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div class="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {#each statusFilters as filter}
                  <button
                    type="button"
                    on:click={() => selectStatusFilter(filter.id)}
                    class="rounded-lg px-3 py-2 text-xs font-semibold transition {statusFilter === filter.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}"
                  >{filter.label}</button>
                {/each}
              </div>
              <label class="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <Search class="h-4 w-4 text-slate-400" />
                <span class="sr-only">Search requests</span>
                <input bind:value={searchTerm} placeholder="Search requests" class="w-full border-0 p-0 text-xs focus:outline-none focus:ring-0 sm:w-40" />
              </label>
            </div>

            {#if isLoading}
              <div class="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><LoaderCircle class="h-4 w-4 animate-spin" />Loading support requests…</div>
            {:else if visibleTickets.length === 0}
              <div class="px-6 py-14 text-center">
                <Inbox class="mx-auto h-9 w-9 text-slate-300" />
                <h2 class="mt-3 text-sm font-bold text-slate-800">No requests to show</h2>
                <p class="mt-1 text-xs text-slate-500">New customer requests will appear here.</p>
              </div>
            {:else}
              <div class="divide-y divide-slate-100">
                {#each visibleTickets as ticket (ticket.id)}
                  <button
                    type="button"
                    on:click={() => selectTicket(ticket)}
                    class="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5"
                  >
                    <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><MessageSquareText class="h-4 w-4" /></span>
                    <span class="min-w-0 flex-1">
                      <span class="flex flex-wrap items-center gap-2">
                        <span class="truncate text-sm font-bold text-slate-900">{ticket.subject}</span>
                        <span class="rounded-full px-2 py-0.5 text-[10px] font-bold {ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-800' : ticket.status === 'in_progress' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'}">{getStatusLabel(ticket.status)}</span>
                      </span>
                      <span class="mt-1 block truncate text-xs text-slate-500">{ticket.customerName} · {ticket.customerEmail}</span>
                      <span class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                        <span>{ticket.id}</span><span>{ticket.category}</span><span>{formatDate(ticket.updatedAt)}</span>
                        {#if ticket.priority === 'high'}<span class="font-bold text-rose-700">High priority</span>{/if}
                      </span>
                    </span>
                    <ArrowUpRight class="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                {/each}
              </div>
            {/if}
          </section>

          <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            {#if activeTicket}
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{activeTicket.id}</p>
                  <h2 class="mt-2 text-lg font-bold leading-snug text-slate-950">{activeTicket.subject}</h2>
                </div>
                <button type="button" on:click={() => activeTicket = null} aria-label="Close request details" class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X class="h-4 w-4" /></button>
              </div>
              <div class="mt-4 rounded-xl bg-slate-50 p-3.5">
                <p class="text-xs font-bold text-slate-800">{activeTicket.customerName}</p>
                <p class="mt-0.5 text-xs text-slate-500">{activeTicket.customerEmail}</p>
                <p class="mt-2 text-[11px] text-slate-400">{activeTicket.category} · {activeTicket.priority} priority · {formatDate(activeTicket.createdAt)}</p>
              </div>
              <div class="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                <div class="mb-3 flex items-center justify-between">
                  <h3 class="flex items-center gap-2 text-xs font-bold text-slate-800"><MessageSquareText class="h-4 w-4 text-emerald-700" />Conversation</h3>
                  <span class="text-[10px] text-slate-400">Live updates</span>
                </div>
                <div class="max-h-80 space-y-3 overflow-y-auto pr-1" role="log" aria-label="Support conversation" aria-live="polite">
                  {#each activeTicket.messages as item (item.id)}
                    {@const isOwnMessage = item.senderId === $currentUser?.id}
                    <div class="flex {isOwnMessage ? 'justify-end' : 'justify-start'}">
                      <div class="max-w-[90%] rounded-2xl px-3.5 py-2.5 {isOwnMessage ? 'rounded-br-md bg-emerald-700 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}">
                        <div class="mb-1 flex items-center gap-2 text-[10px] {isOwnMessage ? 'text-emerald-100' : 'text-slate-400'}">
                          <span class="font-bold">{item.senderName}</span>
                          <span>·</span>
                          <time datetime={item.createdAt}>{formatMessageDate(item.createdAt)}</time>
                        </div>
                        <p class="whitespace-pre-wrap break-words text-xs leading-5">{item.body}</p>
                      </div>
                    </div>
                  {/each}
                </div>
                <form on:submit|preventDefault={sendMessage} class="mt-3 flex items-end gap-2 border-t border-slate-200 pt-3">
                  <label class="sr-only" for="admin-chat-message">Write a reply</label>
                  <textarea
                    id="admin-chat-message"
                    bind:value={chatMessage}
                    rows="2"
                    maxlength="5000"
                    placeholder="Write a reply to the customer…"
                    class="min-h-11 flex-1 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs leading-5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  ></textarea>
                  <button type="submit" disabled={isSendingMessage || !chatMessage.trim()} aria-label="Send reply" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                    {#if isSendingMessage}<LoaderCircle class="h-4 w-4 animate-spin" />{:else}<Send class="h-4 w-4" />{/if}
                  </button>
                </form>
              </div>
              <form on:submit|preventDefault={saveStatus} class="mt-4 flex items-end gap-2 border-t border-slate-100 pt-4">
                <label class="block text-xs font-bold text-slate-700">
                  Request status
                  <select bind:value={replyStatus} class="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600">
                    {#each statuses as status}<option value={status}>{getStatusLabel(status)}</option>{/each}
                  </select>
                </label>
                <button type="submit" disabled={isSavingStatus} class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                  {#if isSavingStatus}<LoaderCircle class="h-4 w-4 animate-spin" />{:else}<Check class="h-4 w-4" />{/if}
                  Update status
                </button>
              </form>
            {:else}
              <div class="flex min-h-64 flex-col items-center justify-center text-center">
                <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><MessageSquareText class="h-5 w-5" /></span>
                <h2 class="mt-4 text-sm font-bold text-slate-800">Select a support request</h2>
                <p class="mt-1 max-w-xs text-xs leading-5 text-slate-500">Review the conversation and send a response from here.</p>
              </div>
            {/if}
          </section>
        </div>
      {/if}
    </div>
  </main>
{:else}
  <div class="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6" role="presentation" on:click={(event) => event.target === event.currentTarget && close()}>
    <section class="relative mx-auto my-3 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl sm:my-8" role="dialog" aria-modal="true" aria-labelledby="support-title">
      <div class="flex items-start justify-between gap-4 bg-slate-950 px-5 py-6 text-white sm:px-8">
        <div class="flex items-start gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300"><LifeBuoy class="h-5 w-5" /></span>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">PulseCareers help desk</p>
            <h1 id="support-title" class="mt-1 text-xl font-bold tracking-tight sm:text-2xl">How can we help?</h1>
            <p class="mt-1 max-w-lg text-xs leading-5 text-slate-300">Send our team a request and follow its status here. Please don't include patient or other sensitive health information.</p>
          </div>
        </div>
        <button type="button" on:click={close} aria-label="Close support" class="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"><X class="h-5 w-5" /></button>
      </div>

      <div class="grid gap-6 p-5 sm:p-8 md:grid-cols-[1fr_0.92fr]">
        {#if !$currentUser || !$authToken}
          <div class="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
            <ShieldCheck class="mx-auto h-7 w-7 text-amber-700" />
            <h2 class="mt-3 text-sm font-bold text-amber-950">Sign in to contact support</h2>
            <p class="mt-1 text-xs leading-5 text-amber-800">Your account details help our team investigate and follow up on your request.</p>
            <button type="button" on:click={() => dispatch('openLogin')} class="mt-4 rounded-xl bg-amber-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-800">Sign in</button>
          </div>
        {:else}
          <form on:submit|preventDefault={submitTicket} class="space-y-4">
            <div>
              <label for="support-subject" class="block text-xs font-bold text-slate-700">What do you need help with?</label>
              <input id="support-subject" bind:value={subject} required minlength="4" maxlength="120" placeholder="A short summary" class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <label class="block text-xs font-bold text-slate-700">Category
                <select bind:value={category} class="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600">
                  {#each categories as item}<option value={item}>{item}</option>{/each}
                </select>
              </label>
              <label class="block text-xs font-bold text-slate-700">Priority
                <select bind:value={priority} class="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-emerald-600">
                  <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
                </select>
              </label>
            </div>
            <label class="block text-xs font-bold text-slate-700">Details
              <textarea bind:value={message} required minlength="10" maxlength="5000" rows="5" placeholder="Tell us what happened and what you were trying to do…" class="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal leading-5 focus:outline-none focus:ring-2 focus:ring-emerald-600"></textarea>
            </label>
            {#if errorMessage}<p role="alert" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800">{errorMessage}</p>{/if}
            {#if successMessage}<p role="status" class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">{successMessage}</p>{/if}
            <button type="submit" disabled={isSubmitting} class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
              {#if isSubmitting}<LoaderCircle class="h-4 w-4 animate-spin" />{:else}<Plus class="h-4 w-4" />{/if}
              Submit support request
            </button>
            <p class="text-center text-[10px] leading-4 text-slate-400">Requests are linked to {$currentUser.email} and visible to the support team.</p>
          </form>

          <section class="border-t border-slate-100 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold text-slate-900">Your requests</h2>
                <p class="mt-1 text-[11px] text-slate-500">Updates from the support team appear here.</p>
              </div>
              <button type="button" on:click={loadTickets} aria-label="Refresh requests" class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-800"><ArrowUpRight class="h-4 w-4" /></button>
            </div>
            {#if isLoading}
              <div class="flex items-center gap-2 py-8 text-xs text-slate-500"><LoaderCircle class="h-4 w-4 animate-spin" />Loading your requests…</div>
            {:else if tickets.length === 0}
              <div class="py-10 text-center">
                <TicketCheck class="mx-auto h-7 w-7 text-slate-300" />
                <p class="mt-2 text-xs font-semibold text-slate-600">No requests yet</p>
                <p class="mt-1 text-[10px] text-slate-400">Your submitted requests will be listed here.</p>
              </div>
            {:else}
              <div class="mt-4 space-y-2.5">
                {#each tickets as ticket (ticket.id)}
                  <article class="rounded-xl border border-slate-200 p-3.5">
                    <div class="flex items-start justify-between gap-2">
                      <h3 class="text-xs font-bold leading-5 text-slate-800">{ticket.subject}</h3>
                      <span class="shrink-0 rounded-full px-2 py-1 text-[9px] font-bold {ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-800' : ticket.status === 'in_progress' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'}">{getStatusLabel(ticket.status)}</span>
                    </div>
                    <p class="mt-1 text-[10px] text-slate-400">{ticket.id} · {formatDate(ticket.updatedAt)}</p>
                    <button
                      type="button"
                      on:click={() => activeTicket?.id === ticket.id ? activeTicket = null : selectTicket(ticket)}
                      class="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                    >
                      <MessageSquareText class="h-3.5 w-3.5" />
                      {activeTicket?.id === ticket.id ? 'Close conversation' : `Open conversation (${ticket.messages.length})`}
                    </button>
                    {#if activeTicket?.id === ticket.id}
                      <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <div class="max-h-64 space-y-3 overflow-y-auto" role="log" aria-label={`Conversation for ${ticket.subject}`} aria-live="polite">
                          {#each activeTicket.messages as item (item.id)}
                            {@const isOwnMessage = item.senderId === $currentUser?.id}
                            <div class="flex {isOwnMessage ? 'justify-end' : 'justify-start'}">
                              <div class="max-w-[90%] rounded-2xl px-3 py-2.5 {isOwnMessage ? 'rounded-br-md bg-emerald-700 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}">
                                <div class="mb-1 flex items-center gap-2 text-[9px] {isOwnMessage ? 'text-emerald-100' : 'text-slate-400'}">
                                  <span class="font-bold">{item.senderName}</span>
                                  <span>·</span>
                                  <time datetime={item.createdAt}>{formatMessageDate(item.createdAt)}</time>
                                </div>
                                <p class="whitespace-pre-wrap break-words text-xs leading-5">{item.body}</p>
                              </div>
                            </div>
                          {/each}
                        </div>
                        <form on:submit|preventDefault={sendMessage} class="mt-3 flex items-end gap-2 border-t border-slate-200 pt-3">
                          <label class="sr-only" for="customer-chat-message">Write a message</label>
                          <textarea
                            id="customer-chat-message"
                            bind:value={chatMessage}
                            rows="2"
                            maxlength="5000"
                            placeholder="Reply to the support team…"
                            class="min-h-10 flex-1 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs leading-5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          ></textarea>
                          <button type="submit" disabled={isSendingMessage || !chatMessage.trim()} aria-label="Send message" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                            {#if isSendingMessage}<LoaderCircle class="h-4 w-4 animate-spin" />{:else}<Send class="h-4 w-4" />{/if}
                          </button>
                        </form>
                      </div>
                    {/if}
                  </article>
                {/each}
              </div>
            {/if}
          </section>
        {/if}
      </div>
    </section>
  </div>
{/if}
