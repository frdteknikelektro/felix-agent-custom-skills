# Releases

**List releases** (`gitlab.read`):

```bash
glab release list
glab release list --repo <namespace/project>
```

**View a release** (`gitlab.read`):

```bash
glab release view <tag>
glab release view <tag> --repo <namespace/project>
glab release view <tag> --web
```

**Download a release asset** (`gitlab.read`):

```bash
glab release download <tag>
glab release download <tag> --repo <namespace/project>
glab release download <tag> --asset-name "<name>"
glab release download <tag> --dir <output-dir>
```

**Create a release** (`gitlab.write`):

```bash
glab release create <tag>
glab release create <tag> --name "<title>"
glab release create <tag> --notes "<release-notes>"
glab release create <tag> --notes-file <path>
glab release create <tag> --ref <branch-or-commit>
glab release create <tag> --assets-links '[{"name":"asset","url":"https://..."}]'
```

**Upload assets to a release** (`gitlab.write`):

```bash
glab release upload <tag> <file1> <file2> ...
```

**Delete a release** (`gitlab.write`):

```bash
glab release delete <tag>
glab release delete <tag> --yes
```

This is destructive. Only run when the user explicitly asks.
