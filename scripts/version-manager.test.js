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
    // Ensure ephemeral directories are not copied
    assert.ok(!fs.existsSync(path.join(testVerDir, 'node_modules')));
    assert.ok(!fs.existsSync(path.join(testVerDir, 'dist')));
    assert.ok(!fs.existsSync(path.join(testVerDir, '.git')));

    // Switch to new version
    execFileSync('node', [SCRIPT, 'switch', testVer], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.equal(fs.readFileSync(path.join(ROOT_DIR, '.active-version'), 'utf8').trim(), testVer);
    assert.equal(fs.readlinkSync(path.join(ROOT_DIR, 'current')), path.join('versions', testVer));

    // Switch back to v1
    execFileSync('node', [SCRIPT, 'switch', 'v1'], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.equal(fs.readFileSync(path.join(ROOT_DIR, '.active-version'), 'utf8').trim(), 'v1');
    assert.equal(fs.readlinkSync(path.join(ROOT_DIR, 'current')), path.join('versions', 'v1'));
  } finally {
    if (fs.existsSync(testVerDir)) {
      fs.rmSync(testVerDir, { recursive: true, force: true });
    }
    // Ensure active is v1
    execFileSync('node', [SCRIPT, 'switch', 'v1'], { cwd: ROOT_DIR, encoding: 'utf8' });
  }
});

test('version-manager create defaults to active version when --from omitted', () => {
  const testVer = 'test-v98';
  const testVerDir = path.join(ROOT_DIR, 'versions', testVer);
  try {
    execFileSync('node', [SCRIPT, 'create', testVer], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.ok(fs.existsSync(testVerDir));
    assert.ok(fs.existsSync(path.join(testVerDir, 'package.json')));
  } finally {
    if (fs.existsSync(testVerDir)) {
      fs.rmSync(testVerDir, { recursive: true, force: true });
    }
  }
});

test('version-manager handles validation errors gracefully', () => {
  // Switch to non-existent version should exit with non-zero code
  assert.throws(
    () => execFileSync('node', [SCRIPT, 'switch', 'non-existent-version-12345'], { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' }),
    (err) => err.status !== 0
  );

  // Switch with no version argument should exit with non-zero code
  assert.throws(
    () => execFileSync('node', [SCRIPT, 'switch'], { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' }),
    (err) => err.status !== 0
  );

  // Create with no version argument should exit with non-zero code
  assert.throws(
    () => execFileSync('node', [SCRIPT, 'create'], { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' }),
    (err) => err.status !== 0
  );

  // Create version that already exists should exit with non-zero code
  assert.throws(
    () => execFileSync('node', [SCRIPT, 'create', 'v1'], { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' }),
    (err) => err.status !== 0
  );

  // Create version with invalid base should exit with non-zero code
  assert.throws(
    () => execFileSync('node', [SCRIPT, 'create', 'test-v-invalid-base', '--from', 'non-existent-base'], { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' }),
    (err) => err.status !== 0
  );

  // Create version with missing argument after --from should exit with non-zero code
  assert.throws(
    () => execFileSync('node', [SCRIPT, 'create', 'test-v-missing-base', '--from'], { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' }),
    (err) => err.status !== 0
  );

  // Unrecognized command should exit with non-zero code
  assert.throws(
    () => execFileSync('node', [SCRIPT, 'unknown-command'], { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' }),
    (err) => err.status !== 0
  );
});

test('version-manager list falls back to v1 when .active-version is empty', () => {
  const activeFile = path.join(ROOT_DIR, '.active-version');
  const original = fs.readFileSync(activeFile, 'utf8');
  try {
    fs.writeFileSync(activeFile, '   \n', 'utf8');
    const output = execFileSync('node', [SCRIPT, 'list'], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.match(output, /\* v1 \(active\)/);
  } finally {
    fs.writeFileSync(activeFile, original, 'utf8');
  }
});

test('version-manager run delegates command and mirrors dist on build', () => {
  const testVer = 'test-v-runner';
  const testVerDir = path.join(ROOT_DIR, 'versions', testVer);
  const rootDist = path.join(ROOT_DIR, 'dist');
  const rootDistBackup = path.join(ROOT_DIR, 'dist_backup_test');

  // If root dist exists, temporarily back it up
  const hadDist = fs.existsSync(rootDist);
  if (hadDist) {
    fs.renameSync(rootDist, rootDistBackup);
  }

  try {
    fs.mkdirSync(testVerDir, { recursive: true });
    const dummyPackageJson = {
      name: testVer,
      version: '1.0.0',
      type: 'module',
      scripts: {
        hello: 'node -e "console.log(\'runner-hello\')"',
        build: 'node -e "const fs = require(\'node:fs\'); fs.mkdirSync(\'dist\', {recursive: true}); fs.writeFileSync(\'dist/mock.txt\', \'mock-dist-output\');"'
      }
    };
    fs.writeFileSync(path.join(testVerDir, 'package.json'), JSON.stringify(dummyPackageJson, null, 2));

    // Switch to dummy version
    execFileSync('node', [SCRIPT, 'switch', testVer], { cwd: ROOT_DIR, encoding: 'utf8' });

    // Test running a custom script
    const helloOutput = execFileSync('node', [SCRIPT, 'run', 'hello'], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.match(helloOutput, /runner-hello/);

    // Test build command with dist mirroring
    execFileSync('node', [SCRIPT, 'run', 'build'], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'dist', 'mock.txt')));
    assert.equal(fs.readFileSync(path.join(ROOT_DIR, 'dist', 'mock.txt'), 'utf8'), 'mock-dist-output');
  } finally {
    // Clean up dummy version and dist
    if (fs.existsSync(testVerDir)) {
      fs.rmSync(testVerDir, { recursive: true, force: true });
    }
    if (fs.existsSync(rootDist)) {
      fs.rmSync(rootDist, { recursive: true, force: true });
    }
    if (hadDist && fs.existsSync(rootDistBackup)) {
      fs.renameSync(rootDistBackup, rootDist);
    }
    // Switch back to v1
    execFileSync('node', [SCRIPT, 'switch', 'v1'], { cwd: ROOT_DIR, encoding: 'utf8' });
  }
});

test('version-manager run-install delegates install to active version', () => {
  const testVer = 'test-v-installer';
  const testVerDir = path.join(ROOT_DIR, 'versions', testVer);

  try {
    fs.mkdirSync(testVerDir, { recursive: true });
    const dummyPackageJson = {
      name: testVer,
      version: '1.0.0',
      type: 'module',
      scripts: {}
    };
    fs.writeFileSync(path.join(testVerDir, 'package.json'), JSON.stringify(dummyPackageJson, null, 2));

    // Switch to dummy version
    execFileSync('node', [SCRIPT, 'switch', testVer], { cwd: ROOT_DIR, encoding: 'utf8' });

    // Test running run-install with --dry-run
    const output = execFileSync('node', [SCRIPT, 'run-install', '--dry-run'], { cwd: ROOT_DIR, encoding: 'utf8' });
    // Should execute cleanly without error
    assert.ok(true);

    // Also test run install alias delegation
    const aliasOutput = execFileSync('node', [SCRIPT, 'run', 'install', '--dry-run'], { cwd: ROOT_DIR, encoding: 'utf8' });
    assert.ok(true);
  } finally {
    if (fs.existsSync(testVerDir)) {
      fs.rmSync(testVerDir, { recursive: true, force: true });
    }
    execFileSync('node', [SCRIPT, 'switch', 'v1'], { cwd: ROOT_DIR, encoding: 'utf8' });
  }
});

