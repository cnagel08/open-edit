import type { EditorDocument } from '../core/types.js';
/**
 * Full render: replace the content of `root` with a fresh render.
 * Attaches data-oe-key to each block element for future diffing.
 */
export declare function renderDocument(doc: EditorDocument, root: HTMLElement): void;
/**
 * Patch render: compare existing block elements by key and update only changed ones.
 * Blocks without a key get a fresh render.
 */
export declare function patchDocument(doc: EditorDocument, root: HTMLElement, keys: string[]): string[];
