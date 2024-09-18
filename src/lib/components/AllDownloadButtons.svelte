<script lang="ts">
  import DownloadButton from './DownloadButton.svelte';
  import { onMount } from 'svelte';

  let showMacosDropdown = false;
  let showLinuxDropdown = false;
  let showWindowsDropdown = false;

  function toggleDropdown(os: 'macos' | 'windows' | 'linux'): void {
    showMacosDropdown = os === 'macos' ? !showMacosDropdown : false;
    showWindowsDropdown = os === 'windows' ? !showWindowsDropdown : false;
    showLinuxDropdown = os === 'linux' ? !showLinuxDropdown : false;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      showMacosDropdown = false;
      showWindowsDropdown = false;
      showLinuxDropdown = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="mx-auto w-full rounded-xl p-6 mb-8">
  <div
    class="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 dropdown-container"
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