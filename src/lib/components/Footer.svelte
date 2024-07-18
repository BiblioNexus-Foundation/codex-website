<script lang="ts">
  import Navigation from './Navigation.svelte';
</script>

<footer class="bg-white">
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="xl:grid xl:grid-cols-3 xl:gap-8">
      <div class="space-y-8 xl:col-span-1">
        <img src="/bible-logo.png" class="h-10" alt="BiblioNexus Logo" />
        <p class="text-gray-500 text-base">Fully Open, Completely Free.</p>
      </div>
      <div class="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
        <div class="md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h3
              class="text-sm font-semibold text-gray-400 tracking-wider uppercase"
            >
              Navigation
            </h3>
            <div class="mt-4">
              <Navigation orientation="vertical" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-12 border-t border-gray-200 pt-8">
      <p class="text-base text-gray-400 xl:text-center">
        &copy; {new Date().getFullYear()} BiblioNexus Foundation. All rights reserved.
      </p>
    </div>
  </div>
</footer>
