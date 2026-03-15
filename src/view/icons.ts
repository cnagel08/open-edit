// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — SVG Icon Library
// ─────────────────────────────────────────────────────────────────────────────

const SVG_ATTRS = `width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;

function svg(inner: string): string {
  return `<svg ${SVG_ATTRS}>${inner}</svg>`;
}

export const ICONS: Record<string, string> = {
  undo: svg(`<path d="M3 7h10a6 6 0 0 1 0 12H9"/><path d="M3 7l4-4M3 7l4 4"/>`),
  redo: svg(`<path d="M21 7H11a6 6 0 0 0 0 12h4"/><path d="M21 7l-4-4M21 7l-4 4"/>`),
  bold: svg(`<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>`),
  italic: svg(`<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>`),
  underline: svg(`<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/>`),
  strikethrough: svg(`<path d="M17.3 12H12m-6 0h3"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M7 7.5C7 5.6 9 4 12 4s5 1.6 5 3.5c0 .7-.3 1.4-.8 2"/><path d="M17 16.5C17 18.4 15 20 12 20s-5-1.6-5-3.5"/>`),
  code_inline: svg(`<polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>`),
  link: svg(`<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`),
  image: svg(`<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>`),
  blockquote: svg(`<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>`),
  hr: svg(`<line x1="5" y1="12" x2="19" y2="12"/>`),
  alignLeft: svg(`<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>`),
  alignCenter: svg(`<line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>`),
  alignRight: svg(`<line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>`),
  alignJustify: svg(`<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`),
  bulletList: svg(`<circle cx="4" cy="7" r="1.5" fill="currentColor"/><line x1="8" y1="7" x2="21" y2="7"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><line x1="8" y1="12" x2="21" y2="12"/><circle cx="4" cy="17" r="1.5" fill="currentColor"/><line x1="8" y1="17" x2="21" y2="17"/>`),
  orderedList: svg(`<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>`),
  htmlToggle: svg(`<path d="M10 9l-3 3 3 3"/><path d="M14 15l3-3-3-3"/><rect x="2" y="3" width="20" height="18" rx="2"/>`),
  maximize: svg(`<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>`),
  callout: svg(`<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`),
};
