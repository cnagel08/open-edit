# Contributing to Open-Edit

First off, thanks for considering contributing to Open-Edit! Every contribution helps make this editor better for everyone.

## How Can I Contribute?

### Reporting Bugs

Found a bug? Please open an [issue](https://github.com/cnagel08/open-edit/issues/new?template=bug_report.md) with:

- A clear title and description
- Steps to reproduce the behavior
- What you expected vs. what actually happened
- Browser and OS information
- A minimal code example or link to a reproduction if possible

### Suggesting Features

Have an idea? Open a [feature request](https://github.com/cnagel08/open-edit/issues/new?template=feature_request.md). We especially welcome ideas around:

- New plugins
- Accessibility improvements
- Framework integration examples (React, Vue, Svelte, Angular)
- Internationalization / localization

### Code Contributions

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/open-edit.git`
3. **Install** dependencies: `npm install`
4. **Create a branch**: `git checkout -b feature/my-awesome-feature`
5. **Make your changes** and test them
6. **Run the dev server**: `npm run dev` to verify everything works
7. **Commit** with a clear message: `git commit -m "Add: my awesome feature"`
8. **Push** to your fork: `git push origin feature/my-awesome-feature`
9. **Open a Pull Request** against `main`

### Documentation

Improvements to docs are always welcome — whether it's fixing a typo, adding an example, or improving clarity.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/cnagel08/open-edit.git
cd open-edit

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Code Style

- We use TypeScript — please type your code
- Keep dependencies at zero (this is a core principle of the project)
- Write clean, readable code with comments where the "why" isn't obvious
- Follow existing patterns in the codebase

## Commit Messages

We use a simple prefix convention:

- `Add:` for new features
- `Fix:` for bug fixes
- `Docs:` for documentation changes
- `Refactor:` for code refactoring
- `Test:` for test additions or changes

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Update the README if your change affects the public API
- Add a brief description of what your PR does and why
- Link related issues

## Questions?

Feel free to open a [discussion](https://github.com/cnagel08/open-edit/discussions) or an issue if you're unsure about anything. There are no stupid questions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
