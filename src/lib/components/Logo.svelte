<script lang="ts">
  export let size: 'small' | 'medium' | 'large' = 'medium';

  let svgFailed = false;

  function handleSvgError() {
    svgFailed = true;
  }
</script>

<a href="/" class="flex-shrink-0">
  {#if !svgFailed}
    <object
      data="/codex-logo-2024.svg"
      type="image/svg+xml"
      class={size === 'small'
        ? 'h-6 w-auto'
        : size === 'medium'
          ? 'h-8 w-auto sm:h-10'
          : 'h-10 w-auto'}
      aria-label="BiblioNexus Logo"
      on:error={handleSvgError}
    >
      <!-- Fallback content -->
      <img
        src="/codex-logo.png"
        alt="BiblioNexus Logo"
        class={size === 'small'
          ? 'h-6 w-auto'
          : size === 'medium'
            ? 'h-8 w-auto sm:h-10'
            : 'h-10 w-auto'}
      />
    </object>
  {:else}
    <img
      src="/codex-logo.png"
      alt="BiblioNexus Logo"
      class={size === 'small'
        ? 'h-6 w-auto'
        : size === 'medium'
          ? 'h-8 w-auto sm:h-10'
          : 'h-10 w-auto'}
    />
  {/if}
</a>
