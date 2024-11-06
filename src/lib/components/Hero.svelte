<script lang="ts">
  import AllDownloadButtons from './AllDownloadButtons.svelte';
  import { themeStore } from '$lib/themeStore';
</script>

<div
  class="relative flex w-full flex-col items-center space-y-12 overflow-hidden pt-12 text-center md:py-32"
>
  <div class="flex max-w-xl flex-col space-y-4">
    <h1 class="text-4xl font-semibold leading-snug tracking-tight md:text-5xl">
      Codex Translation Editor
    </h1>
    <p class="text-gray-600 dark:text-gray-100">
      Empowering Translators with Cutting-Edge AI
    </p>
  </div>
  <div class="mx-auto max-w-4xl">
    <AllDownloadButtons />

    <img
      src={$themeStore ? '/codex-main-dark.png' : '/codex-main-light.png'}
      class="relative z-50 rounded-xl md:w-auto"
      alt="Codex"
    />
    <!-- SVG backgrounds -->
    <div
      class="absolute top-[30rem] left-1/2 -ml-[40rem] w-[163.125rem] max-w-none sm:-ml-[37.5rem]"
    >
      <svg
        width="277"
        height="393"
        viewBox="0 0 277 393"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- SVG content -->
      </svg>
    </div>
    <div
      class="absolute top-[18rem] left-1/2 z-0 -ml-[40rem] w-[163.125rem] max-w-none sm:ml-[17.5rem]"
    >
      <svg
        width="369"
        height="600"
        viewBox="0 0 369 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- SVG content -->
      </svg>
    </div>
  </div>
</div>

<style lang="postcss">
  @keyframes gradient-wave {
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

  :global(.animate-gradient-x) {
    @apply bg-[length:400%_400%];
    animation: gradient-wave 5s ease infinite;
  }
</style>
