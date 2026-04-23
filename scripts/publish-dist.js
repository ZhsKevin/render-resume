#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const args = process.argv.slice(2);
const remote = process.env.PUBLISH_REMOTE || 'origin';

function printUsage() {
  console.error('Usage: npm run publish:dist -- branch <branch-name>');
  console.error('Example: npm run publish:dist -- branch master');
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd || repoRoot,
    env: process.env,
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    const prettyCommand = [command, ...commandArgs].join(' ');
    throw new Error(`Command failed: ${prettyCommand}`);
  }
}

function runWithOutput(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd || repoRoot,
    env: process.env,
    encoding: 'utf8',
    shell: false,
  });

  if (result.status !== 0) {
    return '';
  }

  return result.stdout.trim();
}

function getPublishBranch() {
  if (args.length !== 2 || args[0] !== 'branch' || !args[1]) {
    printUsage();
    process.exit(1);
  }

  const branch = args[1].trim();

  if (!/^[A-Za-z0-9._/-]+$/.test(branch) || branch.startsWith('-') || branch.includes('..')) {
    throw new Error(`Invalid branch name: ${branch}`);
  }

  return branch;
}

function getSshRemoteUrl(remoteUrl) {
  if (remoteUrl.startsWith('git@') || remoteUrl.startsWith('ssh://')) {
    return remoteUrl;
  }

  const githubHttpsMatch = remoteUrl.match(/^https:\/\/github\.com\/(.+?)(?:\.git)?$/);

  if (githubHttpsMatch) {
    return `git@github.com:${githubHttpsMatch[1]}.git`;
  }

  throw new Error(`Remote must use SSH, or be a GitHub HTTPS URL that can be converted to SSH: ${remoteUrl}`);
}

function emptyDirectoryExceptGit(directory) {
  readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    if (entry.name === '.git') {
      return;
    }

    rmSync(join(directory, entry.name), {
      force: true,
      recursive: true,
    });
  });
}

function copyDirectoryContents(source, target) {
  readdirSync(source, { withFileTypes: true }).forEach((entry) => {
    cpSync(join(source, entry.name), join(target, entry.name), {
      recursive: true,
      force: true,
    });
  });
}

function ensureCommitIdentity(worktree) {
  const userName = runWithOutput('git', ['config', 'user.name'], { cwd: worktree });
  const userEmail = runWithOutput('git', ['config', 'user.email'], { cwd: worktree });

  if (!userName) {
    run('git', ['config', 'user.name', 'dist publisher'], { cwd: worktree });
  }

  if (!userEmail) {
    run('git', ['config', 'user.email', 'dist-publisher@example.local'], { cwd: worktree });
  }
}

function commitIfChanged(worktree, branch) {
  const status = runWithOutput('git', ['status', '--short'], { cwd: worktree });

  if (!status) {
    console.log(`No dist changes to publish on ${branch}.`);
    return false;
  }

  ensureCommitIdentity(worktree);
  run('git', ['add', '--all'], { cwd: worktree });
  run('git', ['commit', '-m', `publish dist to ${branch}`], { cwd: worktree });
  return true;
}

function main() {
  const branch = getPublishBranch();
  const distDir = resolve(repoRoot, 'dist');
  const remoteUrl = runWithOutput('git', ['remote', 'get-url', remote]);

  if (!remoteUrl) {
    throw new Error(`Git remote not found: ${remote}`);
  }

  const sshRemoteUrl = getSshRemoteUrl(remoteUrl);

  console.log(`Building dist from ${repoRoot}...`);
  run('npm', ['run', 'build']);

  if (!existsSync(distDir)) {
    throw new Error(`Build did not create dist directory: ${distDir}`);
  }

  const tempRoot = mkdtempSync(join(tmpdir(), 'publish-dist-'));
  const worktree = join(tempRoot, 'worktree');

  try {
    console.log(`Preparing ${remote}/${branch} in a temporary worktree through SSH...`);
    run('git', ['clone', '--origin', remote, '--branch', branch, '--single-branch', sshRemoteUrl, worktree]);

    emptyDirectoryExceptGit(worktree);
    copyDirectoryContents(distDir, worktree);

    if (commitIfChanged(worktree, branch)) {
      console.log(`Pushing dist to ${remote}/${branch}...`);
      run('git', ['push', remote, `HEAD:${branch}`], { cwd: worktree });
      console.log(`Published dist to ${remote}/${branch}.`);
    }
  } finally {
    console.log(`Removing temporary publish directory: ${tempRoot}`);
    rmSync(tempRoot, {
      force: true,
      recursive: true,
    });
  }
}

main();
