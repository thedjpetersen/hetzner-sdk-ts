# GitHub Actions Setup

This document describes the GitHub Actions workflows that need to be added manually to the repository.

## Why Manual Setup?

Due to GitHub App security restrictions, workflow files cannot be pushed automatically. They need to be added manually either through:
1. Direct push with appropriate permissions
2. GitHub web interface
3. A separate commit from a local environment with full permissions

## Workflow Files to Add

The workflow files are located in `.github/workflows/` directory:

### 1. `ci.yml` - Continuous Integration

**Location:** `.github/workflows/ci.yml`

**Triggers:**
- Push to main/master branches
- All pull requests (opened, synchronize, reopened)

**Features:**
- Tests across Node.js 18.x, 20.x, 22.x
- Test coverage generation and upload to Codecov
- TypeScript compilation checks
- Security audits
- Dependency checks
- Test result archiving (30-day retention)

### 2. `update-api.yml` - Automatic API Updates

**Location:** `.github/workflows/update-api.yml`

**Triggers:**
- Daily at midnight UTC (cron)
- Manual trigger (workflow_dispatch)

**Features:**
- Downloads latest Hetzner Cloud API spec
- Runs tests and builds
- Creates PR when spec changes
- Auto-assigns to repository owner

## How to Add Workflows

### Option 1: Git Command Line

```bash
git add .github/
git commit -m "ci: add GitHub Actions workflows"
git push
```

### Option 2: GitHub Web Interface

1. Go to your repository on GitHub
2. Navigate to `.github/workflows/`
3. Click "Add file" → "Create new file"
4. Copy the contents from the local `.github/workflows/` files
5. Commit directly to your branch

### Option 3: Manual Merge

After merging this PR, add the workflow files in a separate commit with the necessary permissions.

## Configuration Requirements

### Codecov (Optional)

If you want test coverage reporting to Codecov:
1. Sign up at https://codecov.io
2. Add your repository
3. Add `CODECOV_TOKEN` secret to your GitHub repository settings

### Workflow Permissions

Ensure GitHub Actions has the following permissions in your repository settings:
- Read and write permissions
- Allow GitHub Actions to create and approve pull requests

## Testing the Workflows

After adding the workflows:

1. **Test CI workflow:** Create a pull request - it should automatically run tests
2. **Test update-api workflow:** Go to Actions tab → "Update Hetzner Cloud API" → "Run workflow"

## Workflow Files Contents

The actual workflow files are in this branch at:
- `.github/workflows/ci.yml`
- `.github/workflows/update-api.yml`

You can view them locally or copy them from this branch.
