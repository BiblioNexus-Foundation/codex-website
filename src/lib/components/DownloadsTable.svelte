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

  interface ReleaseFile {
    name: string;
    url: string;
    size?: string;
    date?: string;
  }

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
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Disk Image':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Installer':
      case 'Windows Installer':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'Remote Extension Host':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  }

  function getOsIcon(os: string): string {
    switch (os.toLowerCase()) {
      case 'macos':
      case 'darwin':
        return 'fa-apple';
      case 'windows':
      case 'win32':
        return 'fa-windows';
      case 'linux':
        return 'fa-linux';
      default:
        return 'fa-question';
    }
  }

  function getChecksumFiles(os: string, fileName: string) {
    const files = parsedRelease.files[os as keyof typeof parsedRelease.files];
    return {
      sha1: files.find((f: ReleaseFile) => f.name === `${fileName}.sha1`),
      sha256: files.find((f: ReleaseFile) => f.name === `${fileName}.sha256`),
    };
  }

  function getFilesForOS(os: 'macos' | 'windows' | 'linux'): ReleaseFile[] {
    if (!parsedRelease?.files) return [];
    return parsedRelease.files[os] || [];
  }

  function getOSFiles() {
    if (!parsedRelease?.files) return [];
    return ['macos', 'windows', 'linux'].flatMap((os) => {
      const files = getFilesForOS(os as 'macos' | 'windows' | 'linux');
      return files
        .filter(
          (file) =>
            !file.name.endsWith('.sha1') && !file.name.endsWith('.sha256'),
        )
        .map((file) => ({
          os,
          file,
        }));
    });
  }

  function handleDownload(url: string) {
    if (url && url !== '#') {
      window.location.href = url;
    }
  }
</script>

<div class="overflow-x-auto">
  {#if error}
    <p class="text-red-500">{error}</p>
  {:else if !parsedRelease}
    <p>Loading...</p>
  {:else}
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >OS</th
          >
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >File</th
          >
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >Type</th
          >
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >Architecture</th
          >
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >Checksums</th
          >
        </tr>
      </thead>
      <tbody
        class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
      >
        {#each getOSFiles() as { os, file }}
          {@const { name, type, arch } = mapFileToUserFriendlyName({
            name: file.name,
            url: file.url,
            size: file.size || '0 B',
            date: file.date || new Date().toISOString(),
          })}
          {#if !file.name.endsWith('.sha1') && !file.name.endsWith('.sha256')}
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap">
                <i class="fab {getOsIcon(os)} text-xl dark:text-gray-300"></i>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  on:click={() => handleDownload(file.url)}
                  class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-left"
                  >{name}</button
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
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                >
                  {arch}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                  {#if parsedRelease}
                    {@const checksumFiles = getChecksumFiles(os, file.name)}
                    {#if checksumFiles.sha1}
                      <button
                        on:click={() => handleDownload(checksumFiles.sha1.url)}
                        title="SHA1 Checksum"
                        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <FileCheck size={16} />
                        <span class="sr-only">SHA1</span>
                      </button>
                    {/if}
                    {#if checksumFiles.sha256}
                      <button
                        on:click={() =>
                          handleDownload(checksumFiles.sha256.url)}
                        title="SHA256 Checksum"
                        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <FileCheck size={16} />
                        <span class="sr-only">SHA256</span>
                      </button>
                    {/if}
                  {/if}
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  {/if}
</div>
