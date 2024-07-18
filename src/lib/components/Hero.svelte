<script lang="ts">
  import DownloadButton from './DownloadButton.svelte';

  let showMacosDropdown = false;
  let showLinuxDropdown = false;
  let showWindowsDropdown = false;

  function toggleDropdown(os: 'macos' | 'windows' | 'linux'): void {
    showMacosDropdown = os === 'macos' ? !showMacosDropdown : false;
    showWindowsDropdown = os === 'windows' ? !showWindowsDropdown : false;
    showLinuxDropdown = os === 'linux' ? !showLinuxDropdown : false;
  }
</script>

<div
  class="relative flex w-full flex-col items-center space-y-12 overflow-hidden pt-12 text-center md:py-32"
>
  <div class="flex max-w-xl flex-col space-y-4">
    <h1 class="text-4xl font-semibold leading-snug tracking-tight md:text-5xl">
      Codex Translation Editor
    </h1>
    <p class="text-gray-600">Empowering Translators with Cutting-Edge AI</p>
  </div>
  <div class="mx-auto max-w-4xl">
    <div class="mx-auto w-full rounded-xl p-6 mb-8">
      <div
        class="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4"
      >
        <DownloadButton
          os="macos"
          showDropdown={showMacosDropdown}
          {toggleDropdown}
        />
        <DownloadButton
          os="windows"
          showDropdown={showWindowsDropdown}
          {toggleDropdown}
        />
        <DownloadButton
          os="linux"
          showDropdown={showLinuxDropdown}
          {toggleDropdown}
        />
      </div>
    </div>

    <img
      src="/genesis-ui.jpg"
      class="relative z-50 rounded-xl md:w-auto"
      alt="Genesis UI"
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
