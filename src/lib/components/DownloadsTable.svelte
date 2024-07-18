<script lang="ts">
  import { onMount } from 'svelte';
  import {
    parseReleaseData,
    mapFileToUserFriendlyName,
    type ParsedRelease,
  } from '$lib/releaseDataUtils';
  import { FileCheck } from 'lucide-svelte';

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

  function getOsIcon(os: string): string {
    switch (os) {
      case 'macos':
        return 'fa-apple';
      case 'windows':
        return 'fa-windows';
      case 'linux':
        return 'fa-linux';
      default:
        return 'fa-question';
    }
  }
</script>

<div class="overflow-x-auto">
  {#if error}
    <p class="text-red-500">{error}</p>
  {:else if !parsedRelease}
    <p>Loading...</p>
  {:else}
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >OS</th
          >
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >File</th
          >
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Type</th
          >
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Architecture</th
          >
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Checksums</th
          >
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each ['macos', 'windows', 'linux'] as os}
          {#each parsedRelease.files[os] as file}
            {@const { name, type, arch } = mapFileToUserFriendlyName(file)}
            {#if !file.name.endsWith('.sha1') && !file.name.endsWith('.sha256')}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <i class="fab {getOsIcon(os)} text-xl"></i>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <a href={file.url} class="text-blue-600 hover:text-blue-800"
                    >{name}</a
                  >
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full {getTypeColor(
                      type,
                    )}"
                  >
                    {type}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
                  >
                    {arch}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex space-x-2">
                    {#if parsedRelease.files[os].find((f) => f.name === `${file.name}.sha1`)}
                      <a
                        href={parsedRelease.files[os].find(
                          (f) => f.name === `${file.name}.sha1`,
                        )?.url}
                        title="SHA1 Checksum"
                        class="text-gray-500 hover:text-gray-700"
                      >
                        <FileCheck size={16} />
                        <span class="sr-only">SHA1</span>
                      </a>
                    {/if}
                    {#if parsedRelease.files[os].find((f) => f.name === `${file.name}.sha256`)}
                      <a
                        href={parsedRelease.files[os].find(
                          (f) => f.name === `${file.name}.sha256`,
                        ).url}
                        title="SHA256 Checksum"
                        class="text-gray-500 hover:text-gray-700"
                      >
                        <FileCheck size={16} />
                        <span class="sr-only">SHA256</span>
                      </a>
                    {/if}
                  </div>
                </td>
              </tr>
            {/if}
          {/each}
        {/each}
      </tbody>
    </table>
  {/if}
</div>
