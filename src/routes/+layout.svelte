<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { onMount } from 'svelte';
  import { themeStore } from '$lib/themeStore';
  import '../app.postcss';

  onMount(() => {
    themeStore.initialize();
  });
</script>

<main class="flex flex-col space-y-8 p-4 md:p-8">
  <Header />
  <slot />
  <Footer />
</main>
