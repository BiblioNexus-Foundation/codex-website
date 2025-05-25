<script lang="ts">
  import Navigation from './Navigation.svelte';
  import Logo from './Logo.svelte';
</script>

<footer
  class="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"
>
  <div class="max-w-4xl mx-auto py-16 px-4 text-center">
    <div class="space-y-8">
      <div class="flex justify-center items-center">
        <Logo size="large" />
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Translation, reimagined.
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          AI-first translation that feels like magic. Simple, powerful, and
          built for the future.
        </p>
      </div>

      <div class="pt-4 flex justify-center items-center">
        <Navigation orientation="horizontal" />
      </div>
    </div>

    <div class="mt-16 pt-8 border-t border-gray-200 dark:border-gray-600">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Made with vibes by <a
          href="https://frontierrnd.com"
          class="text-blue-600 hover:text-blue-700 font-medium">Frontier R&D</a
        >
        • Open source in the
        <a
          href="https://biblionexus.org/foundation"
          class="text-blue-600 hover:text-blue-700 font-medium"
          >BiblioNexus Foundation</a
        >
      </p>
    </div>
  </div>
</footer>
