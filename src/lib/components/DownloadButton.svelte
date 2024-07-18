<script lang="ts">
  import { onMount } from 'svelte';
  import {
    parseReleaseData,
    type ParsedRelease,
    type ReleaseFile,
  } from '$lib/releaseDataUtils';

  export let os: 'macos' | 'windows' | 'linux';

  let parsedRelease: ParsedRelease;
  let error: string | null = null;
  let showDropdown = false;

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
      text: 'Download for macOS',
      gradient: 'from-green-400 via-teal-500 to-blue-600',
      hoverGradient: 'hover:from-teal-600 hover:via-teal-500 hover:to-blue-700',
      ring: 'focus:ring-teal-400',
      options: ['M1/M2/M3', 'Intel'],
    },
    windows: {
      icon: 'fa-windows',
      text: 'Download for Windows',
      gradient: 'from-yellow-500 via-orange-400 to-red-600',
      hoverGradient:
        'hover:from-orange-600 hover:via-orange-500 hover:to-red-700',
      ring: 'focus:ring-orange-400',
      options: ['64-bit'],
    },
    linux: {
      icon: 'fa-linux',
      text: 'Download for Linux',
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
    let file;

    switch (os) {
      case 'macos':
        file = files.find((f: ReleaseFile) =>
          option === 'M1/M2/M3'
            ? f.name.includes('arm64')
            : f.name.includes('x64'),
        );
        break;
      case 'windows':
        file = files.find(
          (f: ReleaseFile) => f.name.includes('x64') && f.name.endsWith('.exe'),
        );
        break;
      case 'linux':
        file = files.find((f: ReleaseFile) => f.name.includes(option));
        break;
    }

    return file ? file.url : '#';
  }

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }
</script>

<div class="relative flex-1">
  {#if error}
    <p class="text-red-500">{error}</p>
  {:else if !parsedRelease}
    <p>Loading...</p>
  {:else}
    <button
      on:click={toggleDropdown}
      class="block w-full rounded-md bg-gradient-to-br {config.gradient} py-3 px-4 font-medium text-white {config.hoverGradient} focus:outline-none focus:ring-2 {config.ring} animate-gradient-x"
    >
      <div class="flex items-center justify-center space-x-2">
        <i class="fab {config.icon} text-2xl text-white"></i>
        <span class="text-base">{config.text}</span>
      </div>
    </button>
    {#if showDropdown && config.options.length > 1}
      <div
        class="absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
      >
        <div class="py-1">
          {#each config.options as option}
            <a
              href={getDownloadUrl(option)}
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {option}
            </a>
          {/each}
        </div>
      </div>
    {:else if config.options.length === 1}
      <a
        href={getDownloadUrl(config.options[0])}
        class="block w-full rounded-md bg-gradient-to-br {config.gradient} py-3 px-4 font-medium text-white {config.hoverGradient} focus:outline-none focus:ring-2 {config.ring} animate-gradient-x mt-2"
      >
        <div class="flex items-center justify-center space-x-2">
          <i class="fab {config.icon} text-2xl text-white"></i>
          <span class="text-base">{config.text} ({config.options[0]})</span>
        </div>
      </a>
    {/if}
  {/if}
</div>
