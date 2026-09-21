# Charity App (Lotus Grove Sanctuary)

A Zen Buddhist monastery charity web application featuring UTXO-style transparent donation fund tracking, verifiable expense receipts, and community prayer dedications.

## Multi-Version Architecture

This project uses a multi-version architecture managed by `scripts/version-manager.js`. Multiple versions of the application (complete with source code, configurations, dependencies, and `ARCHITECTURE.md`) reside side-by-side in `versions/`.

```text
projects/charity-app/
├── .active-version            # Current active version name (e.g., "v1")
├── current -> versions/v1     # Filesystem symlink pointing to active version directory
├── versions/
│   └── v1/                    # Active version 1 source code & tests
├── scripts/
│   ├── version-manager.js     # Version management script
│   └── version-manager.test.js# Automated tests for version manager
├── dist/                      # Mirrored build output from active version (for CI/CD)
└── package.json               # Root workspace script delegator
```

## Workspace Commands

All standard development commands are executed from the workspace root and automatically delegated to the active version:

### Version Management
- **List versions:**
  ```bash
  npm run version:list
  ```
- **Switch active version:**
  ```bash
  npm run version:switch <version>
  # Example: npm run version:switch v1
  ```
- **Create new version:**
  ```bash
  npm run version:create -- <new-version> [--from <base-version>]
  # or directly:
  node scripts/version-manager.js create <new-version> [--from <base-version>]
  ```

### Development & Build
- **Install dependencies:**
  ```bash
  npm install
  # or for CI environments:
  npm ci
  ```
  *Note: To add or remove packages from a specific version, run `npm install <pkg>` from within `current/` (or `versions/<ver>/`).*
- **Run development server:**
  ```bash
  npm run dev
  ```
- **Run tests:**
  ```bash
  npm test
  ```
- **Build for production:**
  ```bash
  npm run build
  ```
  *Note: Production build artifacts are generated in the active version's `dist/` directory and mirrored to root `./dist/` for GitHub Pages deployment compatibility.*
- **Preview production build:**
  ```bash
  npm run preview
  ```