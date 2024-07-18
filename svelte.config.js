import adapter from '@sveltejs/adapter-auto';
import { preprocessMeltUI } from '@melt-ui/pp';
import sequence from 'svelte-sequential-preprocessor';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: sequence([
    vitePreprocess(),
    preprocessMeltUI()
  ]),
  kit: {
    adapter: adapter()
  }
};

export default config;