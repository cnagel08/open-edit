// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — HTML Serializer (Document Model → Clean HTML)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  EditorDocument,
  BlockNode,
  InlineNode,
  TextNode,
  Mark,
  MarkType,
  LinkMark,
} from '../core/types.js';

// ── Public API ────────────────────────────────────────────────────────────────

export function serializeToHTML(doc: EditorDocument): string {
  return doc.children.map(serializeBlock).join('\n');
}

// ── Block serialization ───────────────────────────────────────────────────────

function serializeBlock(node: BlockNode): string {
  switch (node.type) {
    case 'paragraph': {
      const content = serializeInlines(node.children);
      const align = node.align && node.align !== 'left' ? ` style="text-align:${node.align}"` : '';
      return `<p${align}>${content || '<br>'}</p>`;
    }

    case 'heading': {
      const content = serializeInlines(node.children);
      const align = node.align && node.align !== 'left' ? ` style="text-align:${node.align}"` : '';
      return `<h${node.level}${align}>${content}</h${node.level}>`;
    }

    case 'blockquote': {
      const inner = node.children.map(serializeBlock).join('\n');
      return `<blockquote>\n${inner}\n</blockquote>`;
    }

    case 'code_block': {
      const code = escapeHTML(node.children.map((t) => t.text).join(''));
      const lang = node.lang ? ` class="language-${node.lang}"` : '';
      return `<pre><code${lang}>${code}</code></pre>`;
    }

    case 'bullet_list': {
      const items = node.children
        .map((li) => `  <li>${serializeInlines(li.children)}</li>`)
        .join('\n');
      return `<ul>\n${items}\n</ul>`;
    }

    case 'ordered_list': {
      const start = node.start && node.start !== 1 ? ` start="${node.start}"` : '';
      const items = node.children
        .map((li) => `  <li>${serializeInlines(li.children)}</li>`)
        .join('\n');
      return `<ol${start}>\n${items}\n</ol>`;
    }

    case 'image': {
      const alt = node.alt ? ` alt="${escapeAttr(node.alt)}"` : '';
      const w = node.width ? ` width="${node.width}"` : '';
      const h = node.height ? ` height="${node.height}"` : '';
      return `<img src="${escapeAttr(node.src)}"${alt}${w}${h}>`;
    }

    case 'hr':
      return '<hr>';

    case 'callout': {
      const content = serializeInlines(node.children);
      return `<div class="oe-callout oe-callout-${node.variant}" data-callout-variant="${node.variant}">${content || '<br>'}</div>`;
    }

    default:
      return '';
  }
}

// ── Inline serialization ──────────────────────────────────────────────────────

function serializeInlines(nodes: InlineNode[]): string {
  // Group consecutive text nodes by their marks to minimize nesting
  return nodes.map(serializeInline).join('');
}

function serializeInline(node: InlineNode): string {
  if (node.type === 'hardbreak') return '<br>';

  let text = escapeHTML(node.text);
  if (text === '' && node.marks.length === 0) return '';

  // Apply marks from inside out: innermost = last mark applied
  // Order: code > link > bold > italic > underline > strikethrough
  const marks = [...node.marks].sort(markOrder);

  for (const mark of marks) {
    text = applyMark(text, mark);
  }
  return text;
}

function markOrder(a: Mark, b: Mark): number {
  const order: MarkType[] = ['strikethrough', 'underline', 'italic', 'bold', 'link', 'code'];
  return order.indexOf(a.type) - order.indexOf(b.type);
}

function applyMark(text: string, mark: Mark): string {
  switch (mark.type) {
    case 'bold':        return `<strong>${text}</strong>`;
    case 'italic':      return `<em>${text}</em>`;
    case 'underline':   return `<u>${text}</u>`;
    case 'code':        return `<code>${text}</code>`;
    case 'strikethrough': return `<s>${text}</s>`;
    case 'link': {
      const lm = mark as LinkMark;
      const target = lm.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
      const title = lm.title ? ` title="${escapeAttr(lm.title)}"` : '';
      return `<a href="${escapeAttr(lm.href)}"${target}${title}>${text}</a>`;
    }
    default:
      return text;
  }
}

// ── Escape helpers ────────────────────────────────────────────────────────────

export function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
