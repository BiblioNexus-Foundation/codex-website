<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import Features from '$lib/components/Features.svelte';
  import TranslationTools from '$lib/components/TranslationTools.svelte';
  import OpenSource from '$lib/components/OpenSource.svelte';
  import CallToAction from '$lib/components/CallToAction.svelte';
</script>

<svelte:head>
  <title>Codex Translation Editor</title>
  <meta name="description" content="Codex Translation Editor" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/codex-icon-2024.svg" />
  <link rel="canonical" href="https://codexeditor.app" />
  <meta name="og:title" content="Codex Translation Editor" />
  <meta
    name="og:description"
    content="Codex Translation Editor - AI-first translation editor"
  />
  <meta name="og:image" content="/codex-icon-2024.svg" />
  <meta name="og:url" content="https://codexeditor.app" />
  <meta name="og:site_name" content="Codex Translation Editor" />
  <meta name="og:locale" content="en_US" />
</svelte:head>

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
