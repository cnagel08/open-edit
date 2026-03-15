// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — DOM Renderer (Document Model → DOM)
// Strategy: Keyed rendering — each block gets a stable data-oe-key attribute.
// On re-render we diff by key and patch only changed blocks.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  EditorDocument,
  BlockNode,
  InlineNode,
  Mark,
  LinkMark,
} from '../core/types.js';

let _keyCounter = 0;
function nextKey(): string {
  return `oe-${++_keyCounter}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Full render: replace the content of `root` with a fresh render.
 * Attaches data-oe-key to each block element for future diffing.
 */
export function renderDocument(doc: EditorDocument, root: HTMLElement): void {
  // Build new DOM fragment
  const frag = document.createDocumentFragment();
  for (const block of doc.children) {
    const el = renderBlock(block);
    frag.appendChild(el);
  }

  // Replace all children
  root.innerHTML = '';
  root.appendChild(frag);
}

/**
 * Patch render: compare existing block elements by key and update only changed ones.
 * Blocks without a key get a fresh render.
 */
export function patchDocument(
  doc: EditorDocument,
  root: HTMLElement,
  keys: string[],
): string[] {
  const existing = Array.from(root.children) as HTMLElement[];
  const newKeys: string[] = [];

  for (let i = 0; i < doc.children.length; i++) {
    const block = doc.children[i];
    const key = keys[i] ?? nextKey();
    newKeys.push(key);

    const oldEl = existing.find((el) => el.dataset.oeKey === key);
    const newEl = renderBlock(block);
    newEl.dataset.oeKey = key;

    if (!oldEl) {
      // New block — insert at position i
      const refEl = root.children[i];
      if (refEl) root.insertBefore(newEl, refEl);
      else root.appendChild(newEl);
    } else {
      // Replace if changed
      if (oldEl.outerHTML !== newEl.outerHTML) {
        root.replaceChild(newEl, oldEl);
      }
    }
  }

  // Remove blocks that no longer exist
  Array.from(root.children).forEach((el) => {
    const key = (el as HTMLElement).dataset.oeKey ?? '';
    if (!newKeys.includes(key)) el.remove();
  });

  return newKeys;
}

// ── Block rendering ───────────────────────────────────────────────────────────

function renderBlock(node: BlockNode): HTMLElement {
  switch (node.type) {
    case 'paragraph': {
      const p = document.createElement('p');
      if (node.align && node.align !== 'left') p.style.textAlign = node.align;
      renderInlinesInto(node.children, p);
      return p;
    }

    case 'heading': {
      const h = document.createElement(`h${node.level}`);
      if (node.align && node.align !== 'left') h.style.textAlign = node.align;
      renderInlinesInto(node.children, h);
      return h;
    }

    case 'blockquote': {
      const bq = document.createElement('blockquote');
      for (const child of node.children) {
        bq.appendChild(renderBlock(child));
      }
      return bq;
    }

    case 'code_block': {
      const pre = document.createElement('pre');
      // Language badge — contenteditable=false so it doesn't interfere with cursor
      const badge = document.createElement('span');
      badge.className = 'oe-code-lang-badge';
      badge.contentEditable = 'false';
      badge.textContent = node.lang || 'plain';
      pre.appendChild(badge);
      const code = document.createElement('code');
      if (node.lang) code.className = `language-${node.lang}`;
      code.textContent = node.children.map((t) => t.text).join('');
      pre.appendChild(code);
      return pre;
    }

    case 'bullet_list': {
      const ul = document.createElement('ul');
      for (const li of node.children) {
        const liEl = document.createElement('li');
        renderInlinesInto(li.children, liEl);
        ul.appendChild(liEl);
      }
      return ul;
    }

    case 'ordered_list': {
      const ol = document.createElement('ol');
      if (node.start && node.start !== 1) ol.setAttribute('start', String(node.start));
      for (const li of node.children) {
        const liEl = document.createElement('li');
        renderInlinesInto(li.children, liEl);
        ol.appendChild(liEl);
      }
      return ol;
    }

    case 'image': {
      const div = document.createElement('div');
      div.className = 'oe-image-wrapper';
      const img = document.createElement('img');
      img.src = node.src;
      if (node.alt) img.alt = node.alt;
      if (node.width) img.width = node.width;
      if (node.height) img.height = node.height;
      img.draggable = false;
      div.appendChild(img);
      return div;
    }

    case 'hr': {
      const hr = document.createElement('hr');
      return hr;
    }

    case 'callout': {
      const div = document.createElement('div');
      div.className = `oe-callout oe-callout-${node.variant}`;
      div.dataset.calloutVariant = node.variant;
      renderInlinesInto(node.children, div);
      return div;
    }

    default: {
      const p = document.createElement('p');
      p.textContent = '';
      return p;
    }
  }
}

// ── Inline rendering ──────────────────────────────────────────────────────────

function renderInlinesInto(nodes: InlineNode[], parent: HTMLElement): void {
  if (nodes.length === 0 || (nodes.length === 1 && nodes[0].type === 'text' && nodes[0].text === '')) {
    // Empty — add BR so the block is focusable
    parent.appendChild(document.createElement('br'));
    return;
  }

  for (const node of nodes) {
    if (node.type === 'hardbreak') {
      parent.appendChild(document.createElement('br'));
      continue;
    }

    // Build inline DOM with marks
    let el: Node = document.createTextNode(node.text);

    // Apply marks from outermost to innermost (reverse of serializer order)
    const marks = [...node.marks];
    for (const mark of marks.reverse()) {
      el = applyMarkToDOM(el, mark);
    }

    parent.appendChild(el);
  }
}

function applyMarkToDOM(inner: Node, mark: Mark): HTMLElement {
  let wrapper: HTMLElement;

  switch (mark.type) {
    case 'bold':          wrapper = document.createElement('strong'); break;
    case 'italic':        wrapper = document.createElement('em'); break;
    case 'underline':     wrapper = document.createElement('u'); break;
    case 'strikethrough': wrapper = document.createElement('s'); break;
    case 'code':          wrapper = document.createElement('code'); break;
    case 'link': {
      const lm = mark as LinkMark;
      const a = document.createElement('a');
      a.href = lm.href;
      if (lm.target === '_blank') {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      if (lm.title) a.title = lm.title;
      wrapper = a;
      break;
    }
    default:
      wrapper = document.createElement('span');
  }

  wrapper.appendChild(inner);
  return wrapper;
}
