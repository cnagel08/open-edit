# Contributing to OpenEdit

Thank you for your interest in contributing! This document outlines how to get started.

---

## Getting Started

```bash
git clone https://github.com/cnagel08/open-edit.git
cd open-edit
npm install
npm run dev         # build in watch mode
# open test.html in a browser to see live changes
```

---

## Development Workflow

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make changes** in `src/`. The watcher rebuilds `dist/` automatically.

3. **Test** your changes by opening `test.html` in a browser.

4. **Lint** before committing:
   ```bash
   npm run lint
   npm run build   # must succeed with no TypeScript errors
   ```

5. **Commit** using a descriptive message:
   ```
   feat: add table support
   fix: undo history lost after setHTML
   docs: improve plugin API examples
   ```

6. **Open a Pull Request** against `main`.

---

## Project Structure

```
src/
├── index.ts          # Public API & entry point
├── editor.ts         # Main Editor class
├── core/             # Internal model, history, commands, types
├── io/               # HTML & Markdown serialization
├── view/             # DOM rendering, toolbar, selection
└── plugins/          # Built-in plugins (highlight, emoji, ai, …)
```

---

## Adding a Plugin

See [README.md](../README.md#writing-a-custom-plugin) for the plugin interface.
Built-in plugins live in `src/plugins/`. Follow the existing structure.

---

## Coding Guidelines

- **TypeScript strict mode** — no `any` without a comment explaining why
- **Zero runtime dependencies** — keep the core dependency-free
- **Clean HTML output** — every serialization change must produce valid HTML5
- **Small PRs** — focused changes are easier to review

---

## Reporting Bugs

Please use the [Bug Report template](https://github.com/cnagel08/open-edit/issues/new?template=bug_report.md).

---

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).
