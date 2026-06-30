# Variables

**List variables** (`gitlab.read`):

```bash
glab variable list
glab variable list --repo <namespace/project>
glab variable list --group <group-path>
```

**Set a variable** (`gitlab.write`):

```bash
glab variable set <key>
glab variable set <key> --repo <namespace/project>
glab variable set <key> --group <group-path>
glab variable set <key> --value "<value>"
glab variable set <key> --masked
glab variable set <key> --protected
glab variable set <key> --scope "production"
```

Never print variable values in replies. Refer to them by key name only.

**Delete a variable** (`gitlab.write`):

```bash
glab variable delete <key>
glab variable delete <key> --repo <namespace/project> --yes
glab variable delete <key> --group <group-path> --yes
```

This is destructive. Only run when the user explicitly asks.
