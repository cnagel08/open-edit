import type { EditorDocument, MarkType } from './types.js';
/**
 * Re-sync the document model from the current DOM state.
 * Called after browser-native text input events.
 */
export declare function syncFromDOM(root: HTMLElement): EditorDocument;
export declare function execInlineCommand(command: string, value?: string): void;
/**
 * Set the block type of the block containing the cursor.
 * Returns the updated document.
 */
export declare function setBlockType(doc: EditorDocument, blockIndex: number, newType: string, attrs?: Record<string, unknown>): EditorDocument;
/**
 * Toggle a list type on the block at blockIndex.
 * If already that list type, convert back to paragraph.
 */
export declare function toggleList(doc: EditorDocument, blockIndex: number, listType: 'bullet_list' | 'ordered_list'): EditorDocument;
/**
 * Set text alignment on the block at blockIndex.
 */
export declare function setAlignment(doc: EditorDocument, blockIndex: number, align: 'left' | 'center' | 'right' | 'justify'): EditorDocument;
/**
 * Insert an image node after the block at blockIndex.
 */
export declare function insertImage(doc: EditorDocument, blockIndex: number, src: string, alt?: string): EditorDocument;
/**
 * Insert a horizontal rule after the block at blockIndex.
 */
export declare function insertHr(doc: EditorDocument, blockIndex: number): EditorDocument;
export declare function isMarkActiveInDOM(markType: MarkType): boolean;
export declare function getBlockTypeFromDOM(root: HTMLElement): string;
export declare function getAlignmentFromDOM(root: HTMLElement): string;
export declare function insertLink(href: string, target: string): void;
