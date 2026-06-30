# Releases

**List releases** (`github.read`):

```bash
gh release list
gh release list --repo [owner/repo]
gh release list --limit 20
gh release list --exclude-drafts
gh release list --exclude-pre-releases
```

**View a release** (`github.read`):

```bash
gh release view <tag>
gh release view <tag> --repo [owner/repo]
gh release view <tag> --json name,tagName,body,publishedAt,assets
gh release view <tag> --web
```

**Download a release asset** (`github.read`):

```bash
gh release download <tag>
gh release download <tag> --repo [owner/repo]
gh release download <tag> --pattern "<glob>"
gh release download <tag> --dir <output-dir>
gh release download <tag> --archive zip
```

**Create a release** (`github.write`):

```bash
gh release create <tag>
gh release create <tag> --title "<title>"
gh release create <tag> --notes "<release-notes>"
gh release create <tag> --notes-file <path>
gh release create <tag> --target <branch>
gh release create <tag> --draft
gh release create <tag> --prerelease
gh release create <tag> <file1> <file2> ...
```

**Upload assets to a release** (`github.write`):

```bash
gh release upload <tag> <file1> <file2> ...
gh release upload <tag> <file> --repo [owner/repo]
```

**Delete a release** (`github.write`):

```bash
gh release delete <tag>
gh release delete <tag> --yes
```

This is destructive. Only run when the user explicitly asks.
