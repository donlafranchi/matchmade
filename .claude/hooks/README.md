# Claude Hooks (Optional)

Automation triggers for Claude actions.

## Example in .claude/settings.json

```json
{
  "hooks": {
    "pre-commit": {
      "command": "npm run lint && npm test"
    }
  }
}
```

## Hook Points
- pre-commit - before commits
- post-commit - after commits

Only add if you need automation.
