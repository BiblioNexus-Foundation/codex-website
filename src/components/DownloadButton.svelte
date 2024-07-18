<script lang="ts">
  import { onMount } from 'svelte';
  import {
    parseReleaseData,
    mapFileToUserFriendlyName,
    type ParsedRelease,
  } from '../lib/releaseDataUtils';
  import { FileCheck } from 'lucide-svelte';

  export let os: 'macos' | 'windows' | 'linux';
  export let showDropdown: boolean;
  export let toggleDropdown: (os: 'macos' | 'windows' | 'linux') => void;

  let parsedRelease: ParsedRelease;

  onMount(async () => {
    const response = await fetch(
      'https://api.github.com/repos/BiblioNexus-Foundation/codex/releases/latest',
    );
    const releaseData = await response.json();
    parsedRelease = parseReleaseData(releaseData.assets);
  });

  const osConfig = {
    macos: {
      icon: 'fa-apple',
      text: 'Download for macOS',
      gradient: 'from-green-400 via-teal-500 to-blue-600',
      hoverGradient: 'hover:from-teal-600 hover:via-teal-500 hover:to-blue-700',
      ring: 'focus:ring-teal-400',
    },
    windows: {
      icon: 'fa-windows',
      text: 'Download for Windows',
      gradient: 'from-yellow-500 via-orange-400 to-red-600',
      hoverGradient:
        'hover:from-orange-600 hover:via-orange-500 hover:to-red-700',
      ring: 'focus:ring-orange-400',
    },
    linux: {
      icon: 'fa-linux',
      text: 'Download for Linux',
      gradient: 'from-purple-500 via-pink-400 to-red-600',
      hoverGradient: 'hover:from-pink-600 hover:via-pink-500 hover:to-red-700',
      ring: 'focus:ring-pink-400',
    },
  };

  const config = osConfig[os];

  $: options = parsedRelease
    ? parsedRelease.files[os]
        .filter(
          (file) =>
            !file.name.endsWith('.sha1') && !file.name.endsWith('.sha256'),
        )
        .map((file) => ({
          ...mapFileToUserFriendlyName(file),
          href: file.url,
          sha1: parsedRelease.files[os].find(
            (f) => f.name === `${file.name}.sha1`,
          )?.url,
          sha256: parsedRelease.files[os].find(
            (f) => f.name === `${file.name}.sha256`,
          )?.url,
        }))
    : [];

  function getTypeColor(type: string): string {
    switch (type) {
      case 'ZIP Archive':
      case 'Tarball':
        return 'bg-blue-100 text-blue-800';
      case 'Disk Image':
        return 'bg-green-100 text-green-800';
      case 'Installer':
      case 'Windows Installer':
        return 'bg-purple-100 text-purple-800';
      case 'Remote Extension Host':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="relative flex-1">
  <button
    on:click={() => toggleDropdown(os)}
    class="block w-full rounded-md bg-gradient-to-br {config.gradient} py-3 px-4 font-medium text-white {config.hoverGradient} focus:outline-none focus:ring-2 {config.ring} animate-gradient-x"
  >
    <div class="flex items-center justify-center space-x-2">
      <i class="fab {config.icon} text-2xl"></i>
      <span class="text-base">{config.text}</span>
    </div>
  </button>
  {#if showDropdown && parsedRelease}
    <div
      class="absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[60]"
    >
      <div class="py-1">
        {#each options as option}
          <div class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <div class="flex items-center justify-between">
              <a href={option.href} class="flex-grow">
                <span>{option.name}</span>
              </a>
              <div class="flex items-center space-x-2">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full {getTypeColor(
                    option.type,
                  )}"
                >
                  {option.type}
                </span>
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
                >
                  {option.arch}
                </span>
                {#if option.sha1 || option.sha256}
                  <div class="flex space-x-1">
                    {#if option.sha1}
                      <a
                        href={option.sha1}
                        title="SHA1 Checksum"
                        class="text-gray-500 hover:text-gray-700"
                      >
                        <FileCheck size={16} />
                      </a>
                    {/if}
                    {#if option.sha256}
                      <a
                        href={option.sha256}
                        title="SHA256 Checksum"
                        class="text-gray-500 hover:text-gray-700"
                      >
                        <FileCheck size={16} />
                      </a>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
