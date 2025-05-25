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

<div class="page-wrapper">
  <div class="hidden alert-banner">
    <div class="alert-content">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="alert-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        ></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <span
        >The Open VSX Marketplace is back online - <a
          href="/extensions"
          class="alert-link">You can still download extensions directly here</a
        ></span
      >
    </div>
  </div>

  <Hero />
  <Features />
  <TranslationTools />
  <OpenSource />
  <CallToAction />
</div>

<style lang="postcss">
  :global(body) {
    overflow-x: hidden;
    width: 100%;
  }

  :global(img) {
    max-width: 100%;
    height: auto;
  }

  .page-wrapper {
    overflow-x: hidden;
    width: 100%;
    position: relative;
  }

  .alert-banner {
    background: linear-gradient(-45deg, #ff6b6b, #ff9e40, #ffd166, #ff7e5f);
    background-size: 400% 400%;
    animation: gradient-shift 10s ease infinite;
    border-bottom: 1px solid #ffeeba;
    color: #4a3200;
    padding: 0.75rem 1rem;
    text-align: center;
    width: 100%;
    font-weight: 500;
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .alert-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .alert-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .alert-link {
    color: #4a3200;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .alert-link:hover {
    color: #2b1d00;
    text-decoration-thickness: 2px;
  }
</style>
