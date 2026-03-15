// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Commands
// Each command receives the current document + the editor's contentEditable div
// and returns a new document (or null if nothing changed).
// Commands use execCommand for inline formatting (isolated to this file) while
// block-level operations manipulate the model directly.
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorDocument, BlockNode, MarkType, ListItemNode, CalloutVariant } from './types.js';
import { deserializeHTML } from '../io/deserializer.js';
import {
  createParagraph,
  createHeading,
  createBulletList,
  createOrderedList,
  createBlockquote,
  createCodeBlock,
  createCallout,
} from './model.js';

// ── Read DOM state → Model ────────────────────────────────────────────────────

/**
 * Re-sync the document model from the current DOM state.
 * Called after browser-native text input events.
 */
export function syncFromDOM(root: HTMLElement): EditorDocument {
  const html = root.innerHTML;
  return deserializeHTML(html);
}

// ── Inline Formatting ─────────────────────────────────────────────────────────
// We use a hybrid: execCommand for inline formatting (still works in all browsers
// for contentEditable), but we re-sync the model immediately after.

export function execInlineCommand(command: string, value?: string): void {
  document.execCommand(command, false, value ?? undefined);
}

// ── Block-level commands ──────────────────────────────────────────────────────

/**
 * Set the block type of the block containing the cursor.
 * Returns the updated document.
 */
export function setBlockType(
  doc: EditorDocument,
  blockIndex: number,
  newType: string,
  attrs?: Record<string, unknown>,
): EditorDocument {
  const blocks = [...doc.children];
  const block = blocks[blockIndex];
  if (!block) return doc;

  // Extract inline text from current block
  const inlineText = getBlockInlineText(block);

  let newBlock: BlockNode;
  switch (newType) {
    case 'paragraph':
      newBlock = { ...createParagraph(inlineText), ...(attrs ?? {}) } as BlockNode;
      break;
    case 'heading': {
      const level = (attrs?.level as 1 | 2 | 3 | 4 | 5 | 6) ?? 1;
      newBlock = createHeading(level, inlineText);
      break;
    }
    case 'h1': case 'H1':
      newBlock = createHeading(1, inlineText);
      break;
    case 'h2': case 'H2':
      newBlock = createHeading(2, inlineText);
      break;
    case 'h3': case 'H3':
      newBlock = createHeading(3, inlineText);
      break;
    case 'h4': case 'H4':
      newBlock = createHeading(4, inlineText);
      break;
    case 'h5': case 'H5':
      newBlock = createHeading(5, inlineText);
      break;
    case 'h6': case 'H6':
      newBlock = createHeading(6, inlineText);
      break;
    case 'blockquote': case 'BLOCKQUOTE':
      newBlock = createBlockquote(inlineText);
      break;
    case 'code_block': case 'PRE':
      newBlock = createCodeBlock(inlineText, attrs?.lang as string | undefined);
      break;
    case 'bullet_list':
      newBlock = createBulletList([inlineText]);
      break;
    case 'ordered_list':
      newBlock = createOrderedList([inlineText]);
      break;
    case 'callout': {
      const variant = (attrs?.variant as CalloutVariant) ?? 'info';
      newBlock = createCallout(inlineText, variant);
      break;
    }
    // CALLOUT-{variant} values from the block-type select
    case 'CALLOUT-info':
    case 'CALLOUT-success':
    case 'CALLOUT-warning':
    case 'CALLOUT-danger': {
      const variant = newType.split('-')[1] as CalloutVariant;
      newBlock = createCallout(inlineText, variant);
      break;
    }
    default:
      newBlock = createParagraph(inlineText);
  }

  blocks[blockIndex] = newBlock;
  return { children: blocks };
}

/**
 * Toggle a list type on the block at blockIndex.
 * If already that list type, convert back to paragraph.
 */
export function toggleList(
  doc: EditorDocument,
  blockIndex: number,
  listType: 'bullet_list' | 'ordered_list',
): EditorDocument {
  const blocks = [...doc.children];
  const block = blocks[blockIndex];
  if (!block) return doc;

  if (block.type === listType) {
    // Unwrap: convert list items back to paragraphs
    const listBlock = block as { children: ListItemNode[] };
    const newBlocks = listBlock.children.map((li) =>
      createParagraph(li.children.map((n) => (n.type === 'text' ? n.text : '')).join(''))
    );
    blocks.splice(blockIndex, 1, ...newBlocks);
  } else if (block.type === 'bullet_list' || block.type === 'ordered_list') {
    // Switch list type
    const listBlock = block as { children: ListItemNode[] };
    if (listType === 'bullet_list') {
      blocks[blockIndex] = { type: 'bullet_list', children: listBlock.children };
    } else {
      blocks[blockIndex] = { type: 'ordered_list', children: listBlock.children };
    }
  } else {
    // Convert to list
    const text = getBlockInlineText(block);
    blocks[blockIndex] = listType === 'bullet_list'
      ? createBulletList([text])
      : createOrderedList([text]);
  }

  return { children: blocks };
}

/**
 * Set text alignment on the block at blockIndex.
 */
export function setAlignment(
  doc: EditorDocument,
  blockIndex: number,
  align: 'left' | 'center' | 'right' | 'justify',
): EditorDocument {
  const blocks = [...doc.children];
  const block = blocks[blockIndex];
  if (!block) return doc;

  if (block.type === 'paragraph' || block.type === 'heading') {
    blocks[blockIndex] = { ...block, align };
  }

  return { children: blocks };
}

/**
 * Insert an image node after the block at blockIndex.
 */
export function insertImage(
  doc: EditorDocument,
  blockIndex: number,
  src: string,
  alt?: string,
): EditorDocument {
  const blocks = [...doc.children];
  const imageNode: BlockNode = { type: 'image', src, alt };
  // Insert after current block, then add empty paragraph
  blocks.splice(blockIndex + 1, 0, imageNode, createParagraph(''));
  return { children: blocks };
}

/**
 * Insert a horizontal rule after the block at blockIndex.
 */
export function insertHr(doc: EditorDocument, blockIndex: number): EditorDocument {
  const blocks = [...doc.children];
  blocks.splice(blockIndex + 1, 0, { type: 'hr' }, createParagraph(''));
  return { children: blocks };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBlockInlineText(block: BlockNode): string {
  if (
    block.type === 'paragraph' ||
    block.type === 'heading' ||
    block.type === 'list_item' ||
    block.type === 'code_block' ||
    block.type === 'callout'
  ) {
    return block.children
      .map((n) => (n.type === 'text' ? n.text : ''))
      .join('');
  }
  if (block.type === 'bullet_list' || block.type === 'ordered_list') {
    return block.children
      .map((li) => li.children.map((n) => (n.type === 'text' ? n.text : '')).join(''))
      .join(' ');
  }
  if (block.type === 'blockquote') {
    return block.children.map(getBlockInlineText).join(' ');
  }
  return '';
}

// ── Active state queries ──────────────────────────────────────────────────────

export function isMarkActiveInDOM(markType: MarkType): boolean {
  const commandMap: Partial<Record<MarkType, string>> = {
    bold: 'bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'strikethrough',
  };
  const cmd = commandMap[markType];
  if (!cmd) return false;
  try {
    return document.queryCommandState(cmd);
  } catch {
    return false;
  }
}

export function getBlockTypeFromDOM(root: HTMLElement): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 'p';

  let node: Node | null = sel.anchorNode;
  while (node && node.parentNode !== root) {
    node = node.parentNode;
  }

  if (!node || node.nodeType !== Node.ELEMENT_NODE) return 'p';
  const tag = (node as Element).tagName.toLowerCase();

  // Map tag to select option value
  if (tag === 'h1') return 'H1';
  if (tag === 'h2') return 'H2';
  if (tag === 'h3') return 'H3';
  if (tag === 'h4') return 'H4';
  if (tag === 'blockquote') return 'BLOCKQUOTE';
  if (tag === 'pre') return 'PRE';
  if (tag === 'ul') return 'bullet_list';
  if (tag === 'ol') return 'ordered_list';
  if (tag === 'div' && (node as Element).classList?.contains('oe-callout')) {
    const variant = (node as HTMLElement).dataset?.calloutVariant ?? 'info';
    return `CALLOUT-${variant}`;
  }
  return 'P';
}

export function getAlignmentFromDOM(root: HTMLElement): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 'left';

  let node: Node | null = sel.anchorNode;
  while (node && node.parentNode !== root) {
    node = node.parentNode;
  }

  if (!node || node.nodeType !== Node.ELEMENT_NODE) return 'left';
  const style = (node as HTMLElement).style.textAlign;
  return style || 'left';
}

// ── Link command ──────────────────────────────────────────────────────────────

export function insertLink(href: string, target: string): void {
  document.execCommand('createLink', false, href);
  // Set target on the newly created link
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const link = range.startContainer.parentElement?.closest('a');
    if (link) {
      link.target = target;
      if (target === '_blank') link.rel = 'noopener noreferrer';
    }
  }
}
