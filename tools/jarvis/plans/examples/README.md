# Jarvis Plan Examples

This directory contains example plan files that demonstrate various use cases for the Jarvis execution operator.

## Available Examples

### `example-add-docs.json`
Demonstrates creating new API documentation.
- **Use case:** Adding documentation files
- **Risk:** Low
- **Files affected:** 1

### `example-new-department.json`
Demonstrates creating a new department directory with README.
- **Use case:** Organizational structure expansion
- **Risk:** Low
- **Files affected:** 1

### `example-update-readme.json`
Demonstrates updating or creating contributing guidelines.
- **Use case:** Documentation updates
- **Risk:** Low
- **Files affected:** 1

### `example-code-sample.json`
Demonstrates adding example code for developers.
- **Use case:** Educational code examples
- **Risk:** Low
- **Files affected:** 1

## Using Examples

To test an example:

1. Copy the example file to the parent directory:
   ```bash
   cp tools/jarvis/plans/examples/example-add-docs.json tools/jarvis/plans/test-plan.json
   ```

2. Customize the plan as needed:
   - Update branch name
   - Modify content
   - Adjust commit messages

3. Trigger the workflow:
   ```bash
   gh workflow run jarvis-pr-bridge.yml -f plan_path=tools/jarvis/plans/test-plan.json
   ```

## Creating Your Own Plans

Use these examples as templates:

1. Copy an example that matches your use case
2. Update the `branch`, `title`, and `body` fields
3. Modify the `commits` array with your changes
4. Ensure all paths are allowed (see security constraints)
5. Save with a deterministic name: `PLAN-YYYY-MM-DD-HHMMSS.json`

## Security Notes

All examples follow security best practices:
- ✅ No workflow file modifications
- ✅ No secret file access
- ✅ No .env file changes
- ✅ All paths are validated

## Need Help?

See `docs/jarvis/JARVIS_EXECUTION_GUIDE.md` for comprehensive documentation.
