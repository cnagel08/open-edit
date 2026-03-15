// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit Plugin — Emoji Picker (K4)
// Adds a toolbar button that opens an emoji panel. No external dependencies.
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorInterface, EditorPlugin } from '../core/types.js';
import type { EditorLocale } from '../locales/types.js';
import { en } from '../locales/en.js';

// ── Emoji data (locale-independent) ──────────────────────────────────────────

type EmojiCategoryKey = keyof EditorLocale['plugins']['emoji']['categories'];

const EMOJI_SETS: Record<EmojiCategoryKey, string[]> = {
  faces:    ['😀','😄','😅','😂','🤣','😊','😇','🙂','🙃','😉','😍','🥰','😘','😎','🤓','🤩','🥳','😏','😔','😢','😭','😤','😠','🥺','🤔','🤗','😴','🤯','🥸','😶'],
  hearts:   ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💕','💞','💓','💗','💖','💝','💘','❣️','💔','❤️‍🔥','💟'],
  gestures: ['👋','🤚','🖐','✋','🖖','👌','🤌','✌️','🤞','🤟','🤘','👈','👉','👆','👇','☝️','👍','👎','✊','👏','🙌','🫶','🤝','🙏'],
  nature:   ['🌸','🌺','🌻','🌹','🌷','🍀','🌿','🌱','🌲','🌳','🌴','🍁','🍂','🍃','🌊','🌈','☀️','🌙','⭐','🌟','💫','⚡','🔥','💧','🌍','🦋','🐾'],
  food:     ['🍎','🍊','🍋','🍇','🍓','🍒','🍑','🥝','🍕','🍔','🌮','🌯','🍜','🍣','🍰','🎂','☕','🍵','🧃','🥤','🍺','🥂','🍾'],
  objects:  ['💡','🔑','🎵','🎮','📱','💻','📷','🎯','🏆','💎','🔮','📚','✏️','📝','📌','🔔','💬','📧','🚀','🎁','🧩','⚙️','🔧','🎨'],
  symbols:  ['✅','❌','⚠️','ℹ️','💯','🔴','🟡','🟢','🔵','⚫','⚪','🔶','🔷','🔸','🔹','▶️','◀️','🔝','🔛','🆕','🆒','🆓','🆙','🏳️','🏴'],
};

function buildEmojiData(locale: EditorLocale) {
  const cats = locale.plugins.emoji.categories;
  return (Object.keys(EMOJI_SETS) as EmojiCategoryKey[]).map((key) => ({
    label: cats[key],
    emojis: EMOJI_SETS[key],
  }));
}

const EMOJI_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;

// ── Plugin ────────────────────────────────────────────────────────────────────

export function createEmojiPlugin(): EditorPlugin {
  let popup: HTMLDivElement | null = null;
  let emojiBtn: HTMLElement | null = null;
  let editorRef: EditorInterface | null = null;
  let savedRange: Range | null = null;
  let locale: EditorLocale = en;

  function closePopup(): void {
    if (popup) {
      popup.remove();
      popup = null;
    }
    document.removeEventListener('click', onDocumentClick, true);
  }

  function onDocumentClick(e: MouseEvent): void {
    const target = e.target as Node;
    if (popup && !popup.contains(target) && !emojiBtn?.contains(target)) {
      closePopup();
    }
  }

  function insertEmoji(emoji: string): void {
    const sel = window.getSelection();
    if (savedRange && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    } else if (editorRef) {
      editorRef.focus();
    }
    document.execCommand('insertText', false, emoji);
    closePopup();
    editorRef?.focus();
  }

  function buildPopup(anchorEl: HTMLElement): void {
    closePopup();

    popup = document.createElement('div');
    popup.className = 'oe-emoji-popup';

    Object.assign(popup.style, {
      position: 'fixed',
      zIndex: '99999',
      background: 'var(--oe-bg, #ffffff)',
      border: '1px solid var(--oe-border, #e7e5e4)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      padding: '10px 12px',
      width: '300px',
      maxHeight: '260px',
      overflowY: 'auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    });

    for (const category of buildEmojiData(locale)) {
      const label = document.createElement('div');
      Object.assign(label.style, {
        fontSize: '10px',
        fontWeight: '600',
        color: 'var(--oe-muted, #78716c)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        margin: '6px 0 4px',
      });
      label.textContent = category.label;
      popup.appendChild(label);

      const grid = document.createElement('div');
      Object.assign(grid.style, {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1px',
      });

      for (const emoji of category.emojis) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = emoji;
        btn.title = emoji;
        Object.assign(btn.style, {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '6px',
          fontSize: '18px',
          lineHeight: '1',
          transition: 'background 0.1s',
        });
        btn.addEventListener('mouseenter', () => {
          btn.style.background = 'var(--oe-btn-hover-bg, #f5f5f4)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.background = 'none';
        });
        // mousedown prevents editor blur; actual insert on mousedown
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          insertEmoji(emoji);
        });
        grid.appendChild(btn);
      }

      popup.appendChild(grid);
    }

    document.body.appendChild(popup);

    // Position below anchor
    const rect = anchorEl.getBoundingClientRect();
    let top = rect.bottom + 4;
    let left = rect.left;

    // Clamp to viewport
    if (left + 300 > window.innerWidth - 8) left = window.innerWidth - 308;
    if (left < 8) left = 8;

    const estHeight = 260;
    if (top + estHeight > window.innerHeight - 8) top = rect.top - estHeight - 4;

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;

    // Close on outside click (capture phase, next tick)
    setTimeout(() => {
      document.addEventListener('click', onDocumentClick, true);
    }, 0);
  }

  return {
    name: 'emoji',

    onInit(editor: EditorInterface) {
      editorRef = editor;
      locale = (editor as unknown as { locale: EditorLocale }).locale ?? en;

      const editorEl = (editor as unknown as { editorEl: HTMLElement }).editorEl;
      const containerEl = (editor as unknown as { containerEl: HTMLElement }).containerEl;
      const toolbarEl = containerEl?.querySelector<HTMLElement>('.oe-toolbar');
      if (!toolbarEl) return;

      // Save selection whenever cursor moves in editor
      document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorEl.contains(sel.anchorNode)) {
          savedRange = sel.getRangeAt(0).cloneRange();
        }
      });

      // Inject button at end of toolbar
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'oe-toolbar-btn';
      btn.title = locale.plugins.emoji.buttonTitle;
      btn.innerHTML = EMOJI_ICON;
      emojiBtn = btn;

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // keep editor focused
        // Capture selection before focus potentially changes
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorEl.contains(sel.anchorNode)) {
          savedRange = sel.getRangeAt(0).cloneRange();
        }
        if (popup) {
          closePopup();
        } else {
          buildPopup(btn);
        }
      });

      toolbarEl.appendChild(btn);
    },

    onDestroy() {
      closePopup();
      editorRef = null;
      savedRange = null;
    },
  };
}
