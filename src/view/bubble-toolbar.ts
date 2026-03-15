// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Bubble Toolbar (S5: floating toolbar on text selection)
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorInterface } from '../core/types.js';
import type { EditorLocale } from '../locales/types.js';
import { en } from '../locales/en.js';
import { getActiveMarks } from './selection.js';
import { ICONS } from './icons.js';

interface BubbleButton {
  id: string;
  icon: string;
  title: string;
  action: () => void;
  isActive?: () => boolean;
}

export class BubbleToolbar {
  private el: HTMLElement;
  private editor: EditorInterface;
  private locale: EditorLocale;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(el: HTMLElement, editor: EditorInterface, locale: EditorLocale = en) {
    this.el = el;
    this.editor = editor;
    this.locale = locale;
    this.render();
  }

  private get editorEl(): HTMLElement {
    return (this.editor as unknown as { editorEl: HTMLElement }).editorEl;
  }

  private render(): void {
    this.el.className = 'oe-bubble-toolbar';

    const t = this.locale.toolbar;
    const d = this.locale.dialogs;
    const buttons: BubbleButton[] = [
      {
        id: 'bold', icon: 'bold', title: t.bold,
        action: () => this.editor.chain().toggleMark('bold').run(),
        isActive: () => this.editor.isMarkActive('bold'),
      },
      {
        id: 'italic', icon: 'italic', title: t.italic,
        action: () => this.editor.chain().toggleMark('italic').run(),
        isActive: () => this.editor.isMarkActive('italic'),
      },
      {
        id: 'underline', icon: 'underline', title: t.underline,
        action: () => this.editor.chain().toggleMark('underline').run(),
        isActive: () => this.editor.isMarkActive('underline'),
      },
      {
        id: 'code_inline', icon: 'code_inline', title: t.inlineCode,
        action: () => this.editor.chain().toggleMark('code').run(),
        isActive: () => this.editor.isMarkActive('code'),
      },
      {
        id: 'link', icon: 'link', title: t.insertLink,
        action: () => {
          const href = window.prompt(d.linkUrl, 'https://');
          if (!href) return;
          const target = window.confirm(d.openInNewTab) ? '_blank' : '_self';
          this.editor.chain().toggleMark('link', { href, target }).run();
        },
        isActive: () => this.editor.isMarkActive('link'),
      },
    ];

    for (const btn of buttons) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'oe-bubble-btn';
      el.title = btn.title;
      el.innerHTML = ICONS[btn.icon] ?? btn.icon;
      el.dataset.btnId = btn.id;

      el.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Don't lose selection
      });
      el.addEventListener('click', () => {
        btn.action();
        this.updateActiveState();
      });

      this.el.appendChild(el);
    }
  }

  onSelectionChange(): void {
    const sel = window.getSelection();

    if (!sel || sel.isCollapsed || !this.editorEl.contains(sel.anchorNode)) {
      this.hide();
      return;
    }

    // Show after a brief delay to avoid flicker during click
    if (this.hideTimer) clearTimeout(this.hideTimer);
    setTimeout(() => {
      const currentSel = window.getSelection();
      if (!currentSel || currentSel.isCollapsed) { this.hide(); return; }
      this.showAtSelection();
      this.updateActiveState();
    }, 100);
  }

  private showAtSelection(): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (!rect.width && !rect.height) { this.hide(); return; }

    const toolbarWidth = 280; // approximate
    const toolbarHeight = 44;
    const margin = 8;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = rect.top + scrollY - toolbarHeight - margin;
    let left = rect.left + scrollX + rect.width / 2 - toolbarWidth / 2;

    // Keep within viewport
    if (top < scrollY + margin) top = rect.bottom + scrollY + margin;
    if (left < margin) left = margin;
    if (left + toolbarWidth > window.innerWidth - margin) {
      left = window.innerWidth - toolbarWidth - margin;
    }

    this.el.style.top = `${top}px`;
    this.el.style.left = `${left}px`;
    this.el.classList.add('oe-bubble-visible');
  }

  private hide(): void {
    this.hideTimer = setTimeout(() => {
      this.el.classList.remove('oe-bubble-visible');
    }, 200);
  }

  private updateActiveState(): void {
    const marks = getActiveMarks(this.editorEl);
    const btns = this.el.querySelectorAll<HTMLElement>('.oe-bubble-btn');
    btns.forEach((btn) => {
      const id = btn.dataset.btnId ?? '';
      const active =
        (id === 'bold' && marks.has('bold')) ||
        (id === 'italic' && marks.has('italic')) ||
        (id === 'underline' && marks.has('underline')) ||
        (id === 'code_inline' && marks.has('code')) ||
        (id === 'link' && marks.has('link'));
      btn.classList.toggle('oe-active', active);
    });
  }

  destroy(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.el.remove();
  }
}
