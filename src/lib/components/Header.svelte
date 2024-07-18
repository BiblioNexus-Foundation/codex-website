<script lang="ts">
  import Navigation from './Navigation.svelte';
  import ModeSwitcher from './ModeSwitcher.svelte';
  let isMenuOpen = false;
</script>

<header class="bg-white shadow-sm dark:bg-gray-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center py-4">
      <div class="flex items-center">
        <a href="/" class="flex-shrink-0">
          <img src="/bible-logo.png" class="h-8 w-auto sm:h-10" alt="BiblioNexus Logo" />
        </a>
        <nav class="hidden md:ml-10 md:flex md:space-x-8">
          <Navigation />
        </nav>
      </div>
      <div class="flex items-center">
        <ModeSwitcher />
        <div class="md:hidden ml-4">
          <button
            type="button"
            class="bg-white dark:bg-gray-800 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            on:click={() => (isMenuOpen = !isMenuOpen)}
          >
            <span class="sr-only">Open menu</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile menu, show/hide based on menu state. -->
  {#if isMenuOpen}
    <div class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <Navigation orientation="vertical" />
      </div>
    </div>
  {/if}
</header>