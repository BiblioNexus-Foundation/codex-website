<script lang="ts">
  import Navigation from './Navigation.svelte';
  import Logo from './Logo.svelte';
</script>

<footer class="bg-white dark:bg-gray-800">
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div class="col-span-2">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="space-y-8 flex flex-col items-center justify-center">
            <Logo size="large" />
            <p class="text-gray-500 dark:text-gray-100 text-base">
              Fully Open, Completely Free.
            </p>
          </div>
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
          <div></div>
          <!-- You can add more columns here if needed -->
        </div>
      </div>
    </div>
    <div class="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <p class="text-base text-gray-400 dark:text-gray-100 xl:text-center">
        &copy; {new Date().getFullYear()}
        <a href="https://frontierrnd.com" class="hover:underline text-blue-500"
          >Frontier R&D Ltd.</a
        >
        Base app code housed in the
        <a
          href="https://biblionexus.org/foundation"
          class="hover:underline text-blue-500">BiblioNexus Foundation</a
        >.
      </p>
    </div>
  </div>
</footer>
