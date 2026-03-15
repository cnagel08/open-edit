// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Toolbar (Design A style, configurable)
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorInterface, ToolbarItemConfig } from '../core/types.js';
import type { EditorLocale } from '../locales/types.js';
import { en } from '../locales/en.js';
import { getActiveMarks } from './selection.js';
import { ICONS } from './icons.js';

// ── Default toolbar item IDs (for filtering reference) ────────────────────────

/** All item IDs available in the default toolbar, in order. */
export const TOOLBAR_ITEM_IDS = [
  'undo', 'redo', 'blockType', 'bold', 'italic', 'underline', 'code',
  'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
  'bulletList', 'orderedList', 'link', 'image', 'blockquote', 'hr', 'callout',
] as const;

// ── Build locale-aware default toolbar ────────────────────────────────────────

function buildDefaultToolbar(locale: EditorLocale): ToolbarItemConfig[] {
  const t = locale.toolbar;
  return [
    { type: 'button', id: 'undo', icon: 'undo', title: t.undo, command: 'undo' },
    { type: 'button', id: 'redo', icon: 'redo', title: t.redo, command: 'redo' },
    { type: 'separator' },
    {
      type: 'select',
      id: 'blockType',
      title: t.textFormat,
      command: 'setBlock',
      options: [
        { label: t.paragraph,       value: 'P' },
        { label: t.heading(1),      value: 'H1' },
        { label: t.heading(2),      value: 'H2' },
        { label: t.heading(3),      value: 'H3' },
        { label: t.heading(4),      value: 'H4' },
        { label: t.quote,           value: 'BLOCKQUOTE' },
        { label: t.codeBlock,       value: 'PRE' },
        { label: t.calloutInfo,     value: 'CALLOUT-info' },
        { label: t.calloutSuccess,  value: 'CALLOUT-success' },
        { label: t.calloutWarning,  value: 'CALLOUT-warning' },
        { label: t.calloutDanger,   value: 'CALLOUT-danger' },
      ],
      getValue: (editor) => editor.getActiveBlockType(),
    },
    { type: 'separator' },
    { type: 'button', id: 'bold',      icon: 'bold',        title: t.bold,      command: 'bold',      isActive: (e) => e.isMarkActive('bold') },
    { type: 'button', id: 'italic',    icon: 'italic',      title: t.italic,    command: 'italic',    isActive: (e) => e.isMarkActive('italic') },
    { type: 'button', id: 'underline', icon: 'underline',   title: t.underline, command: 'underline', isActive: (e) => e.isMarkActive('underline') },
    { type: 'button', id: 'code',      icon: 'code_inline', title: t.inlineCode, command: 'code',     isActive: (e) => e.isMarkActive('code') },
    { type: 'separator' },
    { type: 'button', id: 'alignLeft',    icon: 'alignLeft',    title: t.alignLeft,    command: 'alignLeft' },
    { type: 'button', id: 'alignCenter',  icon: 'alignCenter',  title: t.alignCenter,  command: 'alignCenter' },
    { type: 'button', id: 'alignRight',   icon: 'alignRight',   title: t.alignRight,   command: 'alignRight' },
    { type: 'button', id: 'alignJustify', icon: 'alignJustify', title: t.justify,      command: 'alignJustify' },
    { type: 'separator' },
    { type: 'button', id: 'bulletList',  icon: 'bulletList',  title: t.bulletList,   command: 'bulletList',  isActive: (e) => e.getActiveBlockType() === 'bullet_list' },
    { type: 'button', id: 'orderedList', icon: 'orderedList', title: t.orderedList,  command: 'orderedList', isActive: (e) => e.getActiveBlockType() === 'ordered_list' },
    { type: 'separator' },
    { type: 'button', id: 'link',       icon: 'link',       title: t.insertLink,     command: 'link' },
    { type: 'button', id: 'image',      icon: 'image',      title: t.insertImage,    command: 'image' },
    { type: 'button', id: 'blockquote', icon: 'blockquote', title: t.blockquote,     command: 'blockquote' },
    { type: 'button', id: 'hr',         icon: 'hr',         title: t.horizontalRule, command: 'hr' },
    { type: 'button', id: 'callout',    icon: 'callout',    title: t.insertCallout,  command: 'callout', isActive: (e) => e.getActiveBlockType().startsWith('CALLOUT-') },
  ];
}

/** English default toolbar (backwards-compatible export). */
export const DEFAULT_TOOLBAR: ToolbarItemConfig[] = buildDefaultToolbar(en);

// ── Toolbar filter ────────────────────────────────────────────────────────────

/**
 * Filter the default toolbar by a list of item IDs.
 * Orphaned separators (leading, trailing, consecutive) are removed automatically.
 */
export function filterToolbar(ids: string[], locale: EditorLocale = en): ToolbarItemConfig[] {
  const source = buildDefaultToolbar(locale);
  const filtered = source.filter((item) => {
    if (item.type === 'separator' || item.type === 'spacer') return true;
    return 'id' in item && ids.includes(item.id);
  });

  const result: ToolbarItemConfig[] = [];
  for (const item of filtered) {
    if (item.type === 'separator') {
      const last = result[result.length - 1];
      if (!last || last.type === 'separator' || last.type === 'spacer') continue;
      result.push(item);
    } else {
      result.push(item);
    }
  }
  while (result.length > 0) {
    const last = result[result.length - 1];
    if (last.type === 'separator' || last.type === 'spacer') result.pop();
    else break;
  }
  return result;
}

// ── Toolbar class ─────────────────────────────────────────────────────────────

// ── Callout variant picker ────────────────────────────────────────────────────

const CALLOUT_PICKER_STYLE_ID = 'oe-callout-picker-styles';

function injectCalloutPickerStyles(): void {
  if (document.getElementById(CALLOUT_PICKER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CALLOUT_PICKER_STYLE_ID;
  style.textContent = `
.oe-callout-picker {
  position: fixed;
  z-index: 10000;
  background: var(--oe-bg, #ffffff);
  border: 1px solid var(--oe-border, #e7e5e4);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 160px;
  font-family: var(--oe-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}
.oe-callout-picker-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--oe-text, #1c1917);
  user-select: none;
  transition: background 80ms;
}
.oe-callout-picker-item:hover {
  background: var(--oe-btn-hover-bg, #f5f5f4);
}
.oe-callout-picker-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
`;
  document.head.appendChild(style);
}

const CALLOUT_VARIANTS_PICKER = [
  { variant: 'info',    label: 'Info',    color: '#3b82f6' },
  { variant: 'success', label: 'Success', color: '#22c55e' },
  { variant: 'warning', label: 'Warning', color: '#f59e0b' },
  { variant: 'danger',  label: 'Danger',  color: '#ef4444' },
] as const;

// ── Toolbar class ─────────────────────────────────────────────────────────────

export class Toolbar {
  private el: HTMLElement;
  private editor: EditorInterface;
  private config: ToolbarItemConfig[];
  private itemEls: Map<string, HTMLElement> = new Map();
  private disabled = false;
  private locale: EditorLocale;
  private calloutPickerEl: HTMLElement | null = null;

  constructor(
    el: HTMLElement,
    editor: EditorInterface,
    config?: ToolbarItemConfig[],
    toolbarItems?: string[],
    locale: EditorLocale = en,
  ) {
    this.el = el;
    this.editor = editor;
    this.locale = locale;
    if (config) {
      this.config = config;
    } else if (toolbarItems) {
      this.config = filterToolbar(toolbarItems, locale);
    } else {
      this.config = buildDefaultToolbar(locale);
    }
    this.render();
  }

  private render(): void {
    this.el.innerHTML = '';
    this.el.className = 'oe-toolbar';

    for (const item of this.config) {
      const itemEl = this.renderItem(item);
      this.el.appendChild(itemEl);
    }
  }

  private renderItem(item: ToolbarItemConfig): HTMLElement {
    switch (item.type) {
      case 'separator': {
        const sep = document.createElement('div');
        sep.className = 'oe-toolbar-sep';
        return sep;
      }

      case 'spacer': {
        const sp = document.createElement('div');
        sp.className = 'oe-toolbar-spacer';
        return sp;
      }

      case 'select': {
        const wrap = document.createElement('div');
        wrap.className = 'oe-toolbar-select-wrap';
        const sel = document.createElement('select');
        sel.className = 'oe-toolbar-select';
        sel.title = item.title;

        for (const opt of item.options) {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.label;
          sel.appendChild(o);
        }

        sel.addEventListener('change', () => {
          const val = sel.value;
          this.handleBlockTypeChange(val);
          // Return focus to editor after selection
          setTimeout(() => this.editor.focus(), 0);
        });

        wrap.appendChild(sel);
        this.itemEls.set(item.id, sel);
        return wrap;
      }

      case 'button': {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'oe-toolbar-btn';
        btn.title = item.title;
        btn.innerHTML = ICONS[item.icon as keyof typeof ICONS] ?? item.icon;

        btn.addEventListener('mousedown', (e) => {
          e.preventDefault(); // Don't blur editor
        });
        btn.addEventListener('click', () => {
          this.handleCommand(item.command, item as { id: string; command: string });
        });

        this.itemEls.set(item.id, btn);
        return btn;
      }
    }
  }

  private handleCommand(command: string, item?: { id: string }): void {
    const editor = this.editor as EditorInterface & {
      chain: () => ReturnType<EditorInterface['chain']>;
      toggleHTMLMode?: () => void;
      options?: { onImageUpload?: (f: File) => Promise<string> };
    };

    switch (command) {
      case 'bold':        editor.chain().toggleMark('bold').run(); break;
      case 'italic':      editor.chain().toggleMark('italic').run(); break;
      case 'underline':   editor.chain().toggleMark('underline').run(); break;
      case 'code':        editor.chain().toggleMark('code').run(); break;
      case 'bulletList':  editor.chain().toggleList('bullet_list').run(); break;
      case 'orderedList': editor.chain().toggleList('ordered_list').run(); break;
      case 'blockquote':  editor.chain().setBlock('blockquote').run(); break;
      case 'hr':          editor.chain().insertHr().run(); break;
      case 'callout': {
        const btnEl = item ? this.itemEls.get(item.id) : null;
        if (btnEl) this.toggleCalloutPicker(btnEl);
        break;
      }
      case 'undo':        editor.chain().undo().run(); break;
      case 'redo':        editor.chain().redo().run(); break;
      case 'alignLeft':   editor.chain().setAlign('left').run(); break;
      case 'alignCenter': editor.chain().setAlign('center').run(); break;
      case 'alignRight':  editor.chain().setAlign('right').run(); break;
      case 'alignJustify':editor.chain().setAlign('justify').run(); break;
      case 'link':        this.handleLinkCommand(); break;
      case 'image':       this.handleImageCommand(); break;
      case 'htmlToggle':  (editor as unknown as { toggleHTMLMode?: () => void }).toggleHTMLMode?.(); break;
    }
  }

  private toggleCalloutPicker(anchorEl: HTMLElement): void {
    if (this.calloutPickerEl) {
      this.closeCalloutPicker();
      return;
    }

    injectCalloutPickerStyles();

    const picker = document.createElement('div');
    picker.className = 'oe-callout-picker';
    this.calloutPickerEl = picker;

    for (const { variant, label, color } of CALLOUT_VARIANTS_PICKER) {
      const item = document.createElement('div');
      item.className = 'oe-callout-picker-item';
      item.innerHTML = `<span class="oe-callout-picker-dot" style="background:${color}"></span>${label}`;
      item.addEventListener('mousedown', (e) => {
        e.preventDefault(); // keep editor focus
        this.closeCalloutPicker();
        this.editor.chain().setBlock('callout', { variant }).run();
      });
      picker.appendChild(item);
    }

    document.body.appendChild(picker);

    // Position below the anchor button
    const rect = anchorEl.getBoundingClientRect();
    picker.style.top = `${rect.bottom + 4}px`;
    picker.style.left = `${rect.left}px`;

    // Clamp to viewport
    requestAnimationFrame(() => {
      if (!picker.isConnected) return;
      const vw = window.innerWidth;
      const right = rect.left + picker.offsetWidth;
      if (right > vw - 8) picker.style.left = `${vw - picker.offsetWidth - 8}px`;
    });

    // Close on outside click
    const onOutside = (e: MouseEvent): void => {
      if (!picker.contains(e.target as Node) && e.target !== anchorEl) {
        this.closeCalloutPicker();
        document.removeEventListener('mousedown', onOutside, true);
      }
    };
    // Delay so this click doesn't immediately close the picker
    setTimeout(() => document.addEventListener('mousedown', onOutside, true), 0);
  }

  private closeCalloutPicker(): void {
    this.calloutPickerEl?.remove();
    this.calloutPickerEl = null;
  }

  private handleBlockTypeChange(val: string): void {
    switch (val) {
      case 'P':
        this.editor.chain().setBlock('paragraph').run();
        return;
      case 'H1':
      case 'H2':
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6':
        this.editor.chain().setBlock('heading', { level: Number(val[1]) }).run();
        return;
      case 'BLOCKQUOTE':
        this.editor.chain().setBlock('blockquote').run();
        return;
      case 'PRE':
        this.editor.chain().setBlock('code_block').run();
        return;
      case 'bullet_list':
      case 'ordered_list':
        this.editor.chain().setBlock(val).run();
        return;
      case 'CALLOUT-info':
      case 'CALLOUT-success':
      case 'CALLOUT-warning':
      case 'CALLOUT-danger': {
        const variant = val.split('-')[1];
        this.editor.chain().setBlock('callout', { variant }).run();
        return;
      }
      default:
        this.editor.chain().setBlock('paragraph').run();
    }
  }

  private handleLinkCommand(): void {
    const sel = window.getSelection();
    const selectedText = sel && !sel.isCollapsed ? sel.toString() : '';
    const d = this.locale.dialogs;

    const href = window.prompt(d.linkUrl, selectedText.startsWith('http') ? selectedText : 'https://');
    if (!href) return;

    const target = window.confirm(d.openInNewTab) ? '_blank' : '_self';
    this.editor.chain().toggleMark('link', { href, target }).run();
  }

  private handleImageCommand(): void {
    const d = this.locale.dialogs;
    const url = window.prompt(d.imageUrl, 'https://');
    if (!url) return;
    const alt = window.prompt(d.imageAlt, '') ?? '';
    this.editor.chain().insertImage(url, alt || undefined).run();
  }

  updateActiveState(): void {
    if (this.disabled) return;

    const marks = getActiveMarks(
      (this.editor as unknown as { editorEl: HTMLElement }).editorEl
    );

    const blockType = this.editor.getActiveBlockType();

    for (const [id, el] of this.itemEls) {
      const item = this.config.find(
        (i) => (i.type === 'button' || i.type === 'select') && 'id' in i && i.id === id
      );
      if (!item) continue;

      if (item.type === 'select') {
        (el as HTMLSelectElement).value = blockType;
        continue;
      }

      if (item.type === 'button') {
        const active = item.isActive ? item.isActive(this.editor) :
          (id === 'bold' && marks.has('bold')) ||
          (id === 'italic' && marks.has('italic')) ||
          (id === 'underline' && marks.has('underline')) ||
          (id === 'code' && marks.has('code')) ||
          (id === 'link' && marks.has('link')) ||
          (id === 'bulletList' && blockType === 'bullet_list') ||
          (id === 'orderedList' && blockType === 'ordered_list');

        el.classList.toggle('oe-active', active);
      }
    }
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.el.classList.toggle('oe-toolbar-disabled', disabled);
    for (const el of this.itemEls.values()) {
      if (el instanceof HTMLButtonElement) el.disabled = disabled;
      if (el instanceof HTMLSelectElement) el.disabled = disabled;
    }
  }
}
