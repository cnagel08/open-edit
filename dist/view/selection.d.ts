import type { EditorDocument, ModelSelection } from '../core/types.js';
/**
 * Convert the current browser selection into a ModelSelection.
 * Returns null if there's no valid selection within the editor root.
 */
export declare function domSelectionToModel(root: HTMLElement, _doc: EditorDocument): ModelSelection | null;
/**
 * Restore a selection in the DOM after a re-render.
 * Uses character offsets to find the correct text node.
 */
export declare function modelSelectionToDOM(root: HTMLElement, sel: ModelSelection): void;
/** Get the block index of the element containing the current cursor */
export declare function getActiveBlockIndex(root: HTMLElement): number;
/** Get the tag name of the block element containing the cursor */
export declare function getActiveBlockTag(root: HTMLElement): string;
/** Collect all mark types active on every character in the current selection */
export declare function getActiveMarks(root: HTMLElement): Set<string>;
