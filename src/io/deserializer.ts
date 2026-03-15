// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — HTML Deserializer (HTML string → Document Model)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  EditorDocument,
  BlockNode,
  InlineNode,
  TextNode,
  Mark,
  LinkMark,
  ParagraphNode,
  HeadingNode,
  ListItemNode,
  CalloutNode,
  CalloutVariant,
} from '../core/types.js';
import { createParagraph, createText, emptyDocument } from '../core/model.js';

const CALLOUT_VARIANTS: CalloutVariant[] = ['info', 'success', 'warning', 'danger'];

// ── Public API ────────────────────────────────────────────────────────────────

export function deserializeHTML(html: string): EditorDocument {
  if (!html || html.trim() === '') return emptyDocument();

  const container = document.createElement('div');
  container.innerHTML = sanitizeInput(html);

  const blocks = parseChildren(container);

  if (blocks.length === 0) return emptyDocument();
  return { children: blocks };
}

// ── Sanitize / normalize input HTML ──────────────────────────────────────────

function sanitizeInput(html: string): string {
  // Basic: remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/\s+on\w+='[^']*'/gi, '');
}

// ── Block-level parsing ───────────────────────────────────────────────────────

function parseChildren(el: Element): BlockNode[] {
  const blocks: BlockNode[] = [];

  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = (child.textContent ?? '').trim();
      if (text) {
        blocks.push(createParagraph(text));
      }
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const node = child as Element;
    const tag = node.tagName.toLowerCase();
    const block = parseBlockNode(node, tag);
    if (block) blocks.push(block);
  }

  return blocks;
}

function parseBlockNode(node: Element, tag: string): BlockNode | null {
  switch (tag) {
    case 'p':
      return parseParagraph(node);

    case 'h1': case 'h2': case 'h3':
    case 'h4': case 'h5': case 'h6':
      return parseHeading(node, parseInt(tag[1]) as 1|2|3|4|5|6);

    case 'blockquote':
      return parseBlockquote(node);

    case 'pre':
      return parseCodeBlock(node);

    case 'ul':
      return parseBulletList(node);

    case 'ol':
      return parseOrderedList(node);

    case 'img':
      return parseImage(node);

    case 'hr':
      return { type: 'hr' };

    case 'div':
      // Recognize callout blocks before generic unwrapping
      if (node.classList.contains('oe-callout')) {
        return parseCallout(node);
      }
      // Unwrap generic containers
      return parseChildren(node)[0] ?? null;

    case 'section': case 'article': case 'main':
      // Unwrap generic containers
      return parseChildren(node)[0] ?? null;

    case 'br':
      return createParagraph('');

    default:
      // Treat unknown block-ish elements as paragraphs
      return parseParagraph(node);
  }
}

function parseParagraph(node: Element): ParagraphNode {
  const align = parseAlign(node);
  const children = parseInlineNodes(node);
  return { type: 'paragraph', ...(align ? { align } : {}), children };
}

function parseHeading(node: Element, level: 1|2|3|4|5|6): HeadingNode {
  const align = parseAlign(node);
  const children = parseInlineNodes(node);
  return { type: 'heading', level, ...(align ? { align } : {}), children };
}

function parseBlockquote(node: Element): BlockNode {
  const children = parseChildren(node);
  if (children.length === 0) children.push(createParagraph(''));
  return { type: 'blockquote', children };
}

function parseCodeBlock(node: Element): BlockNode {
  const codeEl = node.querySelector('code');
  const rawText = codeEl ? codeEl.textContent ?? '' : node.textContent ?? '';
  // Try to detect language from class
  const lang = codeEl?.className.match(/language-(\w+)/)?.[1];
  return {
    type: 'code_block',
    ...(lang ? { lang } : {}),
    children: [createText(rawText)],
  };
}

function parseBulletList(node: Element): BlockNode {
  const items = Array.from(node.querySelectorAll(':scope > li')).map(parseListItem);
  if (items.length === 0) items.push({ type: 'list_item', children: [createText('')] });
  return { type: 'bullet_list', children: items };
}

function parseOrderedList(node: Element): BlockNode {
  const start = parseInt(node.getAttribute('start') ?? '1');
  const items = Array.from(node.querySelectorAll(':scope > li')).map(parseListItem);
  if (items.length === 0) items.push({ type: 'list_item', children: [createText('')] });
  return { type: 'ordered_list', ...(start !== 1 ? { start } : {}), children: items };
}

function parseListItem(node: Element): ListItemNode {
  // Only take inline content, ignore nested lists for now
  const children = parseInlineNodes(node);
  return { type: 'list_item', children };
}

function parseCallout(node: Element): CalloutNode {
  const dataVariant = node.getAttribute('data-callout-variant');
  const variant: CalloutVariant =
    CALLOUT_VARIANTS.includes(dataVariant as CalloutVariant)
      ? (dataVariant as CalloutVariant)
      : (CALLOUT_VARIANTS.find((v) => node.classList.contains(`oe-callout-${v}`)) ?? 'info');
  const children = parseInlineNodes(node);
  return { type: 'callout', variant, children };
}

function parseImage(node: Element): BlockNode {
  return {
    type: 'image',
    src: node.getAttribute('src') ?? '',
    alt: node.getAttribute('alt') ?? undefined,
    width: node.getAttribute('width') ? parseInt(node.getAttribute('width')!) : undefined,
    height: node.getAttribute('height') ? parseInt(node.getAttribute('height')!) : undefined,
  };
}

// ── Inline parsing ────────────────────────────────────────────────────────────

function parseInlineNodes(el: Element | ChildNode, marks: Mark[] = []): InlineNode[] {
  const result: InlineNode[] = [];

  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? '';
      if (text) result.push(createText(text, [...marks]));
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const node = child as Element;
    const tag = node.tagName.toLowerCase();
    const newMarks = marksForTag(tag, node, marks);

    if (tag === 'br') {
      result.push({ type: 'hardbreak' });
      continue;
    }

    if (tag === 'img') {
      // Inline image — treat as text placeholder for now
      result.push(createText('[image]', marks));
      continue;
    }

    result.push(...parseInlineNodes(node, newMarks));
  }

  // Ensure at least empty text
  if (result.length === 0) result.push(createText('', marks));
  return result;
}

function marksForTag(tag: string, node: Element, existing: Mark[]): Mark[] {
  const marks = [...existing];

  switch (tag) {
    case 'strong': case 'b':
      if (!marks.some((m) => m.type === 'bold')) marks.push({ type: 'bold' });
      break;
    case 'em': case 'i':
      if (!marks.some((m) => m.type === 'italic')) marks.push({ type: 'italic' });
      break;
    case 'u':
      if (!marks.some((m) => m.type === 'underline')) marks.push({ type: 'underline' });
      break;
    case 's': case 'del': case 'strike':
      if (!marks.some((m) => m.type === 'strikethrough')) marks.push({ type: 'strikethrough' });
      break;
    case 'code':
      if (!marks.some((m) => m.type === 'code')) marks.push({ type: 'code' });
      break;
    case 'a': {
      const href = node.getAttribute('href') ?? '';
      const target = node.getAttribute('target') === '_blank' ? '_blank' : '_self';
      const lm: LinkMark = { type: 'link', href, target };
      if (!marks.some((m) => m.type === 'link')) marks.push(lm);
      break;
    }
    case 'mark':
      // Treat highlight as no mark (preserve text)
      break;
  }

  return marks;
}

// ── Alignment helper ──────────────────────────────────────────────────────────

function parseAlign(node: Element): 'left' | 'center' | 'right' | 'justify' | undefined {
  const style = node.getAttribute('style') ?? '';
  const match = style.match(/text-align\s*:\s*(left|center|right|justify)/);
  return match ? (match[1] as 'left' | 'center' | 'right' | 'justify') : undefined;
}

// ── Unused export kept for type compatibility ──────────────────────────────────
export type { TextNode };
