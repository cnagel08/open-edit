# Third-Party Licenses

This project is licensed under the MIT License.

It uses third-party packages with permissive licenses (for example MIT, ISC, Apache-2.0, BSD-2-Clause, BSD-3-Clause). The exact dependency tree can change over time.

## Why this file exists

This file documents how to generate and review third-party license information for transparency and compliance.

## Generate current license reports

Run these commands from the project root:

```bash
npm run licenses:summary
npm run licenses:full
```

This creates:

- `THIRD_PARTY_LICENSES.csv` (full dependency/license report)

## Release checklist (recommended)

- Confirm your own project license is correct (`LICENSE`, `package.json`).
- Regenerate third-party report (`npm run licenses:full`).
- Review non-MIT entries (for example Apache/BSD/ISC) and keep their notices if required.
- Include `LICENSE` and, when applicable, third-party notice files in published artifacts.

## Notes

- This document is for engineering/compliance workflow and is not legal advice.
- If you distribute bundled code, validate notice obligations before release.
