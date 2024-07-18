<script lang="ts">
  export let src: string;
  export let alt: string;
  export let href: string | null = null;
</script>

<div class="group flex w-full cursor-pointer flex-col space-y-2 rounded-2xl bg-neutral-700 p-6 text-left md:w-1/3">
  <div class="flex bg-white rounded-full p-2 justify-center items-center">
    {#if href}
      <a {href} target="_blank" rel="noopener noreferrer">
        <img {src} class="h-9 rounded-full" {alt} />
      </a>
    {:else}
      <img {src} class="h-9 rounded-full" {alt} />
    {/if}
  </div>
</div>