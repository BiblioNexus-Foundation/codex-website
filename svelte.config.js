import sveltePreprocess from "svelte-preprocess";
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    sveltePreprocess({
      postcss: true,
    }),
  ],
  kit: {
    adapter: adapter(),
    alias: {
      $lib: './src/lib'
    }
  }
};

export default config;