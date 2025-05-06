<script lang="ts">
  import { onMount } from 'svelte';
  import {
    parseReleaseData,
    type ParsedRelease,
    type ReleaseFile,
  } from '$lib/releaseDataUtils';

  export let os: 'macos' | 'windows' | 'linux';
  export let showDropdown: boolean;
  export let toggleDropdown: (os: 'macos' | 'windows' | 'linux') => void;

  let parsedRelease: ParsedRelease;
  let error: string | null = null;

  onMount(async () => {
    try {
      const response = await fetch('/api/latest-release');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const releaseData = await response.json();
      parsedRelease = parseReleaseData(releaseData.assets);
    } catch (e) {
      console.error('Failed to fetch release data:', e);
      error = 'Failed to load release data. Please try again later.';
    }
  });

  const osConfig = {
    macos: {
      icon: 'fa-apple',
      text: 'macOS',
      gradient: 'from-green-400 via-teal-500 to-blue-600',
      hoverGradient: 'hover:from-teal-600 hover:via-teal-500 hover:to-blue-700',
      ring: 'focus:ring-teal-400',
      options: ['Apple Silicon', 'Intel'],
    },
    windows: {
      icon: 'fa-windows',
      text: 'Windows',
      gradient: 'from-yellow-500 via-orange-400 to-red-600',
      hoverGradient:
        'hover:from-orange-600 hover:via-orange-500 hover:to-red-700',
      ring: 'focus:ring-orange-400',
      options: ['64-bit'],
    },
    linux: {
      icon: 'fa-linux',
      text: 'Linux (Deb)',
      gradient: 'from-purple-500 via-pink-400 to-red-600',
      hoverGradient: 'hover:from-pink-600 hover:via-pink-500 hover:to-red-700',
      ring: 'focus:ring-pink-400',
      options: ['arm64', 'x64', 'armhf'],
    },
  };

  const config = osConfig[os];

  function getDownloadUrl(option: string): string {
    if (!parsedRelease) return '#';
    const files = parsedRelease.files[os];
    let file: ReleaseFile | undefined;

    switch (os) {
      case 'macos':
        file = files.find((f: ReleaseFile) =>
          option === 'Apple Silicon'
            ? f.name.includes('arm64') && f.name.endsWith('.dmg')
            : f.name.includes('x64') && f.name.endsWith('.dmg'),
        );
        break;
      case 'windows':
        file = files.find(
          (f: ReleaseFile) => f.name.includes('x64') && f.name.endsWith('.exe'),
        );
        break;
      case 'linux':
        // Prioritize .deb files, then fall back to .AppImage
        file =
          files.find(
            (f: ReleaseFile) =>
              f.name.includes(option) && f.name.endsWith('.deb'),
          ) ||
          files.find(
            (f: ReleaseFile) =>
              f.name.includes(option) && f.name.endsWith('.AppImage'),
          );
        break;
    }

    return file ? file.url : '#';
  }

  function shouldShowDropdown(): boolean {
    return config.options.length > 1;
  }

  function handleButtonClick() {
    if (os === 'windows' && config.options.length === 1) {
      window.location.href = getDownloadUrl(config.options[0]);
    } else {
      toggleDropdown(os);
    }
  }

  function handleDownload(option: string) {
    const url = getDownloadUrl(option);
    if (url !== '#') {
      window.location.href = url;
    }
  }
</script>

<div class="relative flex-1">
  {#if error}
    <p class="text-red-500">{error}</p>
  {:else if !parsedRelease}
    <p>Loading...</p>
  {:else}
    <button
      on:click={handleButtonClick}
      class="block w-full rounded-md bg-gradient-to-br {config.gradient} py-3 px-4 font-medium text-white {config.hoverGradient} focus:outline-none focus:ring-2 {config.ring} animate-gradient-x"
    >
      <div class="flex items-center justify-center space-x-2">
        <i class="fab {config.icon} text-2xl text-white"></i>
        <span class="text-base">{config.text}</span>
      </div>
    </button>
    {#if showDropdown && shouldShowDropdown()}
      <div
        class="absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[60]"
      >
        <div class="py-1">
          {#each config.options as option}
            <button
              on:click={() => handleDownload(option)}
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {option}
            </button>
          {/each}
        </div>
      </div>
    {:else if !shouldShowDropdown()}
      <button
        on:click={() => handleDownload(config.options[0])}
        class="sr-only"
      >
        Download {config.text} ({config.options[0]})
      </button>
    {/if}
  {/if}
</div>
