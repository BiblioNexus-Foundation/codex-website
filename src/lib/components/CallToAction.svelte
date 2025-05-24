<script lang="ts">
  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<div class="mx-auto w-full rounded-xl bg-neutral-100 p-6">
  <div
    class="flex w-full flex-col items-center space-y-12 py-12 text-center md:py-32"
  >
    <div class="flex max-w-xl flex-col space-y-4">
      <h1
        class="text-4xl font-semibold leading-snug tracking-tight md:text-5xl"
      >
        Join Our Journey.
      </h1>
      <p class="text-gray-600">
        Be a part of an open-source collaborative project that's setting new
        standards in translation technology.
      </p>
    </div>

    <blockquote
      class="max-w-4xl border-l-4 border-teal-500 bg-white/50 p-6 italic text-gray-700 backdrop-blur-sm"
    >
      <p class="text-lg leading-relaxed">
        "We still do not understand the cultural and social implications of the
        translator's verbal choices, and no consensus has developed as to how
        translations might be written and read or even what sort of
        communicative act translation is."
      </p>
      <cite class="mt-4 block text-sm font-medium text-gray-500">
        — Lawrence Venuti, Translation Changes Everything (2013: 248)
      </cite>
    </blockquote>

    <div class="max-4xl flex flex-col space-y-4">
      <a
        href="/downloads"
        class="inline-block rounded-md bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 py-2.5 px-8 text-base font-medium text-white hover:from-teal-600 hover:via-teal-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-teal-400 animate-gradient-x"
      >
        Download Codex for Free
      </a>
      <p class="text-gray-600">
        Want to learn more?
        <a
          class="font-medium text-gray-900 hover:text-gray-500"
          href="https://project-accelerate.gitbook.io"
          target="_blank">Conceptual Documentation</a
        >
      </p>
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
