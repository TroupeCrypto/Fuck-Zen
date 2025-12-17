# Jarvis PR Bridge Setup Guide

This document explains how to configure and use the Jarvis PR Bridge automation system.

## Overview

The Jarvis PR Bridge allows automated PR creation via GitHub App authentication, eliminating the need for personal access tokens (PATs). The system reads a JSON plan file and executes branch creation, file operations, and PR opening.

## Prerequisites

You must have a GitHub App installed on the repository with the following permissions:
- **Contents**: Read & Write
- **Pull Requests**: Read & Write
- **Metadata**: Read

## Setup Instructions

### Step 1: Add GitHub Actions Secrets

Navigate to your repository settings and add the following secrets:

**Repository → Settings → Secrets and variables → Actions → New repository secret**

Add these three secrets:

1. **JARVIS_APP_ID**
   - Value: `2485887`
   - Description: The unique identifier for your GitHub App

2. **JARVIS_INSTALLATION_ID**
   - Value: `99935877`
   - Description: The installation ID for this repository

3. **JARVIS_APP_PRIVATE_KEY**
   - Value: Paste the **entire contents** of your `.pem` file
   - Description: The private key for GitHub App authentication
   - Format: Must include `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` headers

⚠️ **Important**: Never commit the PEM file or any secrets to the repository!

## How to Run the Workflow

### Method 1: Using the GitHub UI

1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. Select **"Jarvis PR Bridge"** from the workflows list
4. Click **"Run workflow"** button
5. (Optional) Specify a custom plan file path, or leave default: `tools/jarvis/change.json`
6. Click **"Run workflow"** to start

### Method 2: Using the GitHub CLI

```bash
gh workflow run jarvis-pr-bridge.yml
```

Or with a custom plan file:

```bash
gh workflow run jarvis-pr-bridge.yml -f plan_path=tools/jarvis/my-custom-plan.json
```

## Expected Result

After the workflow completes successfully:

1. A new branch will be created (e.g., `jarvis/test-pr-001`)
2. Files specified in the plan will be created/updated on that branch
3. A pull request will be opened from the new branch into `main`
4. The PR URL will be displayed in the workflow logs

For the default test plan, you should see:
- **Branch**: `jarvis/test-pr-001`
- **Target**: `main`
- **Files changed**: `docs/jarvis/PR_BRIDGE_TEST.md`

## Plan File Format

The plan file is a JSON document that describes what the bridge should do:

```json
{
  "owner": "TroupeCrypto",
  "repo": "Fuck-Zen",
  "base": "main",
  "branch": "jarvis/test-pr-001",
  "title": "PR Title",
  "body": "PR Description",
  "commits": [
    {
      "path": "path/to/file.md",
      "mode": "write",
      "content": "File content here...",
      "message": "Optional commit message"
    }
  ]
}
```

## Security & Safety Features

### Built-in Guardrails

The PR Bridge includes several safety features:

1. **Blocked Paths**: The following paths are blocked by default:
   - `.env*` files (environment variables)
   - Paths containing `secrets/` or `/secrets/` directories
   - `.github/workflows/**` (workflow files)
   - Note: Files with "secrets" in their name (like `secrets-guide.md`) are allowed; only paths with `secrets/` as a directory are blocked

2. **Mode Restrictions**: Only `mode: "write"` is currently allowed

3. **Path Normalization**: All paths are normalized to prevent directory traversal

4. **No Secret Logging**: The script never logs sensitive values (tokens, keys, etc.)

### Branch Protection

- Branch protection rules remain fully enforced
- PRs still require reviews if configured
- Status checks still apply
- No auto-merge capabilities

### Best Practices

✅ **DO:**
- Use the bridge for documentation and non-critical changes
- Review all generated PRs before merging
- Keep your PEM file secure and never commit it
- Test with the default plan first
- Use descriptive branch names (e.g., `jarvis/feature-name`)

❌ **DON'T:**
- Use for changes that bypass branch protection
- Commit secrets or sensitive data
- Modify workflow files via the bridge
- Share your PEM file or secrets

## Troubleshooting

### "Missing required secrets" error

Verify all three secrets are configured correctly in GitHub Actions settings.

### "Base branch not found" error

Check that the `base` field in your plan file matches an existing branch (usually `main`).

### "Blocked path" error

Your plan is trying to modify a protected path. Review the blocked paths list and adjust your plan.

### Authentication errors

Verify your GitHub App credentials are correct and the app has proper permissions on the repository.

## Local Testing (Optional)

You can test the script locally without running the GitHub Action:

```bash
# Set environment variables
export JARVIS_APP_ID=2485887
export JARVIS_INSTALLATION_ID=99935877
export JARVIS_APP_PRIVATE_KEY="$(cat /path/to/your/key.pem)"

# Run the script
node tools/jarvis/pr-bridge.js tools/jarvis/change.json
```

⚠️ **Warning**: Be careful when testing locally to avoid creating unintended PRs!

## Support

If you encounter issues:

1. Check the workflow logs in GitHub Actions
2. Review the plan file for syntax errors
3. Verify all secrets are configured correctly
4. Ensure the GitHub App has proper permissions

---

**Version**: 1.0.0  
**Last Updated**: December 2024
