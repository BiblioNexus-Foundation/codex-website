<script lang="ts">
  import ModeSwitcher from './lib/ModeSwitcher.svelte';
  import Header from './components/Header.svelte';
  import Hero from './components/Hero.svelte';
  import Features from './components/Features.svelte';
  import TranslationTools from './components/TranslationTools.svelte';
  import OpenSource from './components/OpenSource.svelte';
  import CallToAction from './components/CallToAction.svelte';
  import Footer from './components/Footer.svelte';
</script>

<ModeSwitcher />
<main class="flex flex-col space-y-8 p-4 md:p-8">
  <Header />
  <Hero />
  <Features />
  <TranslationTools />
  <OpenSource />
  <CallToAction />
  <Footer />
</main>

<style lang="postcss">
  .custom-style {
    @apply italic;
  }
</style>
