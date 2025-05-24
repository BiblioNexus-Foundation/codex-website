<script lang="ts">
  import FeatureCard from './FeatureCard.svelte';
</script>

<div class="mx-auto w-full rounded-xl bg-neutral-100 p-4 md:p-6">
  <div
    class="flex w-full flex-col items-center space-y-8 py-8 text-center md:space-y-12 md:py-16"
  >
    <div class="flex max-w-xl flex-col space-y-2">
      <h1
        class="text-2xl font-semibold leading-snug text-neutral-900 md:text-3xl lg:text-4xl"
      >
        Codex App & Translator's Copilot
      </h1>
      <p class="text-neutral-600">
        Inspired by VS Code, reimagined for translation excellence.
      </p>
    </div>
    <div class="flex flex-col space-y-6 md:space-y-10">
      <div
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl"
      >
        <FeatureCard
          icon="message-circle"
          title="All-in-one Translation Tools"
          description="Translate subtitles, books, bibles, and more with the power of AI."
        />
        <FeatureCard
          icon="hash"
          title="Multimodal Inputs & Outputs"
          description="(In Development!) Embracing a spectrum of audio and visual resources to enrich the translation experience."
        />
        <FeatureCard
          icon="wifi-off"
          title="Offline Accessibility"
          description="Tools that are there when you need them, anywhere, anytime."
        />
        <FeatureCard
          icon="check-circle"
          title="Localization"
          description="Catering to the top-ten strategic languages, embracing global translation needs."
        />
        <FeatureCard
          icon="cloud"
          title="Unopinionated Tools"
          description="Flexibly adapting to your unique translation style and project requirements."
        />
        <FeatureCard
          icon="settings"
          title="Codex App: A robust translation editor"
          description="A robust translation editor that is simple and intuitive at first glance, but powerful and customizable when you need it."
        />
      </div>
    </div>
  </div>
</div>
