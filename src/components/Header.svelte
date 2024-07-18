<script lang="ts">
  let showNav: boolean = false;
</script>

<div class="mx-auto w-full rounded-xl bg-neutral-100 p-6">
  <div class="flex w-full flex-col items-center justify-between md:flex-row">
    <div class="flex w-full flex-row justify-between md:w-1/4">
      <img src="/bible-logo.png" class="h-16 w-16" alt="Bible Logo" />
    </div>

    <div
      class="mt-4 w-full rounded-t-md bg-white md:mt-0 md:w-auto md:bg-neutral-100"
    >
      <nav
        id="nav"
        class={`${showNav ? '' : 'hidden'} w-full px-4 py-4 md:flex`}
      >
        <ul
          class="flex flex-col space-y-1 text-base font-medium text-gray-900 md:flex-row md:space-x-8 md:space-y-0"
        >
          <li>
            <a
              class="hover:text-gray-500 dark:hover:text-gray-300"
              href="https://project-accelerate.gitbook.io"
              target="_blank">Conceptual Documentation</a
            >
          </li>
          <li>
            <a
              class="hover:text-gray-500 dark:hover:text-gray-300"
              href="https://ryder.dev/vs-code-translation/">Ideas Blog</a
            >
          </li>
          <li>
            <a
              class="hover:text-gray-500 dark:hover:text-gray-300"
              href="mailto:ryderwishart@gmail.com">Contact</a
            >
          </li>
        </ul>
      </nav>
    </div>
    <div
      id="buttons"
      class="hidden w-full flex-col justify-end space-y-2 space-x-0 rounded-b-md bg-white px-3 pb-4 md:flex md:w-1/4 md:flex-row md:space-y-0 md:space-x-4 md:bg-neutral-100 md:px-0 md:pb-0"
    >
      <!-- Buttons can be added here if needed -->
    </div>
  </div>
</div>
