<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { onMount } from 'svelte';
  import { themeStore } from '$lib/themeStore';
  import '../app.postcss';

  let darkMode: boolean;

  themeStore.subscribe(value => {
    darkMode = value;
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
    }
  });

  onMount(() => {
    themeStore.initialize();
  });
</script>

<div class={darkMode ? 'dark' : ''}>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </div>
</div>

<style lang="postcss">
  :global(html) {
    @apply transition-colors duration-200;
  }
</style>