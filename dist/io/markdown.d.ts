import type { EditorDocument } from '../core/types.js';
export declare function serializeToMarkdown(doc: EditorDocument): string;
export declare function deserializeMarkdown(md: string): EditorDocument;
