import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const { version } = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8')) as { version: string };

const define = {
  __APP_VERSION__: JSON.stringify(version),
};

export default defineConfig(({ mode }) => {
  // ── UMD build (separate entry so window.OpenEdit.create works directly) ──────
  if (mode === 'umd') {
    return {
      define,
      build: {
        emptyOutDir: false,
        lib: {
          // umd-entry.ts only re-exports the default → no double-namespace
          entry: resolve(__dirname, 'src/umd-entry.ts'),
          name: 'OpenEdit',
          formats: ['umd'],
          fileName: () => 'open-edit.umd.js',
        },
        sourcemap: true,
        minify: true,
      },
    };
  }

  // ── ESM + CJS build ───────────────────────────────────────────────────────────
  return {
    define,
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: (format) => (format === 'es' ? 'open-edit.esm.js' : 'open-edit.cjs.js'),
      },
      sourcemap: true,
      minify: true,
    },
  };
});
