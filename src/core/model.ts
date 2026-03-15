// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Document Model Operations
// ─────────────────────────────────────────────────────────────────────────────

import type {
  EditorDocument,
  BlockNode,
  InlineNode,
  TextNode,
  Mark,
  MarkType,
  ParagraphNode,
  HeadingNode,
  ListItemNode,
  BulletListNode,
  OrderedListNode,
  BlockquoteNode,
  CodeBlockNode,
  CalloutNode,
  CalloutVariant,
} from './types.js';

// ── Factories ─────────────────────────────────────────────────────────────────

export function createDocument(children?: BlockNode[]): EditorDocument {
  return { children: children ?? [createParagraph()] };
}

export function createParagraph(text = ''): ParagraphNode {
  return { type: 'paragraph', children: text ? [createText(text)] : [createText('')] };
}

export function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text = ''): HeadingNode {
  return { type: 'heading', level, children: [createText(text)] };
}

export function createText(text: string, marks: Mark[] = []): TextNode {
  return { type: 'text', text, marks };
}

export function createListItem(text = ''): ListItemNode {
  return { type: 'list_item', children: [createText(text)] };
}

export function createBulletList(items: string[] = ['']): BulletListNode {
  return { type: 'bullet_list', children: items.map(createListItem) };
}

export function createOrderedList(items: string[] = ['']): OrderedListNode {
  return { type: 'ordered_list', children: items.map(createListItem) };
}

export function createBlockquote(text = ''): BlockquoteNode {
  return { type: 'blockquote', children: [createParagraph(text)] };
}

export function createCodeBlock(code = '', lang?: string): CodeBlockNode {
  return { type: 'code_block', lang, children: [createText(code)] };
}

export function createCallout(text = '', variant: CalloutVariant = 'info'): CalloutNode {
  return { type: 'callout', variant, children: [createText(text)] };
}

// ── Mark helpers ─────────────────────────────────────────────────────────────

export function hasMark(node: TextNode, type: MarkType): boolean {
  return node.marks.some((m) => m.type === type);
}

export function addMark(node: TextNode, mark: Mark): TextNode {
  const filtered = node.marks.filter((m) => m.type !== mark.type);
  return { ...node, marks: [...filtered, mark] };
}

export function removeMark(node: TextNode, type: MarkType): TextNode {
  return { ...node, marks: node.marks.filter((m) => m.type !== type) };
}

export function toggleMark(node: TextNode, mark: Mark): TextNode {
  return hasMark(node, mark.type) ? removeMark(node, mark.type) : addMark(node, mark);
}

// ── Inline content helpers ────────────────────────────────────────────────────

/** Get plain text from inline nodes */
export function getPlainText(inlines: InlineNode[]): string {
  return inlines
    .map((n) => (n.type === 'text' ? n.text : '\n'))
    .join('');
}

/** Split inline content at a character offset, returns [before, after] */
export function splitInlinesAt(
  inlines: InlineNode[],
  offset: number,
): [InlineNode[], InlineNode[]] {
  const before: InlineNode[] = [];
  const after: InlineNode[] = [];
  let pos = 0;

  for (const node of inlines) {
    if (node.type === 'hardbreak') {
      if (pos < offset) before.push(node);
      else after.push(node);
      pos += 1;
      continue;
    }

    const end = pos + node.text.length;
    if (end <= offset) {
      before.push(node);
    } else if (pos >= offset) {
      after.push(node);
    } else {
      // split this text node
      const cut = offset - pos;
      before.push(createText(node.text.slice(0, cut), node.marks));
      after.push(createText(node.text.slice(cut), node.marks));
    }
    pos = end;
  }

  return [before, after];
}

/** Merge adjacent text nodes with identical marks */
export function normalizeInlines(inlines: InlineNode[]): InlineNode[] {
  const result: InlineNode[] = [];
  for (const node of inlines) {
    if (node.type !== 'text' || node.text === '') {
      if (node.type === 'hardbreak') result.push(node);
      continue;
    }
    const prev = result[result.length - 1];
    if (prev && prev.type === 'text' && marksEqual(prev.marks, node.marks)) {
      result[result.length - 1] = createText(prev.text + node.text, prev.marks);
    } else {
      result.push(node);
    }
  }
  // Always have at least one text node
  if (result.length === 0) result.push(createText(''));
  return result;
}

function marksEqual(a: Mark[], b: Mark[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((m, i) => m.type === b[i].type);
}

// ── Document helpers ──────────────────────────────────────────────────────────

/** Get total character length of a block's inline content */
export function blockLength(block: BlockNode): number {
  if (
    block.type === 'paragraph' ||
    block.type === 'heading' ||
    block.type === 'list_item' ||
    block.type === 'code_block'
  ) {
    return getPlainText(block.children as InlineNode[]).length;
  }
  if (block.type === 'bullet_list' || block.type === 'ordered_list') {
    return block.children.reduce((s, li) => s + blockLength(li), 0);
  }
  if (block.type === 'blockquote') {
    return block.children.reduce((s, b) => s + blockLength(b), 0);
  }
  return 0;
}

/** Create a fresh empty document */
export function emptyDocument(): EditorDocument {
  return createDocument([createParagraph('')]);
}
