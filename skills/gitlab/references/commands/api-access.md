# API Access

**Read** (`gitlab.read`):

```bash
glab api projects/<namespace>%2F<project>
glab api projects/<namespace>%2F<project>/issues --jq '.[].title'
glab api search --field scope=projects --field search="<query>"
```

**Write** (`gitlab.write`):

```bash
glab api projects/<namespace>%2F<project>/repository/branches -X POST -F branch=<name> -F ref=<ref>
```

Note: In GitLab API paths, the project namespace uses `%2F` as the separator (e.g., `group%2Fproject`).
