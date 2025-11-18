# GitHub Configuration

This directory contains GitHub Actions workflows and other GitHub-specific configuration.

## Workflow Files

The workflow files in `workflows/` directory need to be added manually due to GitHub App permission restrictions.

See `GITHUB_ACTIONS_SETUP.md` in the root directory for detailed instructions on how to add these workflows.

## Available Workflows

- **ci.yml** - Continuous Integration (runs on all PRs)
- **update-api.yml** - Automatic API updates (runs daily)

## Adding Workflows

```bash
git add .github/workflows/
git commit -m "ci: add GitHub Actions workflows"
git push
```

Or use the GitHub web interface to add the files manually.
