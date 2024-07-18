<script lang="ts">
  import DownloadButton from '$lib/components/DownloadButton.svelte';
  import DownloadsTable from '$lib/components/DownloadsTable.svelte';
</script>

<svelte:head>
  <title>Codex Downloads</title>
</svelte:head>

<h1 class="text-3xl font-bold mb-6">Downloads</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <DownloadButton os="macos" />
  <DownloadButton os="windows" />
  <DownloadButton os="linux" />
</div>

<h2 class="text-2xl font-semibold mb-4">All Downloads</h2>
<DownloadsTable />
