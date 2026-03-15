// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Selection utilities
// Maps between DOM selections and the editor's model positions.
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorDocument, ModelSelection, ModelPosition } from '../core/types.js';

// ── DOM → Model ───────────────────────────────────────────────────────────────

/**
 * Convert the current browser selection into a ModelSelection.
 * Returns null if there's no valid selection within the editor root.
 */
export function domSelectionToModel(
  root: HTMLElement,
  _doc: EditorDocument,
): ModelSelection | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;

  const anchor = domPointToModel(root, sel.anchorNode!, sel.anchorOffset);
  const focus = domPointToModel(root, sel.focusNode!, sel.focusOffset);

  if (!anchor || !focus) return null;

  return {
    anchor,
    focus,
    isCollapsed: sel.isCollapsed,
  };
}

function domPointToModel(
  root: HTMLElement,
  node: Node,
  offset: number,
): ModelPosition | null {
  // Walk up to find the top-level block element
  let blockEl: Element | null = null;
  let current: Node | null = node;

  while (current && current !== root) {
    if (current.parentNode === root && current.nodeType === Node.ELEMENT_NODE) {
      blockEl = current as Element;
      break;
    }
    current = current.parentNode;
  }

  if (!blockEl) return null;

  const blockIndex = Array.from(root.children).indexOf(blockEl);
  if (blockIndex < 0) return null;

  // Calculate char offset within the block's text content
  const charOffset = getCharOffsetInBlock(blockEl, node, offset);

  // Check if it's inside a list item
  const liEl = findAncestorLi(node, blockEl);
  if (liEl) {
    const ul = liEl.parentElement!;
    const itemIndex = Array.from(ul.children).indexOf(liEl);
    return { blockIndex, itemIndex, offset: charOffset };
  }

  return { blockIndex, offset: charOffset };
}

function findAncestorLi(node: Node, stopAt: Element): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== stopAt) {
    if (current.nodeType === Node.ELEMENT_NODE && (current as Element).tagName === 'LI') {
      return current as HTMLElement;
    }
    current = current.parentNode;
  }
  return null;
}

/** Get character offset of a DOM point within a container element */
function getCharOffsetInBlock(container: Element, targetNode: Node, targetOffset: number): number {
  let total = 0;
  const found = walkForOffset(container, targetNode, targetOffset, { count: 0, done: false, result: 0 });
  return found.result;
}

interface WalkState {
  count: number;
  done: boolean;
  result: number;
}

function walkForOffset(node: Node, target: Node, targetOffset: number, state: WalkState): WalkState {
  if (state.done) return state;

  if (node === target) {
    state.result = state.count + (node.nodeType === Node.TEXT_NODE ? targetOffset : 0);
    state.done = true;
    return state;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    state.count += (node.textContent ?? '').length;
    return state;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const tag = (node as Element).tagName.toLowerCase();
    if (tag === 'br') {
      // BR at the end of a block = cursor position there
      if (node === target) {
        state.result = state.count;
        state.done = true;
      }
      return state;
    }
  }

  for (const child of Array.from(node.childNodes)) {
    state = walkForOffset(child, target, targetOffset, state);
    if (state.done) break;
  }

  return state;
}

// ── Model → DOM (restore selection after re-render) ──────────────────────────

/**
 * Restore a selection in the DOM after a re-render.
 * Uses character offsets to find the correct text node.
 */
export function modelSelectionToDOM(
  root: HTMLElement,
  sel: ModelSelection,
): void {
  try {
    const anchorPoint = modelPointToDOM(root, sel.anchor);
    const focusPoint = modelPointToDOM(root, sel.focus);

    if (!anchorPoint || !focusPoint) return;

    const domSel = window.getSelection();
    if (!domSel) return;

    const range = document.createRange();
    range.setStart(anchorPoint.node, anchorPoint.offset);
    range.collapse(sel.isCollapsed);

    domSel.removeAllRanges();
    domSel.addRange(range);

    if (!sel.isCollapsed) {
      domSel.extend(focusPoint.node, focusPoint.offset);
    }
  } catch {
    // Selection restoration can fail — ignore silently
  }
}

interface DOMPoint {
  node: Node;
  offset: number;
}

function modelPointToDOM(
  root: HTMLElement,
  pos: ModelPosition,
): DOMPoint | null {
  const blockEl = root.children[pos.blockIndex];
  if (!blockEl) return null;

  let targetEl: Element = blockEl;

  // If it's a list and we have an itemIndex
  if (pos.itemIndex !== undefined) {
    const li = blockEl.children[pos.itemIndex];
    if (li) targetEl = li;
  }

  return findDOMPoint(targetEl, pos.offset);
}

function findDOMPoint(container: Element, targetOffset: number): DOMPoint | null {
  let remaining = targetOffset;

  const result = walkDOMForPoint(container, remaining);
  if (result) return result;

  // Fallback: end of container
  const lastChild = container.lastChild;
  if (lastChild) {
    if (lastChild.nodeType === Node.TEXT_NODE) {
      return { node: lastChild, offset: (lastChild.textContent ?? '').length };
    }
    return { node: container, offset: container.childNodes.length };
  }

  return { node: container, offset: 0 };
}

function walkDOMForPoint(node: Node, remaining: number): DOMPoint | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const len = (node.textContent ?? '').length;
    if (remaining <= len) {
      return { node, offset: remaining };
    }
    return null; // Not in this node
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const tag = (node as Element).tagName.toLowerCase();
    if (tag === 'br') {
      if (remaining === 0) {
        return { node: node.parentNode!, offset: Array.from(node.parentNode!.childNodes).indexOf(node as ChildNode) };
      }
      return null;
    }
  }

  let consumed = 0;
  for (const child of Array.from(node.childNodes)) {
    const childLen = getNodeTextLength(child);
    if (consumed + childLen >= remaining) {
      const result = walkDOMForPoint(child, remaining - consumed);
      if (result) return result;
    }
    consumed += childLen;
  }

  return null;
}

function getNodeTextLength(node: Node): number {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').length;
  if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'BR') return 0;
  let total = 0;
  for (const child of Array.from(node.childNodes)) total += getNodeTextLength(child);
  return total;
}

// ── Query helpers ─────────────────────────────────────────────────────────────

/** Get the block index of the element containing the current cursor */
export function getActiveBlockIndex(root: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;

  let node: Node | null = sel.anchorNode;
  while (node && node.parentNode !== root) {
    node = node.parentNode;
  }

  if (!node) return 0;
  return Array.from(root.children).indexOf(node as Element);
}

/** Get the tag name of the block element containing the cursor */
export function getActiveBlockTag(root: HTMLElement): string {
  const idx = getActiveBlockIndex(root);
  const el = root.children[idx];
  return el ? el.tagName.toLowerCase() : 'p';
}

/** Collect all mark types active on every character in the current selection */
export function getActiveMarks(root: HTMLElement): Set<string> {
  const sel = window.getSelection();
  const active = new Set<string>();
  if (!sel || sel.rangeCount === 0) return active;

  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return active;

  // Walk ancestors of anchor node collecting formatting elements
  let node: Node | null = sel.anchorNode;
  while (node && node !== root) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as Element).tagName.toLowerCase();
      if (tag === 'strong' || tag === 'b') active.add('bold');
      if (tag === 'em' || tag === 'i') active.add('italic');
      if (tag === 'u') active.add('underline');
      if (tag === 's' || tag === 'del') active.add('strikethrough');
      if (tag === 'code') active.add('code');
      if (tag === 'a') active.add('link');
    }
    node = node.parentNode;
  }

  return active;
}
