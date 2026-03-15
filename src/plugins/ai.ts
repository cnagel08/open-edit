// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit Plugin — AI Writing Assistant (N1)
// Optional plugin for AI-powered text improvement via the Claude API.
// The /ai slash command or toolbar button opens the prompt panel.
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorInterface, EditorPlugin } from '../core/types.js';
import type { EditorLocale } from '../locales/types.js';
import { en } from '../locales/en.js';
import { deserializeHTML } from '../io/deserializer.js';
import { serializeToHTML } from '../io/serializer.js';

const AI_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

// ── Config ────────────────────────────────────────────────────────────────────

export interface AIPluginOptions {
  /** Anthropic API key. Keep this server-side in production — use `endpoint` for a proxy. */
  apiKey?: string;
  /**
   * Custom endpoint URL (proxy server). The plugin POSTs the same payload as the
   * Anthropic Messages API. Use this to avoid exposing your API key in the browser.
   * Example: '/api/ai' → your server calls Anthropic and returns the response.
   */
  endpoint?: string;
  /** Model ID. Default: 'claude-sonnet-4-6' */
  model?: string;
  /** Max output tokens. Default: 2048 */
  maxTokens?: number;
}

// AI prompts sent to Claude stay in English for quality — only labels are localized
const AI_PROMPTS = {
  improve:   'Improve the following text stylistically and grammatically. Return only the improved text, no explanations.',
  shorten:   'Shorten the following text to approximately 50% of its length, keeping all important information. Return only the shortened text.',
  expand:    'Expand the following text with more details, examples, and context. Return only the expanded text.',
  summarize: 'Summarize the following text in 2-3 concise sentences. Return only the summary.',
  toGerman:  'Translate the following text to German. Return only the translation.',
  toEnglish: 'Translate the following text to English. Return only the translation, no explanations.',
};

function buildQuickActions(locale: EditorLocale) {
  const a = locale.plugins.ai.actions;
  return [
    { label: a.improve,   prompt: AI_PROMPTS.improve },
    { label: a.shorten,   prompt: AI_PROMPTS.shorten },
    { label: a.expand,    prompt: AI_PROMPTS.expand },
    { label: a.summarize, prompt: AI_PROMPTS.summarize },
    { label: a.toGerman,  prompt: AI_PROMPTS.toGerman },
    { label: a.toEnglish, prompt: AI_PROMPTS.toEnglish },
  ];
}

// ── API call ──────────────────────────────────────────────────────────────────

async function callClaude(
  userMessage: string,
  opts: AIPluginOptions,
): Promise<string> {
  const url = opts.endpoint ?? 'https://api.anthropic.com/v1/messages';
  const model = opts.model ?? 'claude-sonnet-4-6';

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (opts.apiKey && !opts.endpoint) {
    headers['x-api-key'] = opts.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    // Required for direct browser access
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  const body = JSON.stringify({
    model,
    max_tokens: opts.maxTokens ?? 2048,
    system: 'You are a professional writing assistant. Follow the user\'s instruction exactly and return only the desired result — no introduction, no explanation, no commentary.',
    messages: [{ role: 'user', content: userMessage }],
  });

  const res = await fetch(url, { method: 'POST', headers, body });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text as string | undefined;
  if (!text) throw new Error('Unexpected response format');
  return text;
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function css(el: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(el.style, styles);
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export function createAIPlugin(opts: AIPluginOptions = {}): EditorPlugin {
  if (!opts.apiKey && !opts.endpoint) {
    console.warn('[OpenEdit AI] No apiKey or endpoint provided — plugin inactive.');
  }

  let panel: HTMLDivElement | null = null;
  let aiBtn: HTMLElement | null = null;
  let editorRef: EditorInterface | null = null;
  let savedRange: Range | null = null;
  let selectedText = '';
  let locale: EditorLocale = en;

  function closePanel(): void {
    if (panel) { panel.remove(); panel = null; }
    document.removeEventListener('click', onDocClick, true);
  }

  function onDocClick(e: MouseEvent): void {
    const t = e.target as Node;
    if (panel && !panel.contains(t) && !aiBtn?.contains(t)) closePanel();
  }

  function captureSelection(editorEl: HTMLElement): void {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorEl.contains(sel.anchorNode)) {
      savedRange = sel.getRangeAt(0).cloneRange();
      selectedText = sel.toString().trim();
    } else {
      savedRange = null;
      selectedText = editorRef?.getHTML() ?? '';
    }
  }

  function replaceWithResult(html: string): void {
    if (!editorRef) return;

    const sel = window.getSelection();
    if (savedRange && sel && selectedText) {
      // Replace selection
      sel.removeAllRanges();
      sel.addRange(savedRange);
      const doc = deserializeHTML(html);
      const cleanHTML = serializeToHTML(doc);
      document.execCommand('insertHTML', false, cleanHTML);
    } else {
      // Replace entire document
      editorRef.setHTML(html);
    }
    editorRef.focus();
  }

  function buildPanel(anchorEl: HTMLElement): void {
    closePanel();

    panel = document.createElement('div');
    css(panel, {
      position: 'fixed',
      zIndex: '99999',
      background: 'var(--oe-bg, #fff)',
      border: '1px solid var(--oe-border, #e7e5e4)',
      borderRadius: '14px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
      padding: '16px',
      width: '360px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    });

    const ai = locale.plugins.ai;

    // Header
    const header = document.createElement('div');
    css(header, { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' });
    header.innerHTML = `${AI_ICON}<span style="font-size:13px;font-weight:600;color:var(--oe-text,#1c1917)">${ai.panelTitle}</span>`;
    panel.appendChild(header);

    // Context preview
    const preview = document.createElement('div');
    const previewText = selectedText || ai.noSelection;
    css(preview, {
      fontSize: '12px',
      color: 'var(--oe-text-muted, #78716c)',
      background: 'var(--oe-btn-hover-bg, #f5f5f4)',
      borderRadius: '8px',
      padding: '8px 10px',
      marginBottom: '12px',
      maxHeight: '64px',
      overflow: 'hidden',
      lineHeight: '1.5',
    });
    preview.textContent = previewText.length > 140 ? previewText.slice(0, 140) + '…' : previewText;
    panel.appendChild(preview);

    // Quick action buttons
    const quickGrid = document.createElement('div');
    css(quickGrid, { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' });

    for (const action of buildQuickActions(locale)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = action.label;
      css(btn, {
        padding: '5px 10px',
        fontSize: '12px',
        fontWeight: '500',
        border: '1px solid var(--oe-border, #e7e5e4)',
        borderRadius: '6px',
        background: 'var(--oe-bg, #fff)',
        color: 'var(--oe-text, #1c1917)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.1s',
      });
      btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--oe-btn-hover-bg, #f5f5f4)'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = 'var(--oe-bg, #fff)'; });
      btn.addEventListener('click', () => {
        const context = selectedText || editorRef?.getHTML() || '';
        runPrompt(`${action.prompt}\n\n${context}`, resultArea, applyBtn);
      });
      quickGrid.appendChild(btn);
    }
    panel.appendChild(quickGrid);

    // Custom prompt
    const promptRow = document.createElement('div');
    css(promptRow, { display: 'flex', gap: '6px', marginBottom: '12px' });

    const promptInput = document.createElement('textarea');
    promptInput.placeholder = ai.customPromptPlaceholder;
    promptInput.rows = 2;
    css(promptInput, {
      flex: '1',
      padding: '8px 10px',
      fontSize: '12px',
      border: '1px solid var(--oe-border, #e7e5e4)',
      borderRadius: '8px',
      background: 'var(--oe-bg, #fff)',
      color: 'var(--oe-text, #1c1917)',
      fontFamily: 'inherit',
      resize: 'none',
      outline: 'none',
    });

    const runBtn = document.createElement('button');
    runBtn.type = 'button';
    runBtn.textContent = ai.runButton;
    css(runBtn, {
      padding: '0 14px',
      fontSize: '12px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      background: '#1c1917',
      color: '#fff',
      cursor: 'pointer',
      fontFamily: 'inherit',
      alignSelf: 'stretch',
    });
    runBtn.addEventListener('click', () => {
      const context = selectedText || editorRef?.getHTML() || '';
      const instruction = promptInput.value.trim();
      if (!instruction) return;
      runPrompt(`${instruction}\n\n${context}`, resultArea, applyBtn);
    });

    promptRow.appendChild(promptInput);
    promptRow.appendChild(runBtn);
    panel.appendChild(promptRow);

    // Result area
    const resultArea = document.createElement('div');
    css(resultArea, {
      display: 'none',
      fontSize: '12px',
      color: 'var(--oe-text, #1c1917)',
      background: 'var(--oe-btn-hover-bg, #f5f5f4)',
      borderRadius: '8px',
      padding: '10px',
      marginBottom: '10px',
      lineHeight: '1.6',
      maxHeight: '120px',
      overflowY: 'auto',
    });
    panel.appendChild(resultArea);

    // Apply button (hidden initially)
    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.textContent = ai.applyButton;
    applyBtn.style.display = 'none';
    css(applyBtn, {
      width: '100%',
      padding: '9px',
      fontSize: '13px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      background: '#1c1917',
      color: '#fff',
      cursor: 'pointer',
      fontFamily: 'inherit',
    });
    applyBtn.addEventListener('click', () => {
      const result = resultArea.dataset.result ?? '';
      if (result) {
        replaceWithResult(result);
        closePanel();
      }
    });
    panel.appendChild(applyBtn);

    document.body.appendChild(panel);

    // Position
    const rect = anchorEl.getBoundingClientRect();
    let top = rect.bottom + 4;
    let left = rect.left;
    if (left + 360 > window.innerWidth - 8) left = window.innerWidth - 368;
    if (left < 8) left = 8;
    if (top + 400 > window.innerHeight - 8) top = rect.top - 400 - 4;
    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;

    setTimeout(() => {
      document.addEventListener('click', onDocClick, true);
    }, 0);
  }

  async function runPrompt(
    fullPrompt: string,
    resultArea: HTMLElement,
    applyBtn: HTMLElement,
  ): Promise<void> {
    const ai = locale.plugins.ai;
    if (!opts.apiKey && !opts.endpoint) {
      resultArea.style.display = 'block';
      resultArea.textContent = ai.noApiKey;
      return;
    }

    resultArea.style.display = 'block';
    resultArea.textContent = ai.generating;
    applyBtn.style.display = 'none';

    try {
      const result = await callClaude(fullPrompt, opts);
      resultArea.textContent = result.length > 400 ? result.slice(0, 400) + '…' : result;
      resultArea.dataset.result = result;
      applyBtn.style.display = 'block';
    } catch (err) {
      resultArea.textContent = `${ai.errorPrefix}${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return {
    name: 'ai-assistant',

    onInit(editor: EditorInterface) {
      editorRef = editor;
      locale = (editor as unknown as { locale: EditorLocale }).locale ?? en;

      const editorEl = (editor as unknown as { editorEl: HTMLElement }).editorEl;
      const containerEl = (editor as unknown as { containerEl: HTMLElement }).containerEl;
      const toolbarEl = containerEl?.querySelector<HTMLElement>('.oe-toolbar');
      if (!toolbarEl) return;

      // Track selection
      document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorEl.contains(sel.anchorNode)) {
          savedRange = sel.getRangeAt(0).cloneRange();
          selectedText = sel.isCollapsed ? '' : sel.toString().trim();
        }
      });

      // Toolbar button
      const sep = document.createElement('div');
      sep.className = 'oe-toolbar-sep';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'oe-toolbar-btn';
      btn.title = locale.plugins.ai.panelTitle;
      btn.innerHTML = AI_ICON;
      // Accent color for AI button
      css(btn, { color: 'rgb(99,102,241)' });
      aiBtn = btn;

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        captureSelection(editorEl);
        if (panel) { closePanel(); } else { buildPanel(btn); }
      });

      toolbarEl.appendChild(sep);
      toolbarEl.appendChild(btn);

      // Slash command: /ai
      editorEl.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return;
          const range = sel.getRangeAt(0);
          const lineText = range.startContainer.textContent ?? '';
          if (lineText.trim() === '/ai') {
            e.preventDefault();
            // Remove /ai text
            const r = document.createRange();
            r.setStart(range.startContainer, 0);
            r.setEnd(range.startContainer, lineText.length);
            r.deleteContents();
            captureSelection(editorEl);
            buildPanel(btn);
          }
        }
      });
    },

    onDestroy() {
      closePanel();
      editorRef = null;
    },
  };
}
