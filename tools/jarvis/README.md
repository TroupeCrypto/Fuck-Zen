# Jarvis - One-Prompt Execution Operator

**Status:** Production Ready  
**Version:** 1.0.0  
**Last Updated:** December 17, 2025

---

## What is Jarvis?

Jarvis is an AI-powered execution operator that turns natural language requests into pull requests. Describe what you want, and Jarvis handles the rest:

1. ✅ Generates a production plan
2. ✅ Validates security constraints
3. ✅ Creates a new branch
4. ✅ Applies all changes
5. ✅ Opens a pull request

**One prompt. Copilot does the rest.**

## Quick Start

### Step 1: Make a Request

Describe what you want changed:

```
Objective: Add API documentation

Requested change:
Create docs/api/authentication.md explaining JWT authentication flow.
```

### Step 2: Review the Plan

Jarvis generates a plan file in `tools/jarvis/plans/` with:
- Deterministic filename (timestamped)
- Complete file contents
- Security validation
- PR metadata

### Step 3: Trigger the Workflow

**Option A: Manual Trigger (Recommended for first use)**

```bash
./tools/jarvis/trigger-plan.sh tools/jarvis/plans/PLAN-2025-12-17-002708.json
```

**Option B: Via GitHub UI**

1. Go to [Actions → Jarvis PR Bridge](https://github.com/TroupeCrypto/Fuck-Zen/actions/workflows/jarvis-pr-bridge.yml)
2. Click "Run workflow"
3. Enter the plan path
4. Click "Run workflow" button

### Step 4: Review and Merge

The workflow creates a PR automatically. Review it, approve it, merge it.

## Documentation

- **[Execution Guide](../../docs/jarvis/JARVIS_EXECUTION_GUIDE.md)** - Complete user guide
- **[PR Bridge Setup](../../docs/jarvis/PR_BRIDGE_SETUP.md)** - Initial configuration
- **[Identity & Boundaries](../../docs/jarvis/JARVIS_IDENTITY.md)** - Philosophy and constraints
- **[Example Plans](plans/examples/README.md)** - Template plans for common tasks

## What Jarvis Can Do

✅ Create documentation files  
✅ Add code examples  
✅ Update existing files  
✅ Create new departments  
✅ Modify configuration (except secrets)  
✅ Add features to allowed paths  

## What Jarvis Cannot Do

❌ Modify `.github/workflows/` files  
❌ Access secret files or directories  
❌ Change `.env` files  
❌ Bypass branch protection  
❌ Auto-merge PRs  

## Security

Jarvis includes built-in safeguards:

- **Path blocking** - Critical files are protected
- **GitHub App auth** - More secure than PATs
- **No auto-merge** - All PRs require review
- **Audit trail** - All changes tracked in Git
- **Validation** - Plans validated before execution

## Example Plans

See `tools/jarvis/plans/examples/` for ready-to-use templates:

- `example-add-docs.json` - Documentation creation
- `example-new-department.json` - Department structure
- `example-update-readme.json` - File updates
- `example-code-sample.json` - Code examples

## File Structure

```
tools/jarvis/
├── README.md                    # This file
├── pr-bridge.js                 # Core automation script
├── change.json                  # Default test plan
├── trigger-plan.sh              # Helper script to trigger workflows
└── plans/
    ├── PLAN-2025-12-17-002708.json    # Production plan (timestamped)
    ├── PLAN-YYYY-MM-DD-HHMMSS.json    # Future plans...
    └── examples/
        ├── README.md
        ├── example-add-docs.json
        ├── example-new-department.json
        ├── example-update-readme.json
        └── example-code-sample.json
```

## Workflow Architecture

```
User Request
    ↓
Generate Plan JSON (timestamped)
    ↓
Validate Security Constraints
    ↓
Commit Plan to Repository
    ↓
Trigger GitHub Action (workflow_dispatch)
    ↓
GitHub Action Authenticates via App
    ↓
Create Branch from Main
    ↓
Apply File Changes (via GitHub API)
    ↓
Open Pull Request
    ↓
User Reviews & Merges
```

## Best Practices

### DO ✅

- Start with small, low-risk changes
- Review all automated PRs before merging
- Use descriptive branch and commit messages
- Test with examples first
- Follow existing code conventions

### DON'T ❌

- Auto-merge without review
- Bypass security constraints
- Include secrets in plans
- Modify workflow files via Jarvis
- Rush the review process

## Troubleshooting

### Plan file not found
**Solution:** Ensure the plan file is committed to the repository before triggering the workflow.

### Workflow fails with authentication error
**Solution:** Verify GitHub App secrets are configured correctly in repository settings.

### Blocked path error
**Solution:** Your plan is trying to modify a protected file. Review security constraints and adjust the plan.

### Branch already exists
**Solution:** Either delete the existing branch or use a different branch name in your plan.

## Philosophy

Jarvis embodies:

- **Clarity over urgency** - Plans are explicit and reviewable
- **Continuity over bursts** - Changes are versioned and tracked
- **Survivability over novelty** - Security first
- **Sequencing over force** - Proper review workflow

See [JARVIS_IDENTITY.md](../../docs/jarvis/JARVIS_IDENTITY.md) for complete philosophy.

## Support

### Need Help?

1. Check the [Execution Guide](../../docs/jarvis/JARVIS_EXECUTION_GUIDE.md)
2. Review [example plans](plans/examples/)
3. Verify [setup instructions](../../docs/jarvis/PR_BRIDGE_SETUP.md)
4. Check GitHub Action logs
5. Review plan file for errors

### Common Questions

**Q: Is this safe for production?**  
A: Yes, with proper review. All PRs require manual approval.

**Q: Can I make multiple changes in one PR?**  
A: Yes! Add multiple commits to the plan's `commits` array.

**Q: What if I make a mistake?**  
A: Close the PR and create a new one with a corrected plan.

**Q: Can Jarvis update existing files?**  
A: Yes! The `write` mode handles both creation and updates.

## Getting Started

Ready to use Jarvis? Follow these steps:

1. **Read the [Execution Guide](../../docs/jarvis/JARVIS_EXECUTION_GUIDE.md)**
2. **Review [example plans](plans/examples/)**
3. **Try the current production plan:**
   ```bash
   ./tools/jarvis/trigger-plan.sh tools/jarvis/plans/PLAN-2025-12-17-002708.json
   ```
4. **Review the resulting PR**
5. **Merge when satisfied**
6. **Create your own plans for future changes**

---

**Remember:** One prompt. Copilot does the rest. But you still review before merging.

**Jarvis is a tool for execution, not a replacement for judgment.**
