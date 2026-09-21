# Multi-Version Management Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `charity-app` into a multi-version workspace where versions live in `versions/<name>`, each containing its own code and `ARCHITECTURE.md`, with programmatic/CLI version switching and CI/CD build continuity.

**Architecture:** Move existing code into `versions/v1/`. Create a root symlink `current -> versions/v1` and `.active-version`. Implement `scripts/version-manager.js` to manage version switching, version creation, and delegating commands (`dev`, `build`, `test`) to the active version while syncing build outputs to root `./dist`.

**Tech Stack:** Node.js (v20+ ESM), npm, Vite, Vitest.

**Spec:** `projects/charity-app/docs/superpowers/specs/2026-09-21-multi-version-architecture-design.md`

## Global Constraints

- Must not break GitHub Pages deployment (`.github/workflows/deploy.yml` expecting `npm ci`, `npm test`, `npm run build`, and `./dist`).
- Current codebase in `projects/charity-app` must be fully preserved with exact architecture and functionality in `versions/v1/`.
- `scripts/version-manager.js` must have zero external npm dependencies (pure Node.js standard library).
- Symlink `current` and `.active-version` must remain strictly synchronized.

---

### Task 1: Migrate Existing Codebase into `versions/v1` & Establish Symlinks

**Files:**
- Create: `versions/v1/` (containing moved code and `ARCHITECTURE.md`)
- Create: `.active-version`
- Create: symlink `current -> versions/v1`

**Interfaces:**
- Produces: `versions/v1/`, `.active-version` (`"v1"`), `current` symlink.

- [ ] **Step 1: Create `versions/v1` and move application files**
```bash
mkdir -p versions/v1
# Move app source and config
mv src public index.html vite.config.ts vitest.config.ts tailwind.config.js postcss.config.js tsconfig.json tsconfig.node.json ARCHITECTURE.md package.json package-lock.json versions/v1/
```

- [ ] **Step 2: Move node_modules and dist if present**
```bash
if [ -d "node_modules" ]; then mv node_modules versions/v1/; fi
if [ -d "dist" ]; then mv dist versions/v1/; fi
```

- [ ] **Step 3: Create `.active-version` and `current` symlink**
```bash
echo "v1" > .active-version
ln -sfn versions/v1 current
```

- [ ] **Step 4: Verify symlink and version integrity**
```bash
test -f current/package.json && test -f current/ARCHITECTURE.md && echo "Integrity verified"
```

- [ ] **Step 5: Commit changes**
```bash
git add -A
git commit -m "refactor: migrate existing codebase to versions/v1 and initialize current symlink"
```

---

### Task 2: Implement and Test `scripts/version-manager.js`

**Files:**
- Create: `scripts/version-manager.js`
- Create: `scripts/version-manager.test.js`

**Interfaces:**
- Consumes: `.active-version`, `versions/`, `current` symlink.
- Produces: CLI interface supporting:
  - `list`: outputs available versions and highlights active.
  - `switch <version>`: validates target, writes `.active-version`, updates symlink `current`.
  - `create <version> [--from <base>]`: clones base version, copies `ARCHITECTURE.md`, strips ephemeral artifacts.
  - `run <cmd> [...args]`: runs npm script in active version, mirrors `dist` to `./dist` on build.

- [ ] **Step 1: Write tests for `version-manager.js`**
Write `scripts/version-manager.test.js` using Node's built-in `node:test` and `node:assert` runner.
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const SCRIPT = path.join(ROOT_DIR, 'scripts', 'version-manager.js');

test('version-manager list prints available versions and active version', () => {
  const output = execFileSync('node', [SCRIPT, 'list'], { cwd: ROOT_DIR, encoding: 'utf8' });
  assert.match(output, /Available versions:/);
  assert.match(output, /\* v1 \(active\)/);
});

test('version-manager create and switch workflow', () => {
  const testVer = 'test-v99';
  const testVerDir = path.join(ROOT_DIR, 'versions', testVer);
  try {
    // Create new version
    execFileSync('node', [SCRIPT, 'create', testVer, '--from', 'v1'], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.ok(fs.existsSync(testVerDir));
    assert.ok(fs.existsSync(path.join(testVerDir, 'ARCHITECTURE.md')));

    // Switch to new version
    execFileSync('node', [SCRIPT, 'switch', testVer], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.equal(fs.readFileSync(path.join(ROOT_DIR, '.active-version'), 'utf8').trim(), testVer);

    // Switch back to v1
    execFileSync('node', [SCRIPT, 'switch', 'v1'], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.equal(fs.readFileSync(path.join(ROOT_DIR, '.active-version'), 'utf8').trim(), 'v1');
  } finally {
    if (fs.existsSync(testVerDir)) {
      fs.rmSync(testVerDir, { recursive: true, force: true });
    }
    // Ensure active is v1
    execFileSync('node', [SCRIPT, 'switch', 'v1'], { cwd: ROOT_DIR, encoding: 'utf8' });
  }
});
```

- [ ] **Step 2: Run test to verify it fails before implementation**
Run: `node --test scripts/version-manager.test.js`
Expected: FAIL (cannot find `scripts/version-manager.js`)

- [ ] **Step 3: Implement `scripts/version-manager.js`**
Create `scripts/version-manager.js`:
```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const VERSIONS_DIR = path.join(ROOT_DIR, 'versions');
const ACTIVE_FILE = path.join(ROOT_DIR, '.active-version');
const CURRENT_LINK = path.join(ROOT_DIR, 'current');

function getActiveVersion() {
  if (fs.existsSync(ACTIVE_FILE)) {
    return fs.readFileSync(ACTIVE_FILE, 'utf8').trim();
  }
  return 'v1';
}

function listVersions() {
  if (!fs.existsSync(VERSIONS_DIR)) {
    console.log('No versions directory found.');
    return;
  }
  const active = getActiveVersion();
  const entries = fs.readdirSync(VERSIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  console.log('Available versions:');
  for (const ver of entries) {
    if (ver === active) {
      console.log(`  * ${ver} (active)`);
    } else {
      console.log(`    ${ver}`);
    }
  }
}

function switchVersion(targetVersion) {
  if (!targetVersion) {
    console.error('Error: Please specify target version. Example: version:switch v1');
    process.exit(1);
  }
  const targetDir = path.join(VERSIONS_DIR, targetVersion);
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    console.error(`Error: Version "${targetVersion}" does not exist in ${VERSIONS_DIR}`);
    process.exit(1);
  }

  fs.writeFileSync(ACTIVE_FILE, `${targetVersion}\n`, 'utf8');

  // Update symlink
  try {
    if (fs.existsSync(CURRENT_LINK) || fs.lstatSync(CURRENT_LINK).isSymbolicLink()) {
      fs.unlinkSync(CURRENT_LINK);
    }
  } catch {}

  const relTarget = path.join('versions', targetVersion);
  fs.symlinkSync(relTarget, CURRENT_LINK, 'dir');
  console.log(`Successfully switched active version to: ${targetVersion}`);
}

function createVersion(newVersion, baseVersion) {
  if (!newVersion) {
    console.error('Error: Please specify new version name. Example: version:create v2');
    process.exit(1);
  }
  const newDir = path.join(VERSIONS_DIR, newVersion);
  if (fs.existsSync(newDir)) {
    console.error(`Error: Version "${newVersion}" already exists.`);
    process.exit(1);
  }

  const base = baseVersion || getActiveVersion();
  const baseDir = path.join(VERSIONS_DIR, base);
  if (!fs.existsSync(baseDir)) {
    console.error(`Error: Base version "${base}" does not exist.`);
    process.exit(1);
  }

  fs.mkdirSync(newDir, { recursive: true });
  copyDirFiltered(baseDir, newDir);

  console.log(`Created new version "${newVersion}" based on "${base}".`);
  console.log(`To switch to it, run: npm run version:switch ${newVersion}`);
}

function copyDirFiltered(src, dest) {
  const ignore = new Set(['node_modules', 'dist', '.git']);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (ignore.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirFiltered(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function mirrorDist(activeDir) {
  const srcDist = path.join(activeDir, 'dist');
  const rootDist = path.join(ROOT_DIR, 'dist');
  if (fs.existsSync(srcDist)) {
    if (fs.existsSync(rootDist)) {
      fs.rmSync(rootDist, { recursive: true, force: true });
    }
    fs.cpSync(srcDist, rootDist, { recursive: true });
  }
}

function runCommand(cmd, args = []) {
  const active = getActiveVersion();
  const activeDir = path.join(VERSIONS_DIR, active);

  if (!fs.existsSync(activeDir)) {
    console.error(`Error: Active version directory "${activeDir}" does not exist.`);
    process.exit(1);
  }

  const res = spawnSync('npm', ['run', cmd, '--', ...args], {
    cwd: activeDir,
    stdio: 'inherit',
    shell: true,
  });

  if (cmd === 'build' && res.status === 0) {
    mirrorDist(activeDir);
  }

  process.exit(res.status ?? 0);
}

const [, , action, ...rest] = process.argv;

switch (action) {
  case 'list':
    listVersions();
    break;
  case 'switch':
    switchVersion(rest[0]);
    break;
  case 'create': {
    const fromIdx = rest.indexOf('--from');
    let base = null;
    let name = rest[0];
    if (fromIdx !== -1) {
      base = rest[fromIdx + 1];
      if (fromIdx === 0) name = rest[2];
    }
    createVersion(name, base);
    break;
  }
  case 'run':
    runCommand(rest[0], rest.slice(1));
    break;
  default:
    console.log(`
Usage:
  node scripts/version-manager.js list
  node scripts/version-manager.js switch <version>
  node scripts/version-manager.js create <version> [--from <base>]
  node scripts/version-manager.js run <cmd> [args...]
`);
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test scripts/version-manager.test.js`
Expected: PASS

- [ ] **Step 5: Commit changes**
```bash
git add scripts/version-manager.js scripts/version-manager.test.js
git commit -m "feat: implement version-manager CLI script and automated test"
```

---

### Task 3: Root Workspace Configuration & CI/CD Compatibility

**Files:**
- Create: `package.json` (at root of `projects/charity-app`)

**Interfaces:**
- Exposes:
  - `version:list` -> `node scripts/version-manager.js list`
  - `version:switch` -> `node scripts/version-manager.js switch`
  - `version:create` -> `node scripts/version-manager.js create`
  - `dev` -> `node scripts/version-manager.js run dev`
  - `build` -> `node scripts/version-manager.js run build`
  - `test` -> `node scripts/version-manager.js run test`
  - `preview` -> `node scripts/version-manager.js run preview`
  - `install:active` / `postinstall` -> ensures `current` dependencies can be installed.

- [ ] **Step 1: Create root `package.json`**
```json
{
  "name": "charity-app-workspace",
  "private": true,
  "type": "module",
  "scripts": {
    "version:list": "node scripts/version-manager.js list",
    "version:switch": "node scripts/version-manager.js switch",
    "version:create": "node scripts/version-manager.js create",
    "dev": "node scripts/version-manager.js run dev",
    "build": "node scripts/version-manager.js run build",
    "test": "node scripts/version-manager.js run test",
    "preview": "node scripts/version-manager.js run preview",
    "install:all": "node scripts/version-manager.js run-install"
  }
}
```

- [ ] **Step 2: Add `run-install` support to `version-manager.js` to handle `npm ci` / `npm install` for active version**
Update `version-manager.js` to handle `run-install` / CI install when root `npm install` is invoked.

- [ ] **Step 3: Test `npm run test` and `npm run build` from root**
```bash
npm run test
npm run build
```
Verify `./dist` exists at root and contains `index.html`.

- [ ] **Step 4: Commit root configuration**
```bash
git add package.json scripts/version-manager.js
git commit -m "feat: add root workspace scripts delegating to active version and CI dist mirroring"
```

---

### Task 4: End-to-End Verification

- [ ] **Step 1: Test `npm run version:list`**
Verify active version is marked with `* v1 (active)`.

- [ ] **Step 2: Test `npm run version:create v2`**
Verify `versions/v2` is created with its own `ARCHITECTURE.md` and source code.

- [ ] **Step 3: Test `npm run version:switch v2`**
Verify `current` points to `versions/v2` and `.active-version` contains `v2`.

- [ ] **Step 4: Test `npm run version:switch v1`**
Switch back to `v1`. Verify `current` points to `versions/v1`. Clean up test v2 if desired or retain as template.

- [ ] **Step 5: Run complete test suite and production build**
```bash
npm test
npm run build
```
Ensure 100% tests pass and build succeeds.

- [ ] **Step 6: Final commit**
```bash
git add -A
git commit -m "chore: complete multi-version setup verification"
```
