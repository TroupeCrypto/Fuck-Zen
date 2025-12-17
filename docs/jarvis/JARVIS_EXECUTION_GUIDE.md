# Jarvis Execution Operator - User Guide

**Status:** Production Ready  
**Version:** 1.0.0  
**Last Updated:** December 17, 2025

---

## Overview

The Jarvis Execution Operator is a one-prompt automation system that enables you to request changes and have them automatically implemented, validated, and submitted as a pull request - all without manual intervention.

## How It Works

Jarvis follows this workflow:

1. **Generate Plan** - Creates a production plan JSON with deterministic naming
2. **Populate Plan** - Fills in all details based on your requested change
3. **Validate Security** - Ensures only allowed paths are touched (no `.github/workflows/**`, no secrets)
4. **Trigger Action** - Executes the Jarvis PR Bridge GitHub Action
5. **Open PR** - Creates a pull request into main with clear title and description

## Usage

### Quick Start

To use Jarvis, simply describe what you want:

```
Objective: [What you want to accomplish]

Requested change:
[Describe your desired change here]
```

### Example Requests

#### Example 1: Add Documentation
```
Objective: Add usage documentation

Requested change:
Create a new file docs/api/authentication.md that explains how to authenticate with the API using JWT tokens.
```

#### Example 2: Update Configuration
```
Objective: Update department structure

Requested change:
Add a new department entry for "ai-research" in departments/ai-research/README.md with description and contact info.
```

#### Example 3: Create Example Code
```
Objective: Add code examples

Requested change:
Create examples/hello-world.js that demonstrates basic API usage with comments.
```

## Constraints

### What Jarvis CAN Do

✅ Create or update documentation files  
✅ Add new department directories and READMEs  
✅ Create example code files  
✅ Update existing markdown files  
✅ Modify configuration files (except secrets)  
✅ Add new features to non-critical paths  

### What Jarvis CANNOT Do

❌ Modify `.github/workflows/**` files  
❌ Touch any files in secret directories  
❌ Modify `.env*` files  
❌ Bypass branch protection rules  
❌ Auto-merge pull requests  
❌ Access or modify secrets  

### Path Security

Blocked patterns:
- `^.env` (any .env file)
- `/secrets/` or `^secrets/` (secrets directories)
- `^.github/workflows/` (workflow files)

All other paths are allowed.

## Plan File Format

Jarvis generates JSON plans with this structure:

```json
{
  "owner": "TroupeCrypto",
  "repo": "Fuck-Zen",
  "base": "main",
  "branch": "jarvis/[descriptive-name]-[timestamp]",
  "title": "Jarvis: [What this change does]",
  "body": "Objective: [why]\nScope: [what files]\nRisk: [low/med/high]\nRollback: revert PR.",
  "commits": [
    {
      "path": "path/to/file.ext",
      "mode": "write",
      "content": "FULL FILE CONTENT HERE",
      "message": "Optional commit message"
    }
  ]
}
```

### Naming Convention

Plan files follow this deterministic pattern:
```
tools/jarvis/plans/PLAN-YYYY-MM-DD-HHMMSS.json
```

Example: `PLAN-2025-12-17-002708.json`

### Branch Naming

Branches follow this pattern:
```
jarvis/[feature-description]-YYYY-MM-DD
```

Example: `jarvis/add-api-docs-2025-12-17`

## Workflow Execution

### Automated Flow

1. **Plan Generation**
   - Jarvis reads your request
   - Generates timestamped plan file
   - Validates against security rules
   - Saves to `tools/jarvis/plans/`

2. **Action Trigger**
   - Commits the plan file
   - Triggers GitHub Action via workflow dispatch
   - Passes plan path as parameter

3. **PR Creation**
   - Action authenticates via GitHub App
   - Creates new branch from main
   - Applies all file changes
   - Opens pull request
   - Returns PR URL

4. **Review & Merge**
   - Review the automated PR
   - Verify changes match request
   - Merge when satisfied

### Manual Trigger (Optional)

You can also trigger manually:

```bash
# Via GitHub CLI
gh workflow run jarvis-pr-bridge.yml \
  -f plan_path=tools/jarvis/plans/PLAN-2025-12-17-002708.json

# Or via GitHub UI
# Actions → Jarvis PR Bridge → Run workflow → Enter plan path
```

## Best Practices

### DO

✅ **Be specific** - Clearly describe what you want changed  
✅ **Start small** - Test with documentation changes first  
✅ **Review PRs** - Always review automated PRs before merging  
✅ **Use descriptive names** - Make branch and file names meaningful  
✅ **Follow conventions** - Match existing code/doc styles  

### DON'T

❌ **Don't skip review** - Never auto-merge Jarvis PRs  
❌ **Don't bypass security** - Respect path restrictions  
❌ **Don't include secrets** - Never put credentials in plans  
❌ **Don't modify workflows** - Workflow changes need manual review  
❌ **Don't rush** - Take time to verify the changes  

## Troubleshooting

### Issue: Plan validation fails

**Solution:** Check that your requested changes don't touch blocked paths.

### Issue: GitHub Action doesn't trigger

**Solution:** Verify the plan file is committed and the workflow dispatch is called correctly.

### Issue: PR creation fails

**Solution:** Check GitHub Action logs for authentication or permission issues.

### Issue: Branch already exists

**Solution:** The workflow will use the existing branch. Delete it first if you want a fresh start.

## Examples

See `tools/jarvis/plans/examples/` for complete example plans:

- `example-add-docs.json` - Adding documentation
- `example-new-department.json` - Creating a new department
- `example-update-readme.json` - Updating existing files
- `example-code-sample.json` - Adding code examples

## Security

### GitHub App Authentication

Jarvis uses GitHub App credentials (not PATs):
- More secure than personal access tokens
- Scoped to specific permissions
- Auditable and revokable

### Secrets Required

- `JARVIS_APP_ID` - GitHub App ID
- `JARVIS_INSTALLATION_ID` - Installation ID for this repo
- `JARVIS_APP_PRIVATE_KEY` - App private key (PEM format)

See `docs/jarvis/PR_BRIDGE_SETUP.md` for setup instructions.

### Built-in Safeguards

1. **Path blocking** - Critical paths are protected
2. **Mode restrictions** - Only `write` mode allowed
3. **No auto-merge** - All PRs require review
4. **Branch protection** - All rules still apply
5. **Audit trail** - All changes tracked in Git

## Support

### Getting Help

If you encounter issues:

1. Check the plan file for syntax errors
2. Review GitHub Action logs
3. Verify security constraints are met
4. Consult `docs/jarvis/PR_BRIDGE_SETUP.md`
5. Check example plans in `tools/jarvis/plans/examples/`

### Common Questions

**Q: Can Jarvis make multiple changes in one PR?**  
A: Yes! Add multiple commits to the plan file.

**Q: Can I preview changes before creating the PR?**  
A: Review the plan file JSON to see exactly what will be changed.

**Q: What if I make a mistake?**  
A: Simply close the PR and create a new one with the corrected plan.

**Q: Can Jarvis update existing files?**  
A: Yes! The `write` mode handles both creation and updates.

**Q: Is this safe for production?**  
A: Yes, with proper review. Never auto-merge, always review PRs.

## Philosophy

Jarvis embodies the identity defined in `docs/jarvis/JARVIS_IDENTITY.md`:

- **Clarity over urgency** - Plans are explicit and reviewable
- **Continuity over bursts** - Changes are versioned and tracked
- **Survivability over novelty** - Security constraints protect the system
- **Sequencing over force** - Changes go through proper review flow

Jarvis is a tool for execution, not a replacement for judgment.

---

**Remember:** One prompt. Copilot does the rest. But you still review before merging.
