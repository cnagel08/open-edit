import type { EditorDocument, BlockNode, InlineNode, TextNode, Mark, MarkType, ParagraphNode, HeadingNode, ListItemNode, BulletListNode, OrderedListNode, BlockquoteNode, CodeBlockNode, CalloutNode, CalloutVariant } from './types.js';
export declare function createDocument(children?: BlockNode[]): EditorDocument;
export declare function createParagraph(text?: string): ParagraphNode;
export declare function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text?: string): HeadingNode;
export declare function createText(text: string, marks?: Mark[]): TextNode;
export declare function createListItem(text?: string): ListItemNode;
export declare function createBulletList(items?: string[]): BulletListNode;
export declare function createOrderedList(items?: string[]): OrderedListNode;
export declare function createBlockquote(text?: string): BlockquoteNode;
export declare function createCodeBlock(code?: string, lang?: string): CodeBlockNode;
export declare function createCallout(text?: string, variant?: CalloutVariant): CalloutNode;
export declare function hasMark(node: TextNode, type: MarkType): boolean;
export declare function addMark(node: TextNode, mark: Mark): TextNode;
export declare function removeMark(node: TextNode, type: MarkType): TextNode;
export declare function toggleMark(node: TextNode, mark: Mark): TextNode;
/** Get plain text from inline nodes */
export declare function getPlainText(inlines: InlineNode[]): string;
/** Split inline content at a character offset, returns [before, after] */
export declare function splitInlinesAt(inlines: InlineNode[], offset: number): [InlineNode[], InlineNode[]];
/** Merge adjacent text nodes with identical marks */
export declare function normalizeInlines(inlines: InlineNode[]): InlineNode[];
/** Get total character length of a block's inline content */
export declare function blockLength(block: BlockNode): number;
/** Create a fresh empty document */
export declare function emptyDocument(): EditorDocument;
