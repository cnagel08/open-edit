// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Markdown Serializer & Deserializer (K9)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  EditorDocument,
  BlockNode,
  InlineNode,
  ListItemNode,
  Mark,
  LinkMark,
  CalloutVariant,
} from '../core/types.js';
import { createText, createParagraph, emptyDocument } from '../core/model.js';

// ── Markdown Serializer (Model → Markdown) ────────────────────────────────────

export function serializeToMarkdown(doc: EditorDocument): string {
  return doc.children.map(serializeMdBlock).filter(Boolean).join('\n\n');
}

function serializeMdBlock(node: BlockNode): string {
  switch (node.type) {
    case 'paragraph':
      return serializeMdInlines(node.children);

    case 'heading':
      return `${'#'.repeat(node.level)} ${serializeMdInlines(node.children)}`;

    case 'blockquote': {
      const inner = node.children.map(serializeMdBlock).join('\n\n');
      return inner.split('\n').map((l) => `> ${l}`).join('\n');
    }

    case 'code_block': {
      const lang = node.lang ?? '';
      const code = node.children.map((t) => t.text).join('');
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }

    case 'bullet_list':
      return node.children.map((li) => `- ${serializeMdInlines(li.children)}`).join('\n');

    case 'ordered_list': {
      const start = node.start ?? 1;
      return node.children
        .map((li, i) => `${start + i}. ${serializeMdInlines(li.children)}`)
        .join('\n');
    }

    case 'image':
      return `![${node.alt ?? ''}](${node.src})`;

    case 'hr':
      return '---';

    case 'callout': {
      const variant = node.variant ?? 'info';
      const text = serializeMdInlines(node.children);
      // Multi-line: prefix every line with "> " (empty lines get bare ">")
      const body = text.split('\n').map((l) => l ? `> ${l}` : '>').join('\n');
      return `> [!${variant}]\n${body}`;
    }

    default:
      return '';
  }
}

function serializeMdInlines(nodes: InlineNode[]): string {
  return nodes.map(serializeMdInline).join('');
}

function serializeMdInline(node: InlineNode): string {
  if (node.type === 'hardbreak') return '\n';

  let text = node.text;

  // Sort marks for consistent output (outermost → innermost)
  const marks = [...node.marks].sort((a, b) => {
    const order: Mark['type'][] = ['link', 'bold', 'italic', 'strikethrough', 'underline', 'code'];
    return order.indexOf(a.type) - order.indexOf(b.type);
  });

  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':          text = `**${text}**`; break;
      case 'italic':        text = `*${text}*`; break;
      case 'code':          text = `\`${text}\``; break;
      case 'strikethrough': text = `~~${text}~~`; break;
      case 'underline':     text = `<u>${text}</u>`; break;
      case 'link': {
        const lm = mark as LinkMark;
        const title = lm.title ? ` "${lm.title}"` : '';
        text = `[${text}](${lm.href}${title})`;
        break;
      }
    }
  }

  return text;
}

// ── Markdown Deserializer (Markdown → Model) ──────────────────────────────────

export function deserializeMarkdown(md: string): EditorDocument {
  if (!md || md.trim() === '') return emptyDocument();
  const blocks = parseMdBlocks(md);
  return blocks.length > 0 ? { children: blocks } : emptyDocument();
}

function parseMdBlocks(md: string): BlockNode[] {
  const lines = md.split('\n');
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line: skip
    if (line.trim() === '') { i++; continue; }

    // Code fence
    const fenceMatch = line.match(/^(`{3,}|~{3,})(.*)/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const lang = fenceMatch[2].trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith(fence)) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing fence
      blocks.push({
        type: 'code_block',
        ...(lang ? { lang } : {}),
        children: [createText(codeLines.join('\n'))],
      });
      continue;
    }

    // ATX Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({
        type: 'heading',
        level,
        children: parseMdInlines(headingMatch[2].trim()),
      });
      i++;
      continue;
    }

    // HR
    if (/^[-*_]{3,}\s*$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Blockquote / Callout  (> [!variant] syntax)
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].slice(1).trimStart());
        i++;
      }

      // Callout: first line is [!variant]
      const calloutMatch = quoteLines[0]?.match(/^\[!(info|success|warning|danger)\]$/i);
      if (calloutMatch) {
        const variant = calloutMatch[1].toLowerCase() as CalloutVariant;
        const contentText = quoteLines.slice(1).join('\n');
        blocks.push({
          type: 'callout',
          variant,
          children: parseMdInlines(contentText),
        });
        continue;
      }

      const innerBlocks = parseMdBlocks(quoteLines.join('\n'));
      blocks.push({
        type: 'blockquote',
        children: innerBlocks.length > 0 ? innerBlocks : [createParagraph('')],
      });
      continue;
    }

    // Unordered list
    if (/^[-*+] /.test(line)) {
      const items: ListItemNode[] = [];
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items.push({
          type: 'list_item',
          children: parseMdInlines(lines[i].replace(/^[-*+]\s+/, '')),
        });
        i++;
      }
      blocks.push({ type: 'bullet_list', children: items });
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items: ListItemNode[] = [];
      const startMatch = line.match(/^(\d+)\./);
      const start = startMatch ? parseInt(startMatch[1]) : 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push({
          type: 'list_item',
          children: parseMdInlines(lines[i].replace(/^\d+\.\s+/, '')),
        });
        i++;
      }
      blocks.push({
        type: 'ordered_list',
        ...(start !== 1 ? { start } : {}),
        children: items,
      });
      continue;
    }

    // Standalone image
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (imgMatch) {
      blocks.push({ type: 'image', alt: imgMatch[1] || undefined, src: imgMatch[2] });
      i++;
      continue;
    }

    // Paragraph: accumulate until blank line or block start
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !isMdBlockStart(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', children: parseMdInlines(paraLines.join(' ')) });
    }
  }

  return blocks;
}

function isMdBlockStart(line: string): boolean {
  return (
    /^#{1,6}\s/.test(line) ||
    /^(`{3,}|~{3,})/.test(line) ||
    line.startsWith('>') ||
    /^[-*+] /.test(line) ||
    /^\d+\. /.test(line) ||
    /^[-*_]{3,}\s*$/.test(line.trim())
  );
}

// ── Inline Parsing ────────────────────────────────────────────────────────────

type InlinePattern = {
  re: RegExp;
  handler: (match: RegExpExecArray) => InlineNode[];
  priority: number; // lower = higher priority when same index
};

const INLINE_PATTERNS: InlinePattern[] = [
  // Code (highest priority — never parse inside)
  {
    re: /`([^`]+)`/,
    priority: 0,
    handler: (m) => [createText(m[1], [{ type: 'code' }])],
  },
  // Link: [text](url "title")
  {
    re: /\[([^\]]+)\]\(([^) "]+)(?:\s+"([^"]*)")?\)/,
    priority: 1,
    handler: (m) => {
      const inner = parseMdInlines(m[1]);
      const lm: LinkMark = { type: 'link', href: m[2], target: '_self', ...(m[3] ? { title: m[3] } : {}) };
      return inner.map((n) => {
        if (n.type === 'text') return createText(n.text, [...n.marks, lm]);
        return n;
      });
    },
  },
  // Image (inline)
  {
    re: /!\[([^\]]*)\]\(([^)]+)\)/,
    priority: 1,
    handler: (m) => [createText(`[${m[1] || 'image'}]`, [])],
  },
  // Bold **text** or __text__
  {
    re: /\*\*([^*]+)\*\*|__([^_]+)__/,
    priority: 2,
    handler: (m) => {
      const text = m[1] ?? m[2];
      return parseMdInlinesWithMark(text, { type: 'bold' });
    },
  },
  // Italic *text* or _text_ (must come after bold)
  {
    re: /\*([^*]+)\*|_([^_]+)_/,
    priority: 3,
    handler: (m) => {
      const text = m[1] ?? m[2];
      return parseMdInlinesWithMark(text, { type: 'italic' });
    },
  },
  // Strikethrough ~~text~~
  {
    re: /~~([^~]+)~~/,
    priority: 2,
    handler: (m) => parseMdInlinesWithMark(m[1], { type: 'strikethrough' }),
  },
  // Underline <u>text</u>
  {
    re: /<u>([^<]+)<\/u>/,
    priority: 2,
    handler: (m) => parseMdInlinesWithMark(m[1], { type: 'underline' }),
  },
];

function parseMdInlines(text: string): InlineNode[] {
  if (!text) return [createText('', [])];

  const result: InlineNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Find the earliest matching pattern
    let best: { index: number; match: RegExpExecArray; pattern: InlinePattern } | null = null;

    for (const pattern of INLINE_PATTERNS) {
      const re = new RegExp(pattern.re.source, pattern.re.flags.replace('g', ''));
      const match = re.exec(remaining);
      if (match === null) continue;

      const idx = match.index;
      if (
        !best ||
        idx < best.index ||
        (idx === best.index && pattern.priority < best.pattern.priority) ||
        (idx === best.index && pattern.priority === best.pattern.priority && match[0].length > best.match[0].length)
      ) {
        best = { index: idx, match, pattern };
      }
    }

    if (!best) {
      // No more patterns: rest is plain text
      result.push(createText(remaining, []));
      break;
    }

    // Plain text before match
    if (best.index > 0) {
      result.push(createText(remaining.slice(0, best.index), []));
    }

    // Matched nodes
    result.push(...best.pattern.handler(best.match));
    remaining = remaining.slice(best.index + best.match[0].length);
  }

  return result.length > 0 ? result : [createText(text, [])];
}

function parseMdInlinesWithMark(text: string, mark: Mark): InlineNode[] {
  const inner = parseMdInlines(text);
  return inner.map((node) => {
    if (node.type === 'text') {
      return createText(node.text, [...node.marks, mark]);
    }
    return node;
  });
}
