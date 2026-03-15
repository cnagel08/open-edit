import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OpenEdit',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'open-edit.esm.js';
        if (format === 'cjs') return 'open-edit.cjs.js';
        return 'open-edit.umd.js';
      },
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        exports: 'named',
      },
    },
    sourcemap: true,
    minify: true,
  },
});
