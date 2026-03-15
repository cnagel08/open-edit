// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Code Language Picker
//
// Renders a clickable language badge on each <pre> block and shows a
// floating dropdown with a filter input when the badge is clicked.
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorInterface } from '../core/types.js';

// ── Language list ─────────────────────────────────────────────────────────────

const LANGUAGES: string[] = [
  'plain',
  'bash', 'c', 'cpp', 'csharp', 'css', 'dockerfile',
  'go', 'graphql', 'html', 'java', 'javascript', 'json',
  'kotlin', 'markdown', 'php', 'python', 'ruby', 'rust',
  'scss', 'shell', 'sql', 'swift', 'typescript', 'xml', 'yaml',
];

// ── CodeLangPicker ────────────────────────────────────────────────────────────

export class CodeLangPicker {
  private editorEl: HTMLElement;
  private editor: EditorInterface;
  private pickerEl: HTMLElement | null = null;
  private activeIndex = 0;
  private filtered: string[] = [];
  private targetPreEl: HTMLElement | null = null;
  private onOutside: ((e: MouseEvent) => void) | null = null;
  private onOutsideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(editorEl: HTMLElement, editor: EditorInterface) {
    this.editorEl = editorEl;
    this.editor = editor;

    // Event delegation: one listener for all badges, present + future
    this.editorEl.addEventListener('mousedown', this.onBadgeMousedown, true);
    this.editorEl.addEventListener('click', this.onBadgeClick, true);
  }

  // ── Event handlers ──────────────────────────────────────────────────────────

  private readonly onBadgeMousedown = (e: MouseEvent): void => {
    const target = e.target as Element;
    if (!target.classList.contains('oe-code-lang-badge')) return;
    // Prevent focus loss from the editor
    e.preventDefault();
    e.stopPropagation();
  };

  private readonly onBadgeClick = (e: MouseEvent): void => {
    const target = e.target as Element;
    if (!target.classList.contains('oe-code-lang-badge')) return;
    e.preventDefault();
    e.stopPropagation();

    const preEl = target.closest('pre') as HTMLElement | null;
    if (!preEl) return;

    if (this.pickerEl && this.targetPreEl === preEl) {
      this.closePicker();
      return;
    }

    this.closePicker();
    this.targetPreEl = preEl;
    this.openPicker(target as HTMLElement, preEl);
  };

  // ── Picker open / close ────────────────────────────────────────────────────

  private openPicker(badgeEl: HTMLElement, preEl: HTMLElement): void {
    const picker = document.createElement('div');
    picker.className = 'oe-code-lang-picker';
    this.pickerEl = picker;

    // Filter input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'oe-code-lang-picker-input';
    input.placeholder = 'Filter…';
    picker.appendChild(input);

    // List container
    const list = document.createElement('div');
    list.className = 'oe-code-lang-picker-list';
    picker.appendChild(list);

    document.body.appendChild(picker);
    this.renderList(list, '');

    // Position below the badge
    const rect = badgeEl.getBoundingClientRect();
    picker.style.top = `${rect.bottom + 4}px`;
    picker.style.left = `${rect.left}px`;

    requestAnimationFrame(() => {
      if (!picker.isConnected) return;
      const vw = window.innerWidth;
      const right = rect.left + picker.offsetWidth;
      if (right > vw - 8) picker.style.left = `${vw - picker.offsetWidth - 8}px`;
      input.focus();
    });

    // Keyboard navigation inside the input
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, this.filtered.length - 1);
        this.updateActive(list);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, 0);
        this.updateActive(list);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const lang = this.filtered[this.activeIndex];
        if (lang !== undefined) this.selectLang(lang, preEl);
      } else if (e.key === 'Escape') {
        this.closePicker();
      }
    });

    input.addEventListener('input', () => {
      this.activeIndex = 0;
      this.renderList(list, input.value.trim().toLowerCase());
    });

    // Close on outside mousedown
    this.onOutside = (e: MouseEvent): void => {
      if (!picker.contains(e.target as Node)) {
        this.closePicker();
      }
    };
    this.onOutsideTimer = setTimeout(() => {
      this.onOutsideTimer = null;
      if (this.onOutside) document.addEventListener('mousedown', this.onOutside, true);
    }, 0);
  }

  private renderList(list: HTMLElement, query: string): void {
    this.filtered = query
      ? LANGUAGES.filter((l) => l.includes(query))
      : LANGUAGES;

    list.innerHTML = '';
    this.filtered.forEach((lang, i) => {
      const item = document.createElement('div');
      item.className = 'oe-code-lang-picker-item' + (i === this.activeIndex ? ' oe-active' : '');
      item.textContent = lang;
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.selectLang(lang, this.targetPreEl!);
      });
      list.appendChild(item);
    });
  }

  private updateActive(list: HTMLElement): void {
    list.querySelectorAll('.oe-code-lang-picker-item').forEach((el, i) => {
      el.classList.toggle('oe-active', i === this.activeIndex);
      if (i === this.activeIndex) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    });
  }

  private selectLang(lang: string, preEl: HTMLElement): void {
    this.closePicker();

    // Place selection inside the <code> element of this block so
    // getActiveBlockIndex() targets the right block
    const codeEl = preEl.querySelector('code');
    if (codeEl) {
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.setStart(codeEl, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    const finalLang = lang === 'plain' ? undefined : lang;
    this.editor.chain().setBlock('code_block', { lang: finalLang }).run();
  }

  private closePicker(): void {
    if (this.onOutsideTimer !== null) {
      clearTimeout(this.onOutsideTimer);
      this.onOutsideTimer = null;
    }
    if (this.onOutside) {
      document.removeEventListener('mousedown', this.onOutside, true);
      this.onOutside = null;
    }
    this.pickerEl?.remove();
    this.pickerEl = null;
    this.targetPreEl = null;
    this.activeIndex = 0;
    this.filtered = [];
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  destroy(): void {
    this.closePicker();
    this.editorEl.removeEventListener('mousedown', this.onBadgeMousedown, true);
    this.editorEl.removeEventListener('click', this.onBadgeClick, true);
  }
}
