// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Callout Plugin
//
// Adds slash-command support for inserting callout blocks:
//   /callout          → Info callout
//   /callout-info     → Info callout
//   /callout-success  → Success callout
//   /callout-warning  → Warning callout
//   /callout-danger   → Danger callout
//
// Usage:
//   import { createCalloutPlugin } from 'openedit/plugins/callout';
//   editor.use(createCalloutPlugin());
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorPlugin, EditorInterface } from '../core/types.js';
import type { CalloutVariant } from '../core/types.js';

const CALLOUT_VARIANTS: CalloutVariant[] = ['info', 'success', 'warning', 'danger'];

// Maps slash-command tokens → callout variants
const SLASH_MAP: Record<string, CalloutVariant> = {
  '/callout':         'info',
  '/callout-info':    'info',
  '/callout-success': 'success',
  '/callout-warning': 'warning',
  '/callout-danger':  'danger',
};

export function createCalloutPlugin(): EditorPlugin {
  let editorEl: HTMLElement | null = null;
  let editorRef: EditorInterface | null = null;

  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key !== 'Enter' || e.shiftKey || !editorEl) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (!range.collapsed) return;

    // Get the text content of the current block element
    let blockEl: Node | null = range.startContainer;
    while (blockEl && blockEl.parentNode !== editorEl) {
      blockEl = blockEl.parentNode;
    }
    if (!blockEl || blockEl.nodeType !== Node.ELEMENT_NODE) return;

    const lineText = (blockEl as Element).textContent?.trim() ?? '';
    const matchedVariant = SLASH_MAP[lineText.toLowerCase()];
    if (!matchedVariant) return;

    e.preventDefault();

    // Clear the slash-command text from the block
    (blockEl as Element).innerHTML = '';

    // Insert callout via chain API
    editorRef?.chain().setBlock('callout', { variant: matchedVariant }).run();
  };

  return {
    name: 'callout',

    onInit(editor: EditorInterface) {
      editorRef = editor;
      // Access the contentEditable element via the internal structure
      editorEl = (editor as unknown as { editorEl: HTMLElement }).editorEl;
      if (editorEl) {
        editorEl.addEventListener('keydown', onKeydown);
      }
    },

    onDestroy(_editor: EditorInterface) {
      if (editorEl) {
        editorEl.removeEventListener('keydown', onKeydown);
      }
      editorEl = null;
      editorRef = null;
    },

    // Keymaps: Ctrl+Shift+I → insert Info callout quickly
    keymaps: {
      'ctrl+shift+i': (editor: EditorInterface) => {
        editor.chain().setBlock('callout', { variant: 'info' }).run();
        return true;
      },
    },
  };
}

export { CALLOUT_VARIANTS };
