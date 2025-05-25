<script lang="ts">
  import { onMount } from 'svelte';

  let isDarkMode = false;

  onMount(() => {
    // Check for dark mode preference
    isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Listen for changes to dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      isDarkMode = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  });
</script>

<div class="p-4 mx-auto text-center md:max-w-xl lg:max-w-none">
  <div
    class="flex flex-col items-center space-y-2 py-12 text-center md:space-y-4 md:py-12"
  >
    <div class="flex flex-col space-y-2">
      <h1 class="text-3xl font-semibold leading-snug text-white md:text-4xl">
        Translation tools that simplify your work
      </h1>
      <p class="text-neutral-400"></p>
    </div>
    <div class="flex flex-col space-y-12">
      <div class="w-full md:max-w-6xl lg:max-w-none justify-between space-y-6">
        <div
          class="flex w-full overflow-hidden rounded-xl bg-neutral-700 text-white"
        >
          <div
            class="relative flex h-[500px] w-full flex-col overflow-hidden px-10 pt-6 text-left md:h-[500px]"
          >
            <div class="flex flex-col space-y-1">
              <h3 class="text-xl font-medium text-white">
                Advanced Translation Assistance
              </h3>
              <p class="text-neutral-300">
                Get suggestions, corrections, and more in a simple text editor.
              </p>
            </div>
            <!-- <img
              class="absolute rounded-xl mt-28 -ml-8 w-full min-w-[700px] md:mt-18 7xl:mt-16"
              src="/suggestions.png"
              alt="Translation interface"
            /> -->
            <img
              class="absolute rounded-xl mt-28 -ml-8 w-full min-w-[700px] md:mt-18 7xl:mt-16"
              src={isDarkMode
                ? '/app-features/batch-translate-dark.gif'
                : '/app-features/batch-translate.gif'}
              alt="Advanced translation assistance interface"
              loading="lazy"
            />
          </div>
        </div>
        <div
          class="hidden flex w-full overflow-hidden rounded-xl bg-neutral-700 text-white"
        >
          <div
            class="relative flex h-[800px] w-full flex-col overflow-hidden px-10 py-9 text-left md:h-[800px]"
          >
            <div class="flex flex-col space-y-1">
              <h3 class="text-xl font-medium text-white">
                Conversational insights
              </h3>
              <p class="text-neutral-300">
                Learning about the source texts is like talking to an expert.
              </p>
            </div>
            <!-- <img
              class="absolute mt-28 -ml-8 w-full min-w-[700px] md:mt-18 7xl:mt-16"
              src="/chat.png"
              alt="Chat interface"
            /> -->
            <img
              class="absolute mt-28 -ml-8 w-full min-w-[700px] md:mt-18 7xl:mt-16"
              src="/translation-insights.webp"
              alt="Chat interface"
            />
          </div>
        </div>
      </div>
      <div class="w-full max-w-6xl justify-between">
        <div
          class="flex flex-col space-y-12 lg:flex-row lg:space-y-0 lg:space-x-12"
        >
          <div
            class="flex w-full overflow-hidden rounded-xl bg-neutral-700 text-white"
          >
            <div
              class="relative flex w-full h-[500px] flex-col overflow-hidden px-10 py-9 text-left"
            >
              <div class="flex flex-col space-y-1">
                <h3 class="text-xl font-medium text-white">
                  AI that learns from you
                </h3>
                <p class="text-neutral-300">
                  Every translation you make helps train the AI to better
                  understand your style and preferences, making future
                  suggestions more accurate and personalized without waiting to
                  build up a translation memory.
                </p>
              </div>
              <img
                class="absolute mt-28 mr w-[700px] min-w-[700px] md:mt-18 7xl:mt-16"
                src="/app-features/ai-that-learns.png"
                alt="AI learning interface showing personalized suggestions"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  /* Add any custom styles here if needed */
</style>
