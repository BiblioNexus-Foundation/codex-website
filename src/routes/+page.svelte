<script lang="ts">
  import ModeSwitcher from '$lib/components/ModeSwitcher.svelte';
  import Header from '$lib/components/Header.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import Features from '$lib/components/Features.svelte';
  import TranslationTools from '$lib/components/TranslationTools.svelte';
  import OpenSource from '$lib/components/OpenSource.svelte';
  import CallToAction from '$lib/components/CallToAction.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<Hero />
<Features />
<TranslationTools />
<OpenSource />
<CallToAction />

<style lang="postcss">
  .custom-style {
    @apply italic;
  }
</style>
