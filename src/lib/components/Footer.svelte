<script lang="ts">
  import Navigation from './Navigation.svelte';
  import Logo from './Logo.svelte';
</script>

<footer class="bg-white dark:bg-gray-800">
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="xl:grid xl:grid-cols-3 xl:gap-8">
      <div class="space-y-8 xl:col-span-1">
        <Logo size="large" />
        <p class="text-gray-500 dark:text-gray-100 text-base">
          Fully Open, Completely Free.
        </p>
      </div>
      <div class="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
        <div class="md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h3
              class="text-sm font-semibold text-gray-400 dark:text-gray-100 tracking-wider uppercase"
            >
              Navigation
            </h3>
            <div class="mt-4">
              <Navigation orientation="horizontal" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <p class="text-base text-gray-400 dark:text-gray-100 xl:text-center">
        &copy; {new Date().getFullYear()} [BiblioNexus Foundation](https://biblionexus.org/foundation).
      </p>
    </div>
  </div>
</footer>
