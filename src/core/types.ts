// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Core Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Marks (inline formatting) ────────────────────────────────────────────────

export type MarkType = 'bold' | 'italic' | 'underline' | 'code' | 'link' | 'strikethrough';

export interface LinkMark {
  type: 'link';
  href: string;
  target?: '_blank' | '_self';
  title?: string;
}

export interface SimpleMark {
  type: Exclude<MarkType, 'link'>;
}

export type Mark = SimpleMark | LinkMark;

// ── Inline nodes ─────────────────────────────────────────────────────────────

export interface TextNode {
  type: 'text';
  text: string;
  marks: Mark[];
}

export interface HardBreakNode {
  type: 'hardbreak';
}

export type InlineNode = TextNode | HardBreakNode;

// ── Block nodes ──────────────────────────────────────────────────────────────

export type CalloutVariant = 'info' | 'success' | 'warning' | 'danger';

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'blockquote'
  | 'code_block'
  | 'bullet_list'
  | 'ordered_list'
  | 'list_item'
  | 'image'
  | 'hr'
  | 'callout';

export interface ParagraphNode {
  type: 'paragraph';
  align?: 'left' | 'center' | 'right' | 'justify';
  children: InlineNode[];
}

export interface HeadingNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'left' | 'center' | 'right' | 'justify';
  children: InlineNode[];
}

export interface BlockquoteNode {
  type: 'blockquote';
  children: BlockNode[];
}

export interface CodeBlockNode {
  type: 'code_block';
  lang?: string;
  children: TextNode[];
}

export interface BulletListNode {
  type: 'bullet_list';
  children: ListItemNode[];
}

export interface OrderedListNode {
  type: 'ordered_list';
  start?: number;
  children: ListItemNode[];
}

export interface ListItemNode {
  type: 'list_item';
  children: InlineNode[];
}

export interface ImageNode {
  type: 'image';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface HrNode {
  type: 'hr';
}

export interface CalloutNode {
  type: 'callout';
  variant: CalloutVariant;
  children: InlineNode[];
}

export type BlockNode =
  | ParagraphNode
  | HeadingNode
  | BlockquoteNode
  | CodeBlockNode
  | BulletListNode
  | OrderedListNode
  | ListItemNode
  | ImageNode
  | HrNode
  | CalloutNode;

// ── Document ─────────────────────────────────────────────────────────────────

export interface EditorDocument {
  children: BlockNode[];
}

// ── Selection ────────────────────────────────────────────────────────────────

export interface ModelPosition {
  /** Index path into document.children (and nested children) */
  blockIndex: number;
  /** For list items: the item index within the list */
  itemIndex?: number;
  /** Character offset within the inline content */
  offset: number;
}

export interface ModelSelection {
  anchor: ModelPosition;
  focus: ModelPosition;
  isCollapsed: boolean;
}

// ── Events ───────────────────────────────────────────────────────────────────

export interface EditorEventMap {
  'change': EditorDocument;
  'selectionchange': ModelSelection | null;
  'focus': void;
  'blur': void;
}

export type EditorEventListener<K extends keyof EditorEventMap> =
  (payload: EditorEventMap[K]) => void;

// ── Plugin ───────────────────────────────────────────────────────────────────

export interface EditorPlugin {
  name: string;
  onInit?: (editor: EditorInterface) => void;
  onDestroy?: (editor: EditorInterface) => void;
  commands?: Record<string, (...args: unknown[]) => void>;
  toolbarItems?: ToolbarItemConfig[];
  keymaps?: Record<string, (editor: EditorInterface) => boolean>;
}

// ── Toolbar ──────────────────────────────────────────────────────────────────

export type ToolbarItemType = 'button' | 'separator' | 'select' | 'spacer';

export interface ToolbarButtonConfig {
  type: 'button';
  id: string;
  icon: string; // SVG string or text
  title: string;
  command: string;
  commandArgs?: unknown[];
  isActive?: (editor: EditorInterface) => boolean;
}

export interface ToolbarSeparatorConfig {
  type: 'separator';
}

export interface ToolbarSpacerConfig {
  type: 'spacer';
}

export interface ToolbarSelectConfig {
  type: 'select';
  id: string;
  title: string;
  options: Array<{ label: string; value: string }>;
  getValue: (editor: EditorInterface) => string;
  command: string;
}

export type ToolbarItemConfig =
  | ToolbarButtonConfig
  | ToolbarSeparatorConfig
  | ToolbarSpacerConfig
  | ToolbarSelectConfig;

// ── Locale ───────────────────────────────────────────────────────────────────

export type { EditorLocale } from '../locales/types.js';

// ── Status bar options ───────────────────────────────────────────────────────

export interface StatusBarOptions {
  /** Show word count. Default: true */
  wordCount?: boolean;
  /** Show character count. Default: true */
  charCount?: boolean;
  /** Show element path (e.g. "p › strong"). Default: true */
  elementPath?: boolean;
  /** Show HTML source toggle button. Default: true */
  htmlToggle?: boolean;
}

// ── Editor Interface (public API) ────────────────────────────────────────────

export interface EditorOptions {
  /** CSS selector or DOM element to mount the editor into */
  element: string | HTMLElement;
  /** Initial HTML content */
  content?: string;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** 'light' | 'dark' | 'auto' */
  theme?: 'light' | 'dark' | 'auto';
  /** Whether editor is read-only */
  readOnly?: boolean;
  /** Full custom toolbar configuration (takes precedence over toolbarItems) */
  toolbar?: ToolbarItemConfig[];
  /**
   * Filter which default toolbar buttons/selects to show by their ID.
   * Orphaned separators are removed automatically.
   * Has no effect if `toolbar` is set explicitly.
   * Available IDs: 'undo', 'redo', 'blockType', 'bold', 'italic', 'underline',
   * 'code', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
   * 'bulletList', 'orderedList', 'link', 'image', 'blockquote', 'hr', 'htmlToggle'
   * @example ['bold', 'italic', 'underline', 'link']
   */
  toolbarItems?: string[];
  /**
   * Control the status bar.
   * false = hide entirely. Object = show/hide individual parts.
   * @example false
   * @example { wordCount: true, charCount: false, elementPath: false, htmlToggle: false }
   */
  statusBar?: boolean | StatusBarOptions;
  /**
   * UI locale. Defaults to English.
   * Pass a full locale object or override individual keys with Partial<EditorLocale>.
   * @example import { de } from 'openedit'; // → locale: de
   */
  locale?: import('../locales/types.js').EditorLocale | Partial<import('../locales/types.js').EditorLocale>;
  /** Called when content changes, receives clean HTML */
  onChange?: (html: string) => void;
  /** Hook for image uploads */
  onImageUpload?: (file: File) => Promise<string>;
}

export interface EditorInterface {
  /** Get current content as clean HTML */
  getHTML(): string;
  /** Set content from HTML string */
  setHTML(html: string): void;
  /** Get current content as Markdown */
  getMarkdown(): string;
  /** Set content from Markdown string */
  setMarkdown(md: string): void;
  /** Get current document model */
  getDocument(): EditorDocument;
  /** Execute a named command */
  chain(): ChainInterface;
  /** Register a plugin */
  use(plugin: EditorPlugin): EditorInterface;
  /** Add event listener */
  on<K extends keyof EditorEventMap>(event: K, listener: EditorEventListener<K>): void;
  /** Remove event listener */
  off<K extends keyof EditorEventMap>(event: K, listener: EditorEventListener<K>): void;
  /** Destroy the editor and clean up */
  destroy(): void;
  /** Focus the editor */
  focus(): void;
  /** Blur the editor */
  blur(): void;
  /** Is the editor focused? */
  isFocused(): boolean;
  /** Current selection (null if not focused) */
  getSelection(): ModelSelection | null;
  /** Whether a mark is active at current selection */
  isMarkActive(type: MarkType): boolean;
  /** Get active block type at cursor */
  getActiveBlockType(): string;
  /** Whether the document is empty */
  isEmpty(): boolean;
}

export interface ChainInterface {
  toggleMark(type: MarkType, attrs?: Record<string, unknown>): ChainInterface;
  setBlock(type: BlockType, attrs?: Record<string, unknown>): ChainInterface;
  setAlign(align: 'left' | 'center' | 'right' | 'justify'): ChainInterface;
  insertImage(src: string, alt?: string): ChainInterface;
  insertHr(): ChainInterface;
  toggleList(type: 'bullet_list' | 'ordered_list'): ChainInterface;
  undo(): ChainInterface;
  redo(): ChainInterface;
  run(): void;
}
