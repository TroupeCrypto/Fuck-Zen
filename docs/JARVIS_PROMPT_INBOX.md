# Jarvis Prompt Inbox Automation

## Overview

The Jarvis Prompt Inbox is an automated system that converts GitHub Issues into pull requests automatically. When a GitHub Issue is labeled with `jarvis:do`, the system picks it up, creates a plan, generates a PR, and reports back.

## How It Works

### 1. Issue Labeling
Users can create a GitHub Issue describing what they want implemented and add the `jarvis:do` label.

### 2. Scheduled Check
A GitHub Action runs every 15 minutes (can also be triggered manually) to check for new issues with the `jarvis:do` label.

### 3. Plan Generation
For each unprocessed issue, the system:
- Extracts the issue title and description
- Generates a Jarvis plan JSON file
- Commits the plan to the repository
- Stores the plan in `tools/jarvis/plans/PLAN-issue-{number}-{timestamp}.json`

### 4. PR Creation
The system then:
- Triggers the existing Jarvis PR Bridge workflow
- Waits for the PR to be created
- Comments back on the original issue with the PR link

### 5. Status Tracking
Issues are marked with the `jarvis:processing` label once a PR has been created, preventing duplicate processing.

## Workflow File

Location: `.github/workflows/jarvis-prompt-inbox.yml`

### Trigger Conditions
- **Schedule**: Every 15 minutes (`*/15 * * * *`)
- **Manual**: Via workflow_dispatch

### Required Secrets
The workflow requires the same secrets as the Jarvis PR Bridge:
- `JARVIS_APP_ID`
- `JARVIS_INSTALLATION_ID`
- `JARVIS_APP_PRIVATE_KEY`

## Usage

### Creating an Automated Request

1. **Create a GitHub Issue**
   - Go to the Issues tab
   - Click "New Issue"
   - Write a clear title and description

2. **Add the Label**
   - Add the `jarvis:do` label to the issue
   - The system will pick it up on the next scheduled run (within 15 minutes)

3. **Wait for Automation**
   - The bot will comment on your issue with:
     - The PR link
     - The plan file location
     - Status information

4. **Review the PR**
   - Check the generated PR
   - Review the changes
   - Merge when satisfied

### Issue Description Best Practices

Be clear and specific in your issue description:

**Good Example:**
```markdown
### Title: Add dark mode toggle to settings page

### Description:
Create a toggle button in the settings page that allows users to switch between light and dark themes. The preference should be saved to localStorage and applied on page load.

Files to modify:
- components/Settings.tsx
- app/globals.css

Requirements:
- Toggle button in settings
- localStorage persistence
- Apply theme on page load
```

**Bad Example:**
```markdown
### Title: Dark mode

### Description:
Add dark mode
```

## Plan File Format

The system generates a plan JSON file with the following structure:

```json
{
  "title": "Implement: {issue title}",
  "description": "Automated PR generated from issue #{number}",
  "branch": "jarvis/issue-{number}-{timestamp}",
  "changes": [
    {
      "type": "create",
      "path": "docs/automated/issue-{number}.md",
      "content": "# Implementation details..."
    }
  ]
}
```

## Workflow Steps

### 1. Find Issues
```yaml
- name: Find jarvis:do issues
  uses: actions/github-script@v7
```
Searches for open issues with the `jarvis:do` label that haven't been processed yet.

### 2. Process Each Issue
```yaml
- name: Process each issue
  uses: actions/github-script@v7
```
For each issue:
- Generates a plan file
- Commits it to the repository
- Triggers the PR bridge workflow
- Waits for PR creation
- Comments on the issue

### 3. Error Handling
If any step fails:
- An error comment is posted on the issue
- The workflow continues with the next issue
- Errors are logged to the Actions console

## Labels

### `jarvis:do`
**Purpose**: Marks an issue for automated processing
**Action**: System will create a PR for this issue

### `jarvis:processing`
**Purpose**: Indicates the issue has been processed
**Action**: Prevents duplicate processing
**Note**: Added automatically by the system

## Manual Workflow Trigger

You can manually trigger the workflow:

1. Go to Actions tab
2. Select "Jarvis Prompt Inbox"
3. Click "Run workflow"
4. Select the branch (usually `main`)
5. Click "Run workflow"

## Limitations

### Current Limitations
1. **Simple Plan Generation**: Currently creates a basic documentation file
2. **No Code Analysis**: Doesn't analyze existing code structure
3. **Fixed Format**: All generated PRs follow the same format
4. **Manual Review Required**: PRs must be reviewed and merged manually

### Future Enhancements
- Intelligent code analysis
- Context-aware file modifications
- Integration with AI for better plan generation
- Support for complex multi-file changes
- Automatic testing of generated changes
- Smart conflict resolution

## Monitoring

### Check Workflow Status
1. Go to Actions tab
2. Select "Jarvis Prompt Inbox"
3. View recent runs and their status

### Check Issue Status
1. Look for bot comments on your issue
2. Check for the `jarvis:processing` label
3. Follow the PR link provided in the comment

## Troubleshooting

### Issue not being processed
**Possible causes:**
- Label is misspelled (must be exactly `jarvis:do`)
- Issue already has `jarvis:processing` label
- Workflow hasn't run yet (wait up to 15 minutes)
- Check Actions tab for workflow errors

**Solutions:**
- Verify label name
- Check workflow logs
- Manually trigger the workflow

### Bot comment says "could not find PR"
**Possible causes:**
- PR Bridge workflow failed
- Timing issue (workflow checked too soon)
- Branch protection preventing PR creation

**Solutions:**
- Check PR Bridge workflow logs
- Wait and check again manually
- Verify repository settings

### Workflow fails with "secret not set"
**Possible causes:**
- Missing GitHub App credentials
- Secrets not configured in repository

**Solutions:**
- Contact repository administrator
- Verify secrets in Settings → Secrets and variables → Actions

## Security Considerations

### Secrets Management
- All GitHub App credentials are stored as repository secrets
- Secrets are never exposed in logs or comments
- Only authorized workflows can access secrets

### Permission Scope
The workflow has limited permissions:
- Read repository contents
- Write issues (for comments)
- Write pull requests (for PR creation)

### Input Validation
- Issue content is sanitized before processing
- File paths are validated to prevent directory traversal
- Branch names follow safe naming conventions

## Examples

### Example 1: Documentation Update
```markdown
### Issue Title: Update README with new features

### Description:
Add a section to README.md describing the new Jarvis overlay feature.

Include:
- Overview of features
- Usage instructions
- Screenshots (if available)
```

### Example 2: Bug Fix Request
```markdown
### Issue Title: Fix broken link in navigation

### Description:
The "Contact" link in the main navigation is pointing to the wrong URL.

Current: /contact-us
Expected: /contact

File: components/Navigation.tsx
Line: ~45
```

### Example 3: Feature Request
```markdown
### Issue Title: Add export functionality to reports

### Description:
Users should be able to export reports as PDF.

Requirements:
- Add "Export PDF" button to report view
- Generate PDF from report data
- Include charts and tables
- Download automatically

Suggested approach:
- Use jsPDF or similar library
- Add button to ReportView component
- Create PDF generation utility
```

## API Reference

### GitHub Actions Inputs

#### workflow_dispatch
No inputs required. Runs immediately when triggered.

### GitHub Actions Outputs

#### Workflow Run
- Creates plan file in repository
- Comments on issue with PR link
- Adds label to issue

### Environment Variables
- `JARVIS_APP_ID`: GitHub App ID
- `JARVIS_INSTALLATION_ID`: Installation ID for the repo
- `JARVIS_APP_PRIVATE_KEY`: Private key for authentication

## Contributing

### Extending the Workflow

To modify the plan generation logic:

1. Edit `.github/workflows/jarvis-prompt-inbox.yml`
2. Locate the `Process each issue` step
3. Modify the `plan` object creation
4. Test with a sample issue

### Adding New Features

Consider these areas for enhancement:
- Smarter plan generation using AI
- Support for different issue templates
- Integration with project boards
- Automated testing of generated code
- Multi-language support

## Changelog

### Version 1.0.0 (2025-12-17)
- Initial release
- Basic issue-to-PR automation
- Label-based triggering
- Comment notifications
- Error handling

## Support

For issues or questions:
1. Check this documentation first
2. Review workflow logs in Actions tab
3. Check existing issues for similar problems
4. Create a new issue (without the `jarvis:do` label!)
