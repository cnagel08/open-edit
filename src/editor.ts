// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Main Editor Class
// ─────────────────────────────────────────────────────────────────────────────

import type {
  EditorDocument,
  EditorOptions,
  EditorInterface,
  EditorPlugin,
  EditorEventMap,
  EditorEventListener,
  ModelSelection,
  MarkType,
  ToolbarItemConfig,
  ChainInterface,
} from './core/types.js';
import { History } from './core/history.js';
import { deserializeHTML } from './io/deserializer.js';
import { serializeToHTML } from './io/serializer.js';
import { serializeToMarkdown, deserializeMarkdown } from './io/markdown.js';
import { renderDocument } from './view/renderer.js';
import {
  syncFromDOM,
  execInlineCommand,
  setBlockType,
  toggleList,
  setAlignment,
  insertImage as insertImageCmd,
  insertHr as insertHrCmd,
  getBlockTypeFromDOM,
  getAlignmentFromDOM,
  insertLink,
} from './core/commands.js';
import { domSelectionToModel, getActiveBlockIndex, getActiveMarks } from './view/selection.js';
import { Toolbar } from './view/toolbar.js';
import { BubbleToolbar } from './view/bubble-toolbar.js';
import { injectStyles } from './view/styles.js';
import { ImageResizer } from './view/image-resize.js';
import { CodeLangPicker } from './view/code-lang-picker.js';
import { emptyDocument } from './core/model.js';
import type { EditorLocale } from './locales/types.js';
import { en } from './locales/en.js';
import { de } from './locales/de.js';

/** Built-in locales available for auto-detection. Add entries here as new languages are added. */
const BUILT_IN_LOCALES: Record<string, EditorLocale> = { de };

/** Detect locale from navigator.language, fall back to English. */
function detectLocale(): EditorLocale {
  const lang = (typeof navigator !== 'undefined' ? navigator.language : '').split('-')[0].toLowerCase();
  return BUILT_IN_LOCALES[lang] ?? en;
}

function mergeLocale(overrides: Partial<EditorLocale>): EditorLocale {
  return {
    toolbar: { ...en.toolbar, ...overrides.toolbar },
    statusBar: { ...en.statusBar, ...overrides.statusBar },
    dialogs: { ...en.dialogs, ...overrides.dialogs },
    plugins: {
      ai: { ...en.plugins.ai, actions: { ...en.plugins.ai.actions, ...overrides.plugins?.ai?.actions }, ...overrides.plugins?.ai },
      emoji: { ...en.plugins.emoji, categories: { ...en.plugins.emoji.categories, ...overrides.plugins?.emoji?.categories }, ...overrides.plugins?.emoji },
    },
  };
}

type EventListeners = {
  [K in keyof EditorEventMap]: Set<EditorEventListener<K>>;
};

export class Editor implements EditorInterface {
  private doc: EditorDocument;
  private history: History;
  private root: HTMLElement;
  private editorEl: HTMLElement;      // contentEditable div
  private containerEl: HTMLElement;   // outer wrapper
  private toolbar: Toolbar | null = null;
  private bubbleToolbar: BubbleToolbar | null = null;
  private imageResizer: ImageResizer | null = null;
  private codeLangPicker: CodeLangPicker | null = null;
  private plugins: EditorPlugin[] = [];
  private options: EditorOptions;
  readonly locale: EditorLocale;
  private listeners: EventListeners = {
    change: new Set(),
    selectionchange: new Set(),
    focus: new Set(),
    blur: new Set(),
  };
  private isComposing = false;
  private _isFocused = false;
  private isUpdating = false;
  // Debounce timer for syncing DOM → model after typing
  private syncTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: EditorOptions) {
    this.options = options;
    this.locale = options.locale ? mergeLocale(options.locale as Partial<EditorLocale>) : detectLocale();
    this.history = new History();

    // Resolve mount element
    const mount =
      typeof options.element === 'string'
        ? document.querySelector<HTMLElement>(options.element)
        : options.element;

    if (!mount) throw new Error(`[OpenEdit] Element not found: ${options.element}`);
    this.root = mount;

    // Initial document
    this.doc = options.content ? deserializeHTML(options.content) : emptyDocument();

    // Build DOM structure
    this.containerEl = this.buildContainer();
    this.editorEl = this.buildEditorEl();
    this.root.appendChild(this.containerEl);

    // Inject CSS
    injectStyles(options.theme ?? 'auto');

    // Initial render
    renderDocument(this.doc, this.editorEl);

    // Toolbar
    const toolbarEl = this.containerEl.querySelector<HTMLElement>('.oe-toolbar')!;
    this.toolbar = new Toolbar(toolbarEl, this, options.toolbar, options.toolbarItems, this.locale);

    // Bubble toolbar
    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'oe-bubble-toolbar';
    document.body.appendChild(bubbleEl);
    this.bubbleToolbar = new BubbleToolbar(bubbleEl, this, this.locale);

    // Image resizer
    this.imageResizer = new ImageResizer(this.editorEl, () => this.scheduleSyncFromDOM());

    // Code language picker
    this.codeLangPicker = new CodeLangPicker(this.editorEl, this);

    // Placeholder
    this.updatePlaceholder();

    // Attach events
    this.attachEvents();

    // Apply theme
    this.applyTheme(options.theme ?? 'auto');
  }

  // ── DOM Structure ────────────────────────────────────────────────────────────

  private buildContainer(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'oe-container';

    el.innerHTML = `
      <div class="oe-toolbar"></div>
      <div class="oe-content-wrap">
        <div class="oe-editor" contenteditable="true" spellcheck="true"></div>
        <div class="oe-html-source" style="display:none">
          <textarea class="oe-html-textarea" spellcheck="false"></textarea>
        </div>
      </div>
      <div class="oe-statusbar">
        <div class="oe-statusbar-path"></div>
        <div class="oe-statusbar-right">
          <span class="oe-word-count">${this.locale.statusBar.words}: 0</span>
          <span class="oe-char-count">${this.locale.statusBar.characters}: 0</span>
          <div class="oe-statusbar-divider"></div>
          <button type="button" class="oe-html-toggle" title="${this.locale.toolbar.htmlSource}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 9l-3 3 3 3"/><path d="M14 15l3-3-3-3"/><rect x="2" y="3" width="20" height="18" rx="2"/></svg>
            ${this.locale.statusBar.htmlSource}
          </button>
        </div>
      </div>
    `;

    // Apply statusBar option
    const sb = this.options.statusBar;
    if (sb === false) {
      el.querySelector('.oe-statusbar')?.remove();
    } else if (sb !== undefined && typeof sb === 'object') {
      if (sb.wordCount === false)   el.querySelector('.oe-word-count')?.remove();
      if (sb.charCount === false)   el.querySelector('.oe-char-count')?.remove();
      if (sb.elementPath === false) el.querySelector('.oe-statusbar-path')?.remove();
      if (sb.htmlToggle === false) {
        el.querySelector('.oe-html-toggle')?.remove();
        el.querySelector('.oe-statusbar-divider')?.remove();
      }
    }

    return el;
  }

  private buildEditorEl(): HTMLElement {
    const el = this.containerEl.querySelector<HTMLElement>('.oe-editor')!;
    if (this.options.placeholder) {
      el.dataset.placeholder = this.options.placeholder;
    }
    if (this.options.readOnly) {
      el.contentEditable = 'false';
    }
    return el;
  }

  // ── Event wiring ─────────────────────────────────────────────────────────────

  private attachEvents(): void {
    const ed = this.editorEl;

    // Input: after character typed — defer sync to avoid mid-composition issues
    ed.addEventListener('input', this.onInput);
    ed.addEventListener('compositionstart', this.onCompositionStart);
    ed.addEventListener('compositionend', this.onCompositionEnd);

    // Selection
    document.addEventListener('selectionchange', this.onSelectionChange);

    // Focus / blur
    ed.addEventListener('focus', this.onFocus);
    ed.addEventListener('blur', this.onBlur);

    // Keyboard shortcuts
    ed.addEventListener('keydown', this.onKeydown);

    // Tab in code blocks
    ed.addEventListener('keydown', this.onTabInCodeBlock);

    // HTML source toggle
    const htmlToggle = this.containerEl.querySelector<HTMLElement>('.oe-html-toggle')!;
    htmlToggle.addEventListener('click', this.onHTMLToggleClick);

    // Paste: sanitize
    ed.addEventListener('paste', this.onPaste);

    // Drop images
    ed.addEventListener('drop', this.onDrop);
  }

  private readonly onInput = (): void => {
    if (this.isComposing || this.isUpdating) return;
    this.scheduleSyncFromDOM();
  };

  private readonly onCompositionStart = (): void => {
    this.isComposing = true;
  };

  private readonly onCompositionEnd = (): void => {
    this.isComposing = false;
    this.scheduleSyncFromDOM();
  };

  private readonly onHTMLToggleClick = (): void => {
    this.toggleHTMLMode();
  };

  private scheduleSyncFromDOM(): void {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.history.push(this.doc);
      this.doc = syncFromDOM(this.editorEl);
      this.updatePlaceholder();
      this.updateStatusBar();
      this.emit('change', this.doc);
      this.options.onChange?.(this.getHTML());
    }, 0);
  }

  /** Sync model from DOM without a full rerender (used after inline execCommands) */
  syncModelFromDOM(): void {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.doc = syncFromDOM(this.editorEl);
      this.updatePlaceholder();
      this.updateStatusBar();
    }, 0);
  }

  private readonly onSelectionChange = (): void => {
    if (!this.editorEl.contains(document.activeElement) &&
        document.activeElement !== this.editorEl) return;

    this.toolbar?.updateActiveState();
    this.bubbleToolbar?.onSelectionChange();
    this.updateElementPath();

    const sel = domSelectionToModel(this.editorEl, this.doc);
    this.emit('selectionchange', sel);
  };

  private readonly onFocus = (): void => {
    this._isFocused = true;
    this.containerEl.classList.add('oe-focused');
    this.emit('focus', undefined as void);
  };

  private readonly onBlur = (): void => {
    this._isFocused = false;
    this.containerEl.classList.remove('oe-focused');
    this.emit('blur', undefined as void);
  };

  private readonly onKeydown = (e: KeyboardEvent): void => {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && e.key === 'z') { e.preventDefault(); this.chain().undo().run(); return; }
    if (ctrl && (e.key === 'y' || e.key === 'Z')) { e.preventDefault(); this.chain().redo().run(); return; }
    if (ctrl && e.key === 'b') { e.preventDefault(); this.chain().toggleMark('bold').run(); return; }
    if (ctrl && e.key === 'i') { e.preventDefault(); this.chain().toggleMark('italic').run(); return; }
    if (ctrl && e.key === 'u') { e.preventDefault(); this.chain().toggleMark('underline').run(); return; }
    if (ctrl && e.key === '`') { e.preventDefault(); this.chain().toggleMark('code').run(); return; }

    // Plugin keymaps
    for (const plugin of this.plugins) {
      if (plugin.keymaps) {
        for (const [shortcut, handler] of Object.entries(plugin.keymaps)) {
          if (matchesShortcut(shortcut, e)) {
            e.preventDefault();
            handler(this);
            return;
          }
        }
      }
    }
  };

  private readonly onTabInCodeBlock = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let node: Node | null = sel.anchorNode;
    while (node && node !== this.editorEl) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'PRE') {
        e.preventDefault();
        execInlineCommand('insertText', e.shiftKey ? '' : '  ');
        return;
      }
      node = node.parentNode;
    }
  };

  private readonly onPaste = (e: ClipboardEvent): void => {
    e.preventDefault();
    const html = e.clipboardData?.getData('text/html');
    const text = e.clipboardData?.getData('text/plain') ?? '';

    this.history.push(this.doc);

    if (html && html.trim()) {
      // HTML paste: sanitize through model and re-serialize
      const pastedDoc = deserializeHTML(html);
      const pastedHTML = serializeToHTML(pastedDoc);
      execInlineCommand('insertHTML', pastedHTML);
    } else if (text) {
      const trimmed = text.trim();

      // N6: URL → link
      if (isURL(trimmed)) {
        const sel = window.getSelection();
        const selText = sel && !sel.isCollapsed ? sel.toString() : '';
        if (selText) {
          // Wrap selected text in a link
          const linkHTML = `<a href="${escapeAttrValue(trimmed)}" target="_blank" rel="noopener noreferrer">${selText}</a>`;
          execInlineCommand('insertHTML', linkHTML);
        } else {
          // Insert URL as a clickable link
          const linkHTML = `<a href="${escapeAttrValue(trimmed)}" target="_blank" rel="noopener noreferrer">${trimmed}</a>`;
          execInlineCommand('insertHTML', linkHTML);
        }
      } else if (looksLikeMarkdown(text)) {
        // N6: Markdown → convert and insert
        const mdDoc = deserializeMarkdown(text);
        const mdHTML = serializeToHTML(mdDoc);
        execInlineCommand('insertHTML', mdHTML);
      } else {
        execInlineCommand('insertText', text);
      }
    }

    this.scheduleSyncFromDOM();
  };

  private readonly onDrop = (e: DragEvent): void => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const imageFile = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!imageFile) return;

    if (this.options.onImageUpload) {
      e.preventDefault();
      this.options.onImageUpload(imageFile).then((url) => {
        const idx = getActiveBlockIndex(this.editorEl);
        this.history.push(this.doc);
        this.doc = insertImageCmd(this.doc, idx, url, imageFile.name);
        this.rerender();
      }).catch(() => { /* ignore */ });
    }
  };

  // ── HTML Source Mode ──────────────────────────────────────────────────────────

  private isHTMLMode = false;

  toggleHTMLMode(): void {
    const contentWrap = this.containerEl.querySelector<HTMLElement>('.oe-content-wrap')!;
    const editorEl = this.editorEl;
    const sourceEl = this.containerEl.querySelector<HTMLElement>('.oe-html-source')!;
    const textarea = this.containerEl.querySelector<HTMLTextAreaElement>('.oe-html-textarea')!;
    const toggleBtn = this.containerEl.querySelector<HTMLElement>('.oe-html-toggle')!;

    if (!this.isHTMLMode) {
      // Switch to HTML mode
      textarea.value = this.getHTML();
      editorEl.style.display = 'none';
      sourceEl.style.display = '';
      this.isHTMLMode = true;
      toggleBtn.classList.add('oe-active');
      this.toolbar?.setDisabled(true);
    } else {
      // Switch back to WYSIWYG
      const newHTML = textarea.value;
      this.history.push(this.doc);
      this.doc = deserializeHTML(newHTML);
      editorEl.style.display = '';
      sourceEl.style.display = 'none';
      this.isHTMLMode = false;
      toggleBtn.classList.remove('oe-active');
      this.toolbar?.setDisabled(false);
      this.rerender();
    }
  }

  // ── Chain API ─────────────────────────────────────────────────────────────────

  chain(): ChainInterface {
    const operations: Array<() => void> = [];
    // Track whether any operation requires a full model→DOM rerender.
    // Inline mark commands (execCommand) mutate the DOM directly —
    // rerendering from the old model would undo their changes.
    let needsRerender = false;
    const editor = this;

    const chainObj: ChainInterface = {
      toggleMark(type: MarkType, attrs?: Record<string, unknown>) {
        // Inline op: no rerender — execCommand mutates DOM, then we sync model from DOM
        operations.push(() => {
          editor.editorEl.focus();
          const cmdMap: Partial<Record<MarkType, string>> = {
            bold: 'bold',
            italic: 'italic',
            underline: 'underline',
            strikethrough: 'strikethrough',
          };
          if (type === 'code') {
            const activeMarks = getActiveMarks(editor.editorEl);
            if (activeMarks.has('code')) {
              // Remove: unwrap the <code> element around selection
              const sel = window.getSelection();
              if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const codeEl = (range.startContainer.parentElement as Element).closest('code');
                if (codeEl) {
                  const text = codeEl.textContent ?? '';
                  codeEl.replaceWith(document.createTextNode(text));
                }
              }
            } else {
              const sel = window.getSelection();
              if (sel && !sel.isCollapsed) {
                const range = sel.getRangeAt(0);
                const code = document.createElement('code');
                range.surroundContents(code);
              }
            }
          } else if (type === 'link') {
            if (attrs?.href) {
              const target = (attrs.target as string) ?? '_self';
              insertLink(attrs.href as string, target);
            }
          } else {
            const cmd = cmdMap[type];
            if (cmd) execInlineCommand(cmd);
          }
        });
        return chainObj;
      },

      setBlock(type: string, attrs?: Record<string, unknown>) {
        needsRerender = true;
        operations.push(() => {
          // Sync current DOM state into model before mutating
          editor.doc = syncFromDOM(editor.editorEl);
          const idx = getActiveBlockIndex(editor.editorEl);
          editor.history.push(editor.doc);
          editor.doc = setBlockType(editor.doc, idx, type, attrs);
        });
        return chainObj;
      },

      setAlign(align: 'left' | 'center' | 'right' | 'justify') {
        needsRerender = true;
        operations.push(() => {
          editor.doc = syncFromDOM(editor.editorEl);
          const idx = getActiveBlockIndex(editor.editorEl);
          editor.history.push(editor.doc);
          editor.doc = setAlignment(editor.doc, idx, align);
        });
        return chainObj;
      },

      insertImage(src: string, alt?: string) {
        needsRerender = true;
        operations.push(() => {
          editor.doc = syncFromDOM(editor.editorEl);
          const idx = getActiveBlockIndex(editor.editorEl);
          editor.history.push(editor.doc);
          editor.doc = insertImageCmd(editor.doc, idx, src, alt);
        });
        return chainObj;
      },

      insertHr() {
        needsRerender = true;
        operations.push(() => {
          editor.doc = syncFromDOM(editor.editorEl);
          const idx = getActiveBlockIndex(editor.editorEl);
          editor.history.push(editor.doc);
          editor.doc = insertHrCmd(editor.doc, idx);
        });
        return chainObj;
      },

      toggleList(type: 'bullet_list' | 'ordered_list') {
        needsRerender = true;
        operations.push(() => {
          editor.doc = syncFromDOM(editor.editorEl);
          const idx = getActiveBlockIndex(editor.editorEl);
          editor.history.push(editor.doc);
          editor.doc = toggleList(editor.doc, idx, type);
        });
        return chainObj;
      },

      undo() {
        needsRerender = true;
        operations.push(() => {
          const prev = editor.history.undo(editor.doc);
          if (prev) editor.doc = prev;
        });
        return chainObj;
      },

      redo() {
        needsRerender = true;
        operations.push(() => {
          const next = editor.history.redo(editor.doc);
          if (next) editor.doc = next;
        });
        return chainObj;
      },

      run() {
        editor.isUpdating = true;
        for (const op of operations) op();
        editor.isUpdating = false;

        if (needsRerender) {
          // Block-level change: model is updated, push DOM from model
          editor.rerender();
        } else {
          // Inline change: DOM was mutated directly by execCommand,
          // sync model from DOM asynchronously (don't overwrite DOM)
          editor.syncModelFromDOM();
        }

        editor.toolbar?.updateActiveState();
        editor.emit('change', editor.doc);
        editor.options.onChange?.(editor.getHTML());
      },
    };

    return chainObj;
  }

  // ── Re-render ─────────────────────────────────────────────────────────────────

  private rerender(): void {
    // Save selection
    const sel = domSelectionToModel(this.editorEl, this.doc);

    renderDocument(this.doc, this.editorEl);
    this.updatePlaceholder();
    this.updateStatusBar();

    // Restore focus (don't restore selection — can cause issues after block changes)
    this.editorEl.focus();
  }

  // ── Status bar ────────────────────────────────────────────────────────────────

  private updateStatusBar(): void {
    const text = this.editorEl.innerText ?? '';
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const wordCount = this.containerEl.querySelector('.oe-word-count');
    const charCount = this.containerEl.querySelector('.oe-char-count');
    if (wordCount) wordCount.textContent = `${this.locale.statusBar.words}: ${words.length}`;
    if (charCount) charCount.textContent = `${this.locale.statusBar.characters}: ${text.length}`;
  }

  private updateElementPath(): void {
    const pathEl = this.containerEl.querySelector('.oe-statusbar-path');
    if (!pathEl) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const path: string[] = [];
    let node: Node | null = sel.anchorNode;

    while (node && node !== this.editorEl) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        path.unshift((node as Element).tagName.toLowerCase());
      }
      node = node.parentNode;
    }

    pathEl.textContent = path.join(' › ');
  }

  private updatePlaceholder(): void {
    if (!this.options.placeholder) return;
    const isEmpty =
      this.editorEl.innerText.trim() === '' &&
      this.editorEl.querySelectorAll('img, hr').length === 0;
    this.editorEl.classList.toggle('oe-empty', isEmpty);
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  getHTML(): string {
    return serializeToHTML(this.doc);
  }

  setHTML(html: string): void {
    this.history.push(this.doc);
    this.doc = deserializeHTML(html);
    this.rerender();
  }

  getMarkdown(): string {
    return serializeToMarkdown(this.doc);
  }

  setMarkdown(md: string): void {
    this.history.push(this.doc);
    this.doc = deserializeMarkdown(md);
    this.rerender();
  }

  getDocument(): EditorDocument {
    return this.doc;
  }

  use(plugin: EditorPlugin): EditorInterface {
    this.plugins.push(plugin);
    plugin.onInit?.(this);
    return this;
  }

  on<K extends keyof EditorEventMap>(event: K, listener: EditorEventListener<K>): void {
    (this.listeners[event] as Set<EditorEventListener<K>>).add(listener);
  }

  off<K extends keyof EditorEventMap>(event: K, listener: EditorEventListener<K>): void {
    (this.listeners[event] as Set<EditorEventListener<K>>).delete(listener);
  }

  private emit<K extends keyof EditorEventMap>(event: K, payload: EditorEventMap[K]): void {
    (this.listeners[event] as Set<EditorEventListener<K>>).forEach((fn) => fn(payload));
  }

  destroy(): void {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    document.removeEventListener('selectionchange', this.onSelectionChange);
    this.editorEl.removeEventListener('input', this.onInput);
    this.editorEl.removeEventListener('compositionstart', this.onCompositionStart);
    this.editorEl.removeEventListener('compositionend', this.onCompositionEnd);
    this.editorEl.removeEventListener('focus', this.onFocus);
    this.editorEl.removeEventListener('blur', this.onBlur);
    this.editorEl.removeEventListener('keydown', this.onKeydown);
    this.editorEl.removeEventListener('keydown', this.onTabInCodeBlock);
    this.editorEl.removeEventListener('paste', this.onPaste);
    this.editorEl.removeEventListener('drop', this.onDrop);
    const htmlToggle = this.containerEl.querySelector<HTMLElement>('.oe-html-toggle');
    htmlToggle?.removeEventListener('click', this.onHTMLToggleClick);
    this.bubbleToolbar?.destroy();
    this.imageResizer?.destroy();
    this.codeLangPicker?.destroy();
    this.plugins.forEach((p) => p.onDestroy?.(this));
    this.root.innerHTML = '';
  }

  focus(): void { this.editorEl.focus(); }
  blur(): void { this.editorEl.blur(); }
  isFocused(): boolean { return this._isFocused; }

  getSelection(): ModelSelection | null {
    return domSelectionToModel(this.editorEl, this.doc);
  }

  isMarkActive(type: MarkType): boolean {
    return getActiveMarks(this.editorEl).has(type);
  }

  getActiveBlockType(): string {
    return getBlockTypeFromDOM(this.editorEl);
  }

  isEmpty(): boolean {
    return this.editorEl.innerText.trim() === '' &&
      this.editorEl.querySelectorAll('img, hr').length === 0;
  }

  // ── Theme ─────────────────────────────────────────────────────────────────────

  private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.containerEl.dataset.oeTheme = theme;
  }
}

// ── N6: Clipboard Intelligence helpers ────────────────────────────────────────

function isURL(text: string): boolean {
  return /^https?:\/\/[^\s]{4,}$/.test(text);
}

function looksLikeMarkdown(text: string): boolean {
  return (
    /^#{1,6} /m.test(text) ||
    /\*\*[^*]+\*\*/.test(text) ||
    /^```/m.test(text) ||
    /^[-*+] /m.test(text) ||
    /^\d+\. /m.test(text) ||
    /^> /m.test(text) ||
    /~~[^~]+~~/.test(text)
  );
}

function escapeAttrValue(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ── Keyboard shortcut matcher ─────────────────────────────────────────────────

function matchesShortcut(shortcut: string, e: KeyboardEvent): boolean {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const ctrl = parts.includes('ctrl') || parts.includes('meta');
  const shift = parts.includes('shift');
  const alt = parts.includes('alt');

  return (
    e.key.toLowerCase() === key &&
    (e.ctrlKey || e.metaKey) === ctrl &&
    e.shiftKey === shift &&
    e.altKey === alt
  );
}
