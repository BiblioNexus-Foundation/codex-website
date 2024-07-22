<script lang="ts">
  export let size: 'small' | 'medium' | 'large' = 'medium';

  let svgFailed = false;

  function handleSvgError() {
    svgFailed = true;
  }
</script>

<a href="/" class="flex-shrink-0">
  <div
    class="avatar bg-white border-gray-200 dark:border-gray-700 rounded-full p-1"
  >
    {#if !svgFailed}
      <object
        data="/codex-logo-2024.svg"
        type="image/svg+xml"
        class={size === 'small'
          ? 'h-6 w-6'
          : size === 'medium'
            ? 'h-8 w-8 sm:h-10 sm:w-10'
            : 'h-10 w-10'}
        aria-label="BiblioNexus Logo"
        on:error={handleSvgError}
      >
        <!-- Fallback content -->
        <img
          src="/codex-logo.png"
          alt="BiblioNexus Logo"
          class={size === 'small'
            ? 'h-6 w-6'
            : size === 'medium'
              ? 'h-8 w-8 sm:h-10 sm:w-10'
              : 'h-10 w-10'}
        />
      </object>
    {:else}
      <img
        src="/codex-logo.png"
        alt="BiblioNexus Logo"
        class={size === 'small'
          ? 'h-6 w-6'
          : size === 'medium'
            ? 'h-8 w-8 sm:h-10 sm:w-10'
            : 'h-10 w-10'}
      />
    {/if}
  </div>
</a>
