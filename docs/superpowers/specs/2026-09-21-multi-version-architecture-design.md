# Multi-Version Management Architecture Design

**Date:** 2026-09-21  
**Project:** `projects/charity-app`  
**Status:** Approved

---

## 1. Overview

This document specifies the multi-version structure and programmatic version management system for `charity-app`. It enables maintaining multiple versions of the application (complete with source code, configurations, dependencies, and corresponding `ARCHITECTURE.md` files) side-by-side inside a `versions/` folder, with simple programmatic and CLI switching capabilities.

---

## 2. Directory Layout & Architecture

```text
projects/charity-app/
├── .active-version            # Plaintext file containing active version name (e.g. "v1")
├── current -> versions/v1     # Filesystem symlink pointing to active version directory
├── versions/
│   ├── v1/                    # Preserved first version of the app
│   │   ├── ARCHITECTURE.md    # Version-specific technical architecture doc
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── index.html
│   │   ├── src/
│   │   └── public/
│   └── v2/                    # Subsequent versions created via version:create
│       ├── ARCHITECTURE.md
│       └── ...
├── scripts/
│   └── version-manager.js     # Native Node.js CLI & version management script
├── package.json               # Root workspace runner delegating to current/
├── .github/
│   └── workflows/
│       └── deploy.yml         # Unchanged GitHub Pages workflow expecting ./dist
└── dist/                      # Mirrored build output directory from active version
```

---

## 3. Migration Plan for Current Codebase

1. **Create `versions/v1/` Directory**:
   - Move all current application files (`src`, `public`, `index.html`, `vite.config.ts`, `vitest.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `tsconfig.node.json`, `ARCHITECTURE.md`, `package.json`, `package-lock.json`) into `versions/v1/`.
   - Any version-specific docs remain in `versions/v1/`.
2. **Establish Symlink & State**:
   - Create `.active-version` containing `v1`.
   - Create symlink `current -> versions/v1`.
3. **Setup Root Runner `package.json`**:
   - Configure root scripts (`dev`, `build`, `test`, `preview`, `version:list`, `version:switch`, `version:create`).

---

## 4. CLI Specifications (`scripts/version-manager.js`)

The `scripts/version-manager.js` script will be implemented as a zero-external-dependency Node.js script utilizing native `fs`, `path`, and `child_process` modules.

### Commands

1. **`list` (`npm run version:list`)**
   - Scans `versions/` directory.
   - Reads `.active-version` (and verifies `current` symlink target).
   - Formats output:
     ```text
     Available versions:
       * v1 (active)
         v2
     ```

2. **`switch <version>` (`npm run version:switch <target-version>`)**
   - Validates existence of `versions/<target-version>`.
   - Updates `.active-version`.
   - Recreates/updates symlink `current -> versions/<target-version>`.
   - Emits confirmation message: `Switched active version to <target-version>`.

3. **`create <new-version> [--from <base-version>]` (`npm run version:create <new-version>`)**
   - Validates that `<new-version>` does not already exist.
   - Copies files and `ARCHITECTURE.md` from `<base-version>` (defaults to current active version).
   - Omits transient artifacts (`node_modules`, `dist`, `.git`).
   - Updates `name` / `version` fields in the new version's `package.json` if appropriate.
   - Emits success confirmation with instructions on switching.

4. **`run <cmd> [args...]` (`npm run <dev|build|test|preview>`)**
   - Determines active version from `.active-version` or `current`.
   - Spawns `npm run <cmd>` with working directory set to `versions/<active-version>` (or `current`).
   - Inherits `stdio` (colors, interactive terminal input).
   - On `build`: mirrors/copies `current/dist` to root `./dist` to maintain compatibility with GitHub Pages deployment (`.github/workflows/deploy.yml`).

---

## 5. CI/CD & Build Integrity

- GitHub Pages workflow runs `npm ci`, `npm test`, `npm run build`, and publishes `./dist`.
- Root `package.json` will contain a simple `install` / `postinstall` helper or delegate so `npm ci` / `npm install` handles the active version dependencies.
- Root `npm run build` triggers the active version's build and copies the output to `./dist`.

---

## 6. Verification Plan

1. **List Check**: Execute `npm run version:list` and confirm `v1` is listed as active.
2. **Build Check**: Execute `npm run build` from root and verify `./dist` is created and matches active version build.
3. **Test Check**: Execute `npm run test` from root and verify tests pass in `versions/v1`.
4. **Create & Switch Check**:
   - Run `node scripts/version-manager.js create v2`.
   - Verify `versions/v2` contains its own `ARCHITECTURE.md` and source code.
   - Run `npm run version:switch v2` and confirm `current` symlink and `.active-version` point to `v2`.
   - Switch back to `v1` and confirm active state.
