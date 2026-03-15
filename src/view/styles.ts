// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — CSS injection (M13: CSS Custom Properties, Dark/Light Mode)
// All styles are scoped to .oe-container — no global pollution.
// ─────────────────────────────────────────────────────────────────────────────

const STYLE_ID = 'openedit-styles';

export function injectStyles(theme: 'light' | 'dark' | 'auto'): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = getCSS();
  document.head.appendChild(style);
}

function getCSS(): string {
  return `
/* ── CSS Custom Properties (Light Mode defaults) ────────────────────── */
:root {
  --oe-bg: #ffffff;
  --oe-bg-toolbar: #fafaf9;
  --oe-bg-statusbar: #fafaf9;
  --oe-bg-code: #1c1917;
  --oe-bg-html: #1c1917;
  --oe-border: #e7e5e4;
  --oe-border-inner: #e7e5e4;
  --oe-text: #1c1917;
  --oe-text-muted: #78716c;
  --oe-text-light: #a8a29e;
  --oe-text-code: #f5f5f4;
  --oe-btn-active-bg: #1c1917;
  --oe-btn-active-fg: #ffffff;
  --oe-btn-hover-bg: #f5f5f4;
  --oe-shadow: 0 4px 16px rgba(0,0,0,0.07);
  --oe-radius: 16px;
  --oe-radius-sm: 8px;
  --oe-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --oe-font-mono: "Fira Code", "Cascadia Code", "Courier New", monospace;
  --oe-focus-ring: 0 0 0 4px rgba(28,25,23,0.05);
  --oe-link-color: #2563eb;
  --oe-mark-bg: rgba(251,191,36,0.4);
  --oe-blockquote-border: #d6d3d1;
}

/* Dark mode via attribute */
[data-oe-theme="dark"] .oe-container,
.oe-container[data-oe-theme="dark"] {
  --oe-bg: #1c1917;
  --oe-bg-toolbar: #1c1917;
  --oe-bg-statusbar: #161412;
  --oe-bg-code: #0c0a09;
  --oe-bg-html: #0c0a09;
  --oe-border: #3a3330;
  --oe-border-inner: #2c2a28;
  --oe-text: #e7e5e4;
  --oe-text-muted: #a8a29e;
  --oe-text-light: #78716c;
  --oe-btn-active-bg: #e7e5e4;
  --oe-btn-active-fg: #1c1917;
  --oe-btn-hover-bg: #292524;
  --oe-shadow: 0 4px 16px rgba(0,0,0,0.4);
  --oe-link-color: #60a5fa;
  --oe-mark-bg: rgba(180,130,0,0.3);
  --oe-blockquote-border: #57534e;
}

/* Auto dark mode (follows OS preference) */
@media (prefers-color-scheme: dark) {
  [data-oe-theme="auto"] .oe-container,
  .oe-container[data-oe-theme="auto"] {
    --oe-bg: #1c1917;
    --oe-bg-toolbar: #1c1917;
    --oe-bg-statusbar: #161412;
    --oe-bg-code: #0c0a09;
    --oe-bg-html: #0c0a09;
    --oe-border: #3a3330;
    --oe-border-inner: #2c2a28;
    --oe-text: #e7e5e4;
    --oe-text-muted: #a8a29e;
    --oe-text-light: #78716c;
    --oe-btn-active-bg: #e7e5e4;
    --oe-btn-active-fg: #1c1917;
    --oe-btn-hover-bg: #292524;
    --oe-shadow: 0 4px 16px rgba(0,0,0,0.4);
    --oe-link-color: #60a5fa;
    --oe-mark-bg: rgba(180,130,0,0.3);
    --oe-blockquote-border: #57534e;
  }
}

/* ── Container ──────────────────────────────────────────────────────── */
.oe-container {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--oe-border);
  border-radius: var(--oe-radius);
  overflow: hidden;
  background: var(--oe-bg);
  box-shadow: var(--oe-shadow);
  font-family: var(--oe-font);
  color: var(--oe-text);
  box-sizing: border-box;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.oe-container.oe-focused {
  box-shadow: var(--oe-shadow), var(--oe-focus-ring);
  border-color: #a8a29e;
}

/* ── Toolbar ────────────────────────────────────────────────────────── */
.oe-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--oe-border);
  background: var(--oe-bg-toolbar);
  border-radius: var(--oe-radius) var(--oe-radius) 0 0;
  min-height: 50px;
  box-sizing: border-box;
}

.oe-toolbar-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.oe-toolbar-sep {
  width: 1px;
  height: 24px;
  background: var(--oe-border);
  margin: 0 6px;
  flex-shrink: 0;
}

.oe-toolbar-spacer {
  flex: 1;
}

.oe-toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--oe-radius-sm);
  background: transparent;
  color: var(--oe-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.1s, color 0.1s;
}

.oe-toolbar-btn:hover {
  background: var(--oe-btn-hover-bg);
  color: var(--oe-text);
}

.oe-toolbar-btn.oe-active {
  background: var(--oe-btn-active-bg);
  color: var(--oe-btn-active-fg);
}

.oe-toolbar-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.oe-toolbar-select-wrap {
  position: relative;
}

.oe-toolbar-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--oe-border);
  border-radius: var(--oe-radius-sm);
  background: var(--oe-bg);
  color: var(--oe-text);
  font-family: var(--oe-font);
  font-size: 13px;
  cursor: pointer;
  outline: none;
  min-width: 130px;
  transition: border-color 0.1s;
}

.oe-toolbar-select:hover {
  border-color: var(--oe-text-light);
}

.oe-toolbar-select:focus {
  border-color: var(--oe-text-muted);
}

/* ── Content wrapper ────────────────────────────────────────────────── */
.oe-content-wrap {
  flex: 1;
  position: relative;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

/* ── Editor (contenteditable) ───────────────────────────────────────── */
.oe-editor {
  flex: 1;
  padding: 28px 32px;
  outline: none;
  min-height: 300px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--oe-text);
  background: var(--oe-bg);
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

/* Placeholder */
.oe-editor.oe-empty::before {
  content: attr(data-placeholder);
  color: var(--oe-text-light);
  pointer-events: none;
  position: absolute;
  top: 28px;
  left: 32px;
}

/* Content styles */
.oe-editor h1 { font-size: 1.875rem; font-weight: 700; margin: 0 0 1rem; color: var(--oe-text); }
.oe-editor h2 { font-size: 1.5rem;   font-weight: 600; margin: 1.4rem 0 0.75rem; color: var(--oe-text); }
.oe-editor h3 { font-size: 1.25rem;  font-weight: 600; margin: 1.2rem 0 0.6rem;  color: var(--oe-text); }
.oe-editor h4 { font-size: 1.125rem; font-weight: 600; margin: 1rem 0 0.5rem;    color: var(--oe-text); }
.oe-editor h1:first-child,
.oe-editor h2:first-child { margin-top: 0; }
.oe-editor p  { margin: 0 0 0.875rem; }
.oe-editor p:last-child { margin-bottom: 0; }
.oe-editor strong, .oe-editor b { font-weight: 600; color: var(--oe-text); }
.oe-editor em, .oe-editor i { font-style: italic; }
.oe-editor u { text-decoration: underline; text-underline-offset: 2px; }
.oe-editor s, .oe-editor del { text-decoration: line-through; color: var(--oe-text-muted); }
.oe-editor code {
  background: rgba(0,0,0,0.06);
  color: #c2410c;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: var(--oe-font-mono);
  font-size: 0.875em;
}
.oe-editor pre {
  background: var(--oe-bg-code);
  color: var(--oe-text-code);
  border-radius: 10px;
  padding: 16px 20px;
  padding-top: 32px;
  font-family: var(--oe-font-mono);
  font-size: 0.875rem;
  overflow-x: auto;
  margin: 0.875rem 0;
  line-height: 1.6;
  position: relative;
}
.oe-editor pre code { background: transparent; color: inherit; padding: 0; border-radius: 0; }
/* Prevent highlight.js from overriding the <pre> background */
.oe-editor pre code.hljs { background: transparent; }

/* ── Code language badge ─────────────────────────────────────────────────── */
.oe-code-lang-badge {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 11px;
  font-family: var(--oe-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  font-weight: 500;
  color: rgba(255,255,255,0.35);
  background: transparent;
  cursor: pointer;
  user-select: none;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: color 120ms, border-color 120ms;
  line-height: 1.5;
  letter-spacing: 0.02em;
}
.oe-code-lang-badge:hover {
  color: rgba(255,255,255,0.7);
  border-color: rgba(255,255,255,0.2);
}

/* ── Code language picker ────────────────────────────────────────────────── */
.oe-code-lang-picker {
  position: fixed;
  z-index: 10000;
  background: var(--oe-bg, #ffffff);
  border: 1px solid var(--oe-border, #e7e5e4);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07);
  padding: 6px;
  min-width: 180px;
  max-height: 280px;
  display: flex;
  flex-direction: column;
  font-family: var(--oe-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}
.oe-code-lang-picker-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--oe-border, #e7e5e4);
  border-radius: 6px;
  padding: 6px 9px;
  font-size: 13px;
  font-family: inherit;
  background: var(--oe-bg, #fff);
  color: var(--oe-text, #1c1917);
  outline: none;
  margin-bottom: 4px;
  flex-shrink: 0;
}
.oe-code-lang-picker-input:focus {
  border-color: var(--oe-btn-active-bg, #1c1917);
}
.oe-code-lang-picker-list {
  overflow-y: auto;
  flex: 1;
}
.oe-code-lang-picker-item {
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--oe-text, #1c1917);
  font-family: var(--oe-font-mono, monospace);
  user-select: none;
  transition: background 80ms;
}
.oe-code-lang-picker-item:hover,
.oe-code-lang-picker-item.oe-active {
  background: var(--oe-btn-hover-bg, #f5f5f4);
}
.oe-code-lang-picker-item.oe-active {
  background: var(--oe-btn-active-bg, #1c1917);
  color: var(--oe-btn-active-fg, #ffffff);
}
.oe-editor blockquote {
  border-left: 4px solid var(--oe-blockquote-border);
  padding: 4px 0 4px 16px;
  margin: 0.875rem 0;
  color: var(--oe-text-muted);
  font-style: italic;
  background: rgba(0,0,0,0.02);
  border-radius: 0 6px 6px 0;
}
.oe-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.875rem 0; }
.oe-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.875rem 0; }
.oe-editor li { margin-bottom: 0.25rem; }
.oe-editor a { color: var(--oe-link-color); text-decoration: underline; text-underline-offset: 2px; }
.oe-editor mark { background: var(--oe-mark-bg); border-radius: 3px; padding: 0 3px; color: var(--oe-text); }
.oe-editor hr { border: none; border-top: 2px solid var(--oe-border); margin: 1.5rem 0; }
.oe-editor img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--oe-border); cursor: pointer; transition: box-shadow 0.15s; }
.oe-editor img:hover { box-shadow: 0 0 0 3px rgba(59,130,246,0.35); }
.oe-image-wrapper { margin: 0.875rem 0; display: block; }

/* ── Callout Blocks ─────────────────────────────────────────────────── */
.oe-editor .oe-callout {
  display: block;
  position: relative;
  padding: 12px 16px 12px 20px;
  margin: 0.875rem 0;
  border-left: 4px solid var(--oe-callout-border, #3b82f6);
  border-radius: 0 8px 8px 0;
  background: var(--oe-callout-bg, rgba(59,130,246,0.07));
  color: var(--oe-text);
  font-style: normal;
  line-height: 1.6;
}

/* Info */
.oe-editor .oe-callout-info {
  --oe-callout-border: #3b82f6;
  --oe-callout-bg: rgba(59,130,246,0.07);
  --oe-callout-icon-color: #3b82f6;
}
.oe-editor .oe-callout-info::before {
  content: 'ℹ';
  position: absolute;
  left: -1.45rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85em;
  color: var(--oe-callout-icon-color);
  line-height: 1;
}

/* Success */
.oe-editor .oe-callout-success {
  --oe-callout-border: #22c55e;
  --oe-callout-bg: rgba(34,197,94,0.07);
  --oe-callout-icon-color: #22c55e;
}
.oe-editor .oe-callout-success::before {
  content: '✓';
  position: absolute;
  left: -1.3rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85em;
  font-weight: 700;
  color: var(--oe-callout-icon-color);
  line-height: 1;
}

/* Warning */
.oe-editor .oe-callout-warning {
  --oe-callout-border: #f59e0b;
  --oe-callout-bg: rgba(245,158,11,0.07);
  --oe-callout-icon-color: #f59e0b;
}
.oe-editor .oe-callout-warning::before {
  content: '⚠';
  position: absolute;
  left: -1.45rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8em;
  color: var(--oe-callout-icon-color);
  line-height: 1;
}

/* Danger */
.oe-editor .oe-callout-danger {
  --oe-callout-border: #ef4444;
  --oe-callout-bg: rgba(239,68,68,0.07);
  --oe-callout-icon-color: #ef4444;
}
.oe-editor .oe-callout-danger::before {
  content: '✕';
  position: absolute;
  left: -1.3rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8em;
  font-weight: 700;
  color: var(--oe-callout-icon-color);
  line-height: 1;
}

/* Dark mode adjustments */
[data-oe-theme="dark"] .oe-editor .oe-callout-info,
.oe-container[data-oe-theme="dark"] .oe-editor .oe-callout-info {
  --oe-callout-bg: rgba(59,130,246,0.12);
}
[data-oe-theme="dark"] .oe-editor .oe-callout-success,
.oe-container[data-oe-theme="dark"] .oe-editor .oe-callout-success {
  --oe-callout-bg: rgba(34,197,94,0.12);
}
[data-oe-theme="dark"] .oe-editor .oe-callout-warning,
.oe-container[data-oe-theme="dark"] .oe-editor .oe-callout-warning {
  --oe-callout-bg: rgba(245,158,11,0.12);
}
[data-oe-theme="dark"] .oe-editor .oe-callout-danger,
.oe-container[data-oe-theme="dark"] .oe-editor .oe-callout-danger {
  --oe-callout-bg: rgba(239,68,68,0.12);
}
@media (prefers-color-scheme: dark) {
  [data-oe-theme="auto"] .oe-editor .oe-callout-info { --oe-callout-bg: rgba(59,130,246,0.12); }
  [data-oe-theme="auto"] .oe-editor .oe-callout-success { --oe-callout-bg: rgba(34,197,94,0.12); }
  [data-oe-theme="auto"] .oe-editor .oe-callout-warning { --oe-callout-bg: rgba(245,158,11,0.12); }
  [data-oe-theme="auto"] .oe-editor .oe-callout-danger { --oe-callout-bg: rgba(239,68,68,0.12); }
}

/* ── Template Tags (K13) ────────────────────────────────────────────── */
.oe-template-tag {
  display: inline-flex;
  align-items: center;
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 6px;
  padding: 0 6px;
  font-size: 0.8em;
  font-family: var(--oe-font-mono);
  font-weight: 500;
  cursor: default;
  user-select: none;
  white-space: nowrap;
  vertical-align: baseline;
  line-height: 1.6;
}
[data-oe-theme="dark"] .oe-template-tag {
  background: rgba(129, 140, 248, 0.15);
  color: #a5b4fc;
  border-color: rgba(129, 140, 248, 0.3);
}

/* ── HTML Source View ───────────────────────────────────────────────── */
.oe-html-source {
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.oe-html-textarea {
  flex: 1;
  min-height: 300px;
  padding: 28px 32px;
  background: var(--oe-bg-html);
  color: #a5f3fc;
  font-family: var(--oe-font-mono);
  font-size: 13px;
  line-height: 1.7;
  border: none;
  outline: none;
  resize: none;
  tab-size: 2;
  box-sizing: border-box;
}

/* ── Status bar ─────────────────────────────────────────────────────── */
.oe-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--oe-bg-statusbar);
  border-top: 1px solid var(--oe-border);
  border-radius: 0 0 var(--oe-radius) var(--oe-radius);
  font-size: 12px;
  color: var(--oe-text-muted);
  min-height: 38px;
  box-sizing: border-box;
}

.oe-statusbar-path {
  font-family: var(--oe-font-mono);
  font-size: 11px;
  color: var(--oe-text-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 40%;
}

.oe-statusbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.oe-word-count,
.oe-char-count {
  white-space: nowrap;
}

.oe-statusbar-divider {
  width: 1px;
  height: 14px;
  background: var(--oe-border);
}

.oe-html-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  background: none;
  border: none;
  color: var(--oe-text-muted);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--oe-font);
  font-weight: 500;
  transition: color 0.1s;
}

.oe-html-toggle:hover {
  color: var(--oe-text);
  text-decoration: underline;
}

.oe-html-toggle.oe-active {
  color: var(--oe-text);
}

/* ── Bubble toolbar ─────────────────────────────────────────────────── */
.oe-bubble-toolbar {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: var(--oe-text);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
  z-index: 9999;
  white-space: nowrap;
}

.oe-bubble-toolbar.oe-bubble-visible {
  opacity: 1;
  pointer-events: all;
}

.oe-bubble-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--oe-btn-active-fg);
  cursor: pointer;
  transition: background 0.1s;
}

.oe-bubble-btn:hover {
  background: rgba(255,255,255,0.15);
}

.oe-bubble-btn.oe-active {
  background: rgba(255,255,255,0.25);
}
`;
}
