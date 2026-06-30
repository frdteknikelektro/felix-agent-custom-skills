# Repositories

**List repositories** (`gitlab.read`):

```bash
glab repo list
glab repo list --all
glab repo list --page 1 --per-page 50
glab repo list --owned
glab repo list --starred
glab repo list --search <keyword>
glab repo list --group <group-path>
```

**View a repository** (`gitlab.read`):

```bash
glab repo view <namespace/project>
glab repo view <namespace/project> --web
glab repo view <namespace/project> --output json
```

**Clone a repository** (`gitlab.write`):

```bash
glab repo clone <namespace/project>
glab repo clone <namespace/project> --dir <target-dir>
```

**Create a repository** (`gitlab.write`):

```bash
glab repo create
glab repo create --name <name>
glab repo create --name <name> --description "<desc>"
glab repo create --name <name> --public
glab repo create --name <name> --internal
glab repo create --name <name> --private
glab repo create --name <name> --group <group-path>
```

**Fork a repository** (`gitlab.write`):

```bash
glab repo fork <namespace/project>
glab repo fork <namespace/project> --clone
glab repo fork <namespace/project> --remote
```

**Archive a repository** (`gitlab.write`):

```bash
glab repo archive <namespace/project>
```

**Delete a repository** (`gitlab.write`):

```bash
glab repo delete <namespace/project> --yes
```

This is destructive. Only run when the user explicitly asks.
