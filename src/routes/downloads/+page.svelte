<script lang="ts">
  import AllDownloadButtons from '$lib/components/AllDownloadButtons.svelte';
  import DownloadsTable from '$lib/components/DownloadsTable.svelte';
</script>

<svelte:head>
  <title>Codex Downloads</title>
</svelte:head>

<div class="flex flex-col items-center justify-center max-w-3xl mx-auto mt-12">
  <h1 class="text-3xl font-bold mb-6">Downloads</h1>

  <AllDownloadButtons />

  <h2 class="text-2xl font-semibold mb-4">All Downloads</h2>
  <DownloadsTable />
</div>
