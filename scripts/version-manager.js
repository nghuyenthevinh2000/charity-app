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
    const val = fs.readFileSync(ACTIVE_FILE, 'utf8').trim();
    return val || 'v1';
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

  const relTarget = path.join('versions', targetVersion);
  const tmpLink = path.join(ROOT_DIR, `.current_tmp_${process.pid}_${Date.now()}`);

  try {
    fs.symlinkSync(relTarget, tmpLink, 'dir');
    fs.renameSync(tmpLink, CURRENT_LINK);
  } catch {
    // Fallback for environments where renameSync does not atomically overwrite symlinks
    fs.rmSync(CURRENT_LINK, { recursive: true, force: true });
    fs.symlinkSync(relTarget, CURRENT_LINK, 'dir');
  } finally {
    if (fs.existsSync(tmpLink) || fs.lstatSync(tmpLink, { throwIfNoEntry: false })?.isSymbolicLink()) {
      fs.rmSync(tmpLink, { recursive: true, force: true });
    }
  }

  // Update .active-version only after symlink update succeeds
  fs.writeFileSync(ACTIVE_FILE, `${targetVersion}\n`, 'utf8');
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
  if (!cmd) {
    console.error('Error: Please specify command to run. Example: version-manager run build');
    process.exit(1);
  }

  const active = getActiveVersion();
  const activeDir = path.join(VERSIONS_DIR, active);

  if (!fs.existsSync(activeDir)) {
    console.error(`Error: Active version directory "${activeDir}" does not exist.`);
    process.exit(1);
  }

  if (cmd === 'install' || cmd === 'ci') {
    runInstall([cmd, ...args]);
    return;
  }

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const res = spawnSync(npmCmd, ['run', cmd, '--', ...args], {
    cwd: activeDir,
    stdio: 'inherit',
  });

  if (res.error) {
    console.error('Execution error:', res.error.message || res.error);
    process.exit(1);
  }

  if (cmd === 'build' && res.status === 0) {
    mirrorDist(activeDir);
  }

  const exitCode = res.status !== null ? res.status : (res.signal ? 1 : 0);
  process.exit(exitCode);
}

function runInstall(args = []) {
  const active = getActiveVersion();
  const activeDir = path.join(VERSIONS_DIR, active);

  if (!fs.existsSync(activeDir)) {
    console.error(`Error: Active version directory "${activeDir}" does not exist.`);
    process.exit(1);
  }

  let subCmd = 'install';
  let npmArgs = [...args];

  if (args[0] === 'ci') {
    subCmd = 'ci';
    npmArgs = args.slice(1);
  } else if (args[0] === 'install' || args[0] === 'i') {
    subCmd = 'install';
    npmArgs = args.slice(1);
  } else if (process.env.npm_command === 'ci') {
    subCmd = fs.existsSync(path.join(activeDir, 'package-lock.json')) ? 'ci' : 'install';
  } else if (process.env.npm_command === 'install' || process.env.npm_command === 'i') {
    subCmd = 'install';
  } else if (process.env.CI && fs.existsSync(path.join(activeDir, 'package-lock.json'))) {
    subCmd = 'ci';
  }

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const res = spawnSync(npmCmd, [subCmd, ...npmArgs], {
    cwd: activeDir,
    stdio: 'inherit',
  });

  if (res.error) {
    console.error('Execution error during install:', res.error.message || res.error);
    process.exit(1);
  }

  const exitCode = res.status !== null ? res.status : (res.signal ? 1 : 0);
  process.exit(exitCode);
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
      if (!base) {
        console.error('Error: Please specify base version after --from. Example: version:create v2 --from v1');
        process.exit(1);
      }
      if (fromIdx === 0) name = rest[2];
    }
    createVersion(name, base);
    break;
  }
  case 'run':
    runCommand(rest[0], rest.slice(1));
    break;
  case 'run-install':
    runInstall(rest);
    break;
  default:
    console.error(`
Usage:
  node scripts/version-manager.js list
  node scripts/version-manager.js switch <version>
  node scripts/version-manager.js create <version> [--from <base>]
  node scripts/version-manager.js run <cmd> [args...]
  node scripts/version-manager.js run-install [args...]
`);
    process.exit(1);
}

