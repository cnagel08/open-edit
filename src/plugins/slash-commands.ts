// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Slash Commands Plugin
//
// Zeigt ein kontextuelles Dropdown-Menü wenn der Nutzer "/" am Anfang
// eines Blocks tippt. Bekannt aus Notion, Telegram, Slack.
//
// Unterstützte Befehle (Standard):
//   /paragraph, /p                 → Paragraph
//   /h1, /heading1                 → Heading 1
//   /h2, /heading2                 → Heading 2
//   /h3, /heading3                 → Heading 3
//   /h4 – /h6                      → Headings 4–6
//   /quote, /blockquote, /bq       → Blockquote
//   /code, /codeblock              → Code Block
//   /ul, /bullet, /bulletlist      → Bullet List
//   /ol, /numbered, /orderedlist   → Numbered List
//   /hr, /divider, /---            → Horizontal Rule
//   /callout, /info                → Callout Info
//   /success                       → Callout Success
//   /warning                       → Callout Warning
//   /danger, /error                → Callout Danger
//
// Usage:
//   import { createSlashCommandsPlugin } from 'openedit/plugins/slash-commands';
//   editor.use(createSlashCommandsPlugin());
//
//   // Eigene Befehle ergänzen / ersetzen:
//   editor.use(createSlashCommandsPlugin({ extraCommands: [...] }));
//   editor.use(createSlashCommandsPlugin({ commands: myCommands })); // komplett ersetzen
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorPlugin, EditorInterface } from '../core/types.js';

// ── Typen ────────────────────────────────────────────────────────────────────

export interface SlashCommand {
  /** Eindeutiger Bezeichner, wird für CSS data-Attribute verwendet */
  id: string;
  /** Angezeigter Titel im Menü */
  title: string;
  /** Optionale kurze Beschreibung unter dem Titel */
  description?: string;
  /** Icon: SVG-String oder HTML-Text (z.B. "H1", "¶") */
  icon: string;
  /** Suchbegriffe für die Filterung (lowercase) */
  keywords: string[];
  /** Wird ausgeführt wenn der Nutzer den Befehl auswählt */
  execute: (editor: EditorInterface) => void;
}

export interface SlashCommandsOptions {
  /** Komplett eigene Befehlsliste (ersetzt die Standardbefehle) */
  commands?: SlashCommand[];
  /** Zusätzliche Befehle die zu den Standardbefehlen hinzugefügt werden */
  extraCommands?: SlashCommand[];
}

// ── Icons (SVG inline, 16×16, stroke-basiert) ────────────────────────────────

const SVG_PARAGRAPH = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg>`;
const SVG_QUOTE = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`;
const SVG_CODE = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
const SVG_UL = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>`;
const SVG_OL = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="9" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">1.</text><text x="2" y="15" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">2.</text><text x="2" y="21" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">3.</text></svg>`;
const SVG_HR = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="2" y1="12" x2="22" y2="12"/></svg>`;
const SVG_CALLOUT_INFO    = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
const SVG_CALLOUT_SUCCESS = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
const SVG_CALLOUT_WARN    = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const SVG_CALLOUT_DANGER  = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

function headingIcon(level: number): string {
  return `<span style="font-size:11px;font-weight:700;letter-spacing:-0.5px;line-height:1">H${level}</span>`;
}

// ── Standard-Befehle ─────────────────────────────────────────────────────────

function buildDefaultCommands(): SlashCommand[] {
  return [
    {
      id: 'paragraph',
      title: 'Paragraph',
      description: 'Plain text block',
      icon: SVG_PARAGRAPH,
      keywords: ['paragraph', 'text', 'p', 'normal'],
      execute: (e) => e.chain().setBlock('paragraph').run(),
    },
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Large section title',
      icon: headingIcon(1),
      keywords: ['heading', 'h1', 'heading1', 'title', '1'],
      execute: (e) => e.chain().setBlock('heading', { level: 1 }).run(),
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Medium section title',
      icon: headingIcon(2),
      keywords: ['heading', 'h2', 'heading2', '2'],
      execute: (e) => e.chain().setBlock('heading', { level: 2 }).run(),
    },
    {
      id: 'h3',
      title: 'Heading 3',
      description: 'Small section title',
      icon: headingIcon(3),
      keywords: ['heading', 'h3', 'heading3', '3'],
      execute: (e) => e.chain().setBlock('heading', { level: 3 }).run(),
    },
    {
      id: 'h4',
      title: 'Heading 4',
      icon: headingIcon(4),
      keywords: ['heading', 'h4', 'heading4', '4'],
      execute: (e) => e.chain().setBlock('heading', { level: 4 }).run(),
    },
    {
      id: 'h5',
      title: 'Heading 5',
      icon: headingIcon(5),
      keywords: ['heading', 'h5', 'heading5', '5'],
      execute: (e) => e.chain().setBlock('heading', { level: 5 }).run(),
    },
    {
      id: 'h6',
      title: 'Heading 6',
      icon: headingIcon(6),
      keywords: ['heading', 'h6', 'heading6', '6'],
      execute: (e) => e.chain().setBlock('heading', { level: 6 }).run(),
    },
    {
      id: 'quote',
      title: 'Blockquote',
      description: 'Indented citation block',
      icon: SVG_QUOTE,
      keywords: ['quote', 'blockquote', 'bq', 'citation'],
      execute: (e) => e.chain().setBlock('blockquote').run(),
    },
    {
      id: 'code',
      title: 'Code Block',
      description: 'Monospace preformatted code',
      icon: SVG_CODE,
      keywords: ['code', 'codeblock', 'pre', 'monospace', 'snippet'],
      execute: (e) => e.chain().setBlock('code_block').run(),
    },
    {
      id: 'bullet',
      title: 'Bullet List',
      description: 'Unordered list with dots',
      icon: SVG_UL,
      keywords: ['ul', 'bullet', 'bulletlist', 'unordered', 'list', '-'],
      execute: (e) => e.chain().toggleList('bullet_list').run(),
    },
    {
      id: 'numbered',
      title: 'Numbered List',
      description: 'Ordered numbered list',
      icon: SVG_OL,
      keywords: ['ol', 'numbered', 'orderedlist', 'ordered', 'list', '1'],
      execute: (e) => e.chain().toggleList('ordered_list').run(),
    },
    {
      id: 'hr',
      title: 'Divider',
      description: 'Horizontal rule',
      icon: SVG_HR,
      keywords: ['hr', 'divider', 'separator', 'rule', '---'],
      execute: (e) => e.chain().insertHr().run(),
    },
    {
      id: 'callout-info',
      title: 'Callout: Info',
      description: 'Blue informational callout',
      icon: SVG_CALLOUT_INFO,
      keywords: ['callout', 'info', 'note', 'callout-info'],
      execute: (e) => e.chain().setBlock('callout', { variant: 'info' }).run(),
    },
    {
      id: 'callout-success',
      title: 'Callout: Success',
      description: 'Green success callout',
      icon: SVG_CALLOUT_SUCCESS,
      keywords: ['callout', 'success', 'done', 'callout-success'],
      execute: (e) => e.chain().setBlock('callout', { variant: 'success' }).run(),
    },
    {
      id: 'callout-warning',
      title: 'Callout: Warning',
      description: 'Yellow warning callout',
      icon: SVG_CALLOUT_WARN,
      keywords: ['callout', 'warning', 'warn', 'caution', 'callout-warning'],
      execute: (e) => e.chain().setBlock('callout', { variant: 'warning' }).run(),
    },
    {
      id: 'callout-danger',
      title: 'Callout: Danger',
      description: 'Red danger or error callout',
      icon: SVG_CALLOUT_DANGER,
      keywords: ['callout', 'danger', 'error', 'callout-danger'],
      execute: (e) => e.chain().setBlock('callout', { variant: 'danger' }).run(),
    },
  ];
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const STYLE_ID = 'oe-slash-menu-styles';

function injectMenuStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.oe-slash-menu {
  position: fixed;
  z-index: 10000;
  background: var(--oe-bg, #ffffff);
  border: 1px solid var(--oe-border, #e7e5e4);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07);
  padding: 5px;
  min-width: 230px;
  max-height: 300px;
  overflow-y: auto;
  font-family: var(--oe-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  scrollbar-width: thin;
  scrollbar-color: var(--oe-border, #e7e5e4) transparent;
}
.oe-slash-menu-empty {
  padding: 10px 12px;
  color: var(--oe-text-muted, #78716c);
  font-size: 13px;
}
.oe-slash-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: background 80ms;
}
.oe-slash-menu-item:hover {
  background: var(--oe-btn-hover-bg, #f5f5f4);
}
.oe-slash-menu-item.oe-slash-active {
  background: var(--oe-btn-active-bg, #1c1917);
  color: var(--oe-btn-active-fg, #ffffff);
}
.oe-slash-menu-item.oe-slash-active .oe-slash-menu-desc {
  color: rgba(255,255,255,0.6);
}
.oe-slash-menu-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--oe-btn-hover-bg, #f5f5f4);
  border: 1px solid var(--oe-border, #e7e5e4);
  border-radius: 6px;
  flex-shrink: 0;
  color: var(--oe-text, #1c1917);
}
.oe-slash-menu-item.oe-slash-active .oe-slash-menu-icon {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.2);
  color: #ffffff;
}
.oe-slash-menu-text { flex: 1; min-width: 0; }
.oe-slash-menu-title {
  font-weight: 500;
  color: var(--oe-text, #1c1917);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.oe-slash-menu-item.oe-slash-active .oe-slash-menu-title {
  color: var(--oe-btn-active-fg, #ffffff);
}
.oe-slash-menu-desc {
  font-size: 11px;
  color: var(--oe-text-muted, #78716c);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;
  document.head.appendChild(style);
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export function createSlashCommandsPlugin(options: SlashCommandsOptions = {}): EditorPlugin {
  const commands: SlashCommand[] = options.commands
    ? options.commands
    : [...buildDefaultCommands(), ...(options.extraCommands ?? [])];

  let editorEl: HTMLElement | null = null;
  let editorRef: EditorInterface | null = null;
  let menuEl: HTMLElement | null = null;
  let isOpen = false;
  let activeIndex = 0;
  let filteredCommands: SlashCommand[] = [];

  // ── Hilfsfunktionen ────────────────────────────────────────────────────────

  /** Gibt den aktuellen Block-DOM-Node zurück, wenn sein Text mit "/" beginnt */
  function getSlashBlock(): { blockEl: Element; query: string } | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return null;

    let node: Node | null = range.startContainer;
    while (node && node.parentNode !== editorEl) {
      node = node.parentNode;
    }
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
    const blockEl = node as Element;

    const text = blockEl.textContent ?? '';
    if (!text.startsWith('/')) return null;

    return { blockEl, query: text.slice(1).toLowerCase() };
  }

  function filterCommands(query: string): SlashCommand[] {
    if (!query) return commands;
    return commands.filter((cmd) => {
      const q = query.toLowerCase();
      return (
        cmd.id.includes(q) ||
        cmd.title.toLowerCase().includes(q) ||
        cmd.keywords.some((kw) => kw.includes(q))
      );
    });
  }

  function getMenuPosition(): { top: number; left: number } {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        return { top: rect.bottom + 6, left: rect.left };
      }
    }
    // Fallback: position near the editor element
    if (editorEl) {
      const rect = editorEl.getBoundingClientRect();
      return { top: rect.top + 40, left: rect.left + 16 };
    }
    return { top: 100, left: 100 };
  }

  function clampPosition(el: HTMLElement, top: number, left: number): { top: number; left: number } {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = el.offsetWidth || 240;
    const h = el.offsetHeight || 300;

    if (left + w > vw - 8) left = vw - w - 8;
    if (left < 8) left = 8;
    if (top + h > vh - 8) top = top - h - 28; // flip above cursor
    if (top < 8) top = 8;

    return { top, left };
  }

  // ── Menü-Rendering ─────────────────────────────────────────────────────────

  function renderMenu(): void {
    if (!menuEl) return;

    if (filteredCommands.length === 0) {
      menuEl.innerHTML = `<div class="oe-slash-menu-empty">No matching blocks</div>`;
      return;
    }

    menuEl.innerHTML = filteredCommands
      .map((cmd, i) => {
        const isActive = i === activeIndex;
        return `
          <div class="oe-slash-menu-item${isActive ? ' oe-slash-active' : ''}" data-index="${i}">
            <div class="oe-slash-menu-icon">${cmd.icon}</div>
            <div class="oe-slash-menu-text">
              <div class="oe-slash-menu-title">${cmd.title}</div>
              ${cmd.description ? `<div class="oe-slash-menu-desc">${cmd.description}</div>` : ''}
            </div>
          </div>`;
      })
      .join('');

    // Scroll active item into view
    const activeEl = menuEl.querySelector<HTMLElement>('.oe-slash-active');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }

  function showMenu(): void {
    if (!menuEl) return;
    isOpen = true;
    menuEl.style.display = 'block';

    const { top, left } = getMenuPosition();
    menuEl.style.top = `${top}px`;
    menuEl.style.left = `${left}px`;

    // Clamp after render (needs offsetWidth/Height)
    requestAnimationFrame(() => {
      if (!menuEl) return;
      const clamped = clampPosition(menuEl, top, left);
      menuEl.style.top = `${clamped.top}px`;
      menuEl.style.left = `${clamped.left}px`;
    });

    renderMenu();
  }

  function hideMenu(): void {
    if (!menuEl) return;
    isOpen = false;
    menuEl.style.display = 'none';
    menuEl.innerHTML = '';
    activeIndex = 0;
    filteredCommands = [];
  }

  function executeCommand(cmd: SlashCommand): void {
    if (!editorRef || !editorEl) return;

    const result = getSlashBlock();
    let blockIndex = -1;

    if (result) {
      const blockEl = result.blockEl as HTMLElement;

      // Remember which block index we're in so we can restore cursor after rerender
      blockIndex = Array.from(editorEl.children).indexOf(blockEl);

      // Clear the "/command" text
      blockEl.innerHTML = '';

      // Explicitly restore the selection inside this block — otherwise the browser
      // resets it to position 0 and getActiveBlockIndex() targets the wrong block.
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.setStart(blockEl, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    hideMenu();
    cmd.execute(editorRef);

    // After the rerender move the cursor into the transformed block (not doc start).
    // requestAnimationFrame ensures the DOM patch from rerender has settled.
    if (blockIndex >= 0) {
      requestAnimationFrame(() => {
        if (!editorEl) return;
        const block = editorEl.children[blockIndex] as HTMLElement | undefined;
        if (!block) return;

        // Find the deepest last text node to place cursor at end of content
        const lastText = lastTextNode(block);
        const sel = window.getSelection();
        if (!sel) return;

        const range = document.createRange();
        if (lastText) {
          // Non-empty block: cursor at end of text
          range.setStart(lastText, lastText.length);
        } else if (block instanceof HTMLElement && block.tagName === 'HR') {
          // Void element (<hr>) — put cursor in the block after it
          const next = editorEl.children[blockIndex + 1] as HTMLElement | undefined;
          const target = next ?? block;
          range.setStart(target, 0);
        } else {
          // Empty editable block (e.g. freshly inserted heading) — cursor inside it
          range.setStart(block, 0);
        }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      });
    }
  }

  /** Depth-first search for the deepest last text node inside an element. */
  function lastTextNode(node: Node): Text | null {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const found = lastTextNode(node.childNodes[i]);
      if (found) return found;
    }
    return node.nodeType === Node.TEXT_NODE ? (node as Text) : null;
  }

  // ── Event-Handler ──────────────────────────────────────────────────────────

  const onInput = (): void => {
    const result = getSlashBlock();

    if (!result) {
      if (isOpen) hideMenu();
      return;
    }

    const { query } = result;
    filteredCommands = filterCommands(query);

    // Prevent active index overflow after re-filter
    if (activeIndex >= filteredCommands.length) activeIndex = 0;

    if (filteredCommands.length > 0) {
      showMenu();
    } else {
      // No matches → keep showing "No matching blocks" hint briefly
      showMenu();
    }
  };

  const onKeydown = (e: KeyboardEvent): void => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopImmediatePropagation();
        activeIndex = (activeIndex + 1) % Math.max(filteredCommands.length, 1);
        renderMenu();
        break;

      case 'ArrowUp':
        e.preventDefault();
        e.stopImmediatePropagation();
        activeIndex = (activeIndex - 1 + Math.max(filteredCommands.length, 1)) % Math.max(filteredCommands.length, 1);
        renderMenu();
        break;

      case 'Enter':
        if (filteredCommands.length > 0 && filteredCommands[activeIndex]) {
          e.preventDefault();
          e.stopImmediatePropagation();
          executeCommand(filteredCommands[activeIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        e.stopImmediatePropagation();
        hideMenu();
        break;

      case 'Tab':
        // Tab selects like Enter
        if (filteredCommands.length > 0 && filteredCommands[activeIndex]) {
          e.preventDefault();
          e.stopImmediatePropagation();
          executeCommand(filteredCommands[activeIndex]);
        }
        break;
    }
  };

  /** Schließt Menü wenn außerhalb geklickt wird */
  const onDocumentClick = (e: MouseEvent): void => {
    if (!isOpen || !menuEl) return;
    if (!menuEl.contains(e.target as Node)) {
      hideMenu();
    }
  };

  /** Klick auf ein Menü-Item */
  const onMenuClick = (e: MouseEvent): void => {
    const item = (e.target as Element).closest<HTMLElement>('.oe-slash-menu-item');
    if (!item) return;
    const idx = parseInt(item.dataset.index ?? '0', 10);
    const cmd = filteredCommands[idx];
    if (cmd) executeCommand(cmd);
  };

  /** Scrollt das Fenster → Menü neu positionieren */
  const onScroll = (): void => {
    if (isOpen) hideMenu();
  };

  // ── Plugin-Objekt ──────────────────────────────────────────────────────────

  return {
    name: 'slash-commands',

    onInit(editor: EditorInterface) {
      editorRef = editor;
      editorEl = (editor as unknown as { editorEl: HTMLElement }).editorEl;
      if (!editorEl) return;

      injectMenuStyles();

      // Menü-Element erstellen und an body anhängen
      menuEl = document.createElement('div');
      menuEl.className = 'oe-slash-menu';
      menuEl.style.display = 'none';
      document.body.appendChild(menuEl);

      // Events registrieren (keydown muss VOR dem Editor-keydown feuern → capture: true)
      editorEl.addEventListener('keydown', onKeydown, true);
      editorEl.addEventListener('input', onInput);
      menuEl.addEventListener('click', onMenuClick);
      document.addEventListener('click', onDocumentClick, true);
      window.addEventListener('scroll', onScroll, { passive: true });
    },

    onDestroy(_editor: EditorInterface) {
      if (editorEl) {
        editorEl.removeEventListener('keydown', onKeydown, true);
        editorEl.removeEventListener('input', onInput);
      }
      if (menuEl) {
        menuEl.removeEventListener('click', onMenuClick);
        menuEl.remove();
        menuEl = null;
      }
      document.removeEventListener('click', onDocumentClick, true);
      window.removeEventListener('scroll', onScroll);
      editorEl = null;
      editorRef = null;
      isOpen = false;
    },
  };
}
