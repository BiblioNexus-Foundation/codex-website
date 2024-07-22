<script lang="ts">
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
</script>

<ul class={`${orientation === 'vertical' ? 'space-y-4' : 'flex space-x-8'}`}>
  <li>
    <a
      class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-100"
      href="/"
      rel="noopener noreferrer">Home</a
    >
  </li>
  <li>
    <a
      class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-100"
      href="https://project-accelerate.gitbook.io"
      target="_blank"
      rel="noopener noreferrer">Documentation</a
    >
  </li>
  <li>
    <a
      class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-100"
      href="https://ryder.dev/vs-code-translation/">Blog</a
    >
  </li>
  <li>
    <a
      class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-100"
      href="mailto:ryderwishart@gmail.com">Contact</a
    >
  </li>
  <li>
    <a
      class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-100"
      href="https://codex.flarum.cloud"
      target="_blank"
      rel="noopener noreferrer">Forum</a
    >
  </li>
  <li>
    <a
      class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-100"
      href="/downloads">Downloads</a
    >
  </li>
</ul>
