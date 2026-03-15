# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-03-14

Initial public release.

### Added

**Core Editor**
- ContentEditable core with internal document model
- Text formatting: Bold, Italic, Underline, Strikethrough, Inline Code
- Block elements: Paragraphs, Headings H1–H6, Ordered/Unordered lists, Blockquote, Code block, Horizontal rule
- Text alignment: left, center, right, justify
- Links: insert, edit, remove
- Images with drag-to-resize handles
- Image upload hook (`onImageUpload`)
- Undo / Redo with custom history tracking (50-step limit)
- Placeholder text support

**Toolbar**
- Main configurable toolbar
- Floating bubble toolbar on text selection
- HTML source view toggle
- Status bar with word and character count

**I/O**
- HTML import (`setHTML`) and export (`getHTML`) — clean semantic HTML5
- Markdown import (`setMarkdown`) and export (`getMarkdown`)
- Smart clipboard paste: detects URLs and Markdown

**Plugins**
- `highlight` — syntax highlighting for code blocks (via highlight.js)
- `emoji` — emoji picker toolbar integration
- `templateTags` — highlight and manage `{{variable}}` placeholders
- `ai` — AI writing assistant powered by Claude (Anthropic)

**Theming**
- Light / Dark / Auto theme via CSS custom properties

**Build**
- ESM, CommonJS, and UMD builds
- Full TypeScript declarations (`.d.ts`)
- Zero runtime dependencies

---

[0.1.0]: https://github.com/cnagel08/open-edit/releases/tag/v0.1.0
