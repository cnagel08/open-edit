// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit Plugin — Template Tags (K13)
// Visually decorates {{variableName}} patterns as styled pills.
// The tags are stored as plain text in the model — only the view is decorated.
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorInterface, EditorPlugin } from '../core/types.js';

const TAG_RE = /\{\{([^{}]+)\}\}/g;

function decorateTemplateTags(editorEl: HTMLElement): void {
  // Collect all text nodes not already inside a template tag span
  const walker = document.createTreeWalker(
    editorEl,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.classList.contains('oe-template-tag')) return NodeFilter.FILTER_REJECT;
        if (parent.tagName === 'TEXTAREA' || parent.tagName === 'SCRIPT') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? '';
    if (text.includes('{{')) {
      textNodes.push(node as Text);
    }
  }

  for (const textNode of textNodes) {
    const text = textNode.textContent ?? '';
    TAG_RE.lastIndex = 0;

    // Check if there's actually a match
    if (!TAG_RE.test(text)) continue;

    // Split into parts
    TAG_RE.lastIndex = 0;
    const parts: Array<{ type: 'text' | 'tag'; value: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = TAG_RE.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'tag', value: match[0] });
      lastIndex = TAG_RE.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'text', value: text.slice(lastIndex) });
    }

    // Build replacement fragment
    const fragment = document.createDocumentFragment();
    for (const part of parts) {
      if (part.type === 'tag') {
        const span = document.createElement('span');
        span.className = 'oe-template-tag';
        span.contentEditable = 'false';
        span.textContent = part.value;
        fragment.appendChild(span);
      } else if (part.value) {
        fragment.appendChild(document.createTextNode(part.value));
      }
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }
}

export function createTemplateTagPlugin(): EditorPlugin {
  let decorateTimer: ReturnType<typeof setTimeout> | null = null;

  function schedule(editorEl: HTMLElement): void {
    if (decorateTimer) clearTimeout(decorateTimer);
    decorateTimer = setTimeout(() => decorateTemplateTags(editorEl), 200);
  }

  return {
    name: 'template-tags',

    onInit(editor: EditorInterface) {
      const editorEl = (editor as unknown as { editorEl: HTMLElement }).editorEl;

      editor.on('change', () => schedule(editorEl));

      // Apply on init after first render
      setTimeout(() => decorateTemplateTags(editorEl), 100);
    },

    onDestroy() {
      if (decorateTimer) clearTimeout(decorateTimer);
    },
  };
}
