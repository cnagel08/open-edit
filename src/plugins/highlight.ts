// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit Plugin — Syntax Highlighting (K1)
// Loads highlight.js from CDN and applies it to <pre><code> blocks.
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorInterface, EditorPlugin } from '../core/types.js';

declare global {
  interface Window {
    hljs?: {
      highlightElement(el: HTMLElement): void;
      configure(opts: Record<string, unknown>): void;
    };
  }
}

let hljsPromise: Promise<Window['hljs']> | null = null;

function loadHljs(): Promise<Window['hljs']> {
  if (hljsPromise) return hljsPromise;

  hljsPromise = new Promise((resolve, reject) => {
    if (window.hljs) {
      resolve(window.hljs);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve(window.hljs);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return hljsPromise;
}

const BASE = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/';
const DEFAULT_DARK  = `${BASE}atom-one-dark.min.css`;
const DEFAULT_LIGHT = `${BASE}atom-one-light.min.css`;

function injectHljsTheme(dark: boolean, themeUrl?: string | { light: string; dark: string }): void {
  const id = 'oe-hljs-theme';
  const existing = document.getElementById(id);

  let href: string;
  if (typeof themeUrl === 'string') {
    href = themeUrl;
  } else if (typeof themeUrl === 'object') {
    href = dark ? themeUrl.dark : themeUrl.light;
  } else {
    href = dark ? DEFAULT_DARK : DEFAULT_LIGHT;
  }

  if (existing) {
    (existing as HTMLLinkElement).href = href;
    return;
  }

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

export interface HighlightPluginOptions {
  /** Force 'light' or 'dark' theme for code highlighting. Default: follows editor theme. */
  theme?: 'light' | 'dark';
  /**
   * Custom highlight.js CSS theme URL.
   * Pass a string to use the same URL for light and dark,
   * or an object `{ light, dark }` to use different URLs per mode.
   * Available themes: https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/
   */
  themeUrl?: string | { light: string; dark: string };
}

export function createHighlightPlugin(opts: HighlightPluginOptions = {}): EditorPlugin {
  let hl: Window['hljs'] | undefined;
  let highlightTimer: ReturnType<typeof setTimeout> | null = null;

  function applyHighlighting(editorEl: HTMLElement): void {
    if (!hl) return;

    const blocks = editorEl.querySelectorAll<HTMLElement>('pre code');
    const activeNode = document.getSelection()?.anchorNode ?? null;

    blocks.forEach((block) => {
      // Skip blocks the user is currently editing
      const pre = block.closest('pre');
      if (pre && activeNode && pre.contains(activeNode)) return;

      // Remove stale highlight marker so hljs reprocesses
      delete block.dataset.highlighted;
      block.removeAttribute('data-highlighted');
      hl!.highlightElement(block);
    });
  }

  function scheduleHighlight(editorEl: HTMLElement): void {
    if (highlightTimer) clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => applyHighlighting(editorEl), 400);
  }

  return {
    name: 'highlight',

    onInit(editor: EditorInterface) {
      const editorEl = (editor as unknown as { editorEl: HTMLElement }).editorEl;
      const containerEl = (editor as unknown as { containerEl: HTMLElement }).containerEl;

      // Detect theme
      const dark =
        opts.theme === 'dark' ||
        (!opts.theme && containerEl?.dataset.oeTheme === 'dark');

      injectHljsTheme(dark, opts.themeUrl);

      loadHljs().then((hljs) => {
        hl = hljs;
        hl?.configure({ ignoreUnescapedHTML: true });
        applyHighlighting(editorEl);

        editor.on('change', () => scheduleHighlight(editorEl));
      }).catch(() => {
        console.warn('[OpenEdit] highlight.js failed to load from CDN');
      });
    },

    onDestroy() {
      if (highlightTimer) clearTimeout(highlightTimer);
    },
  };
}
