# Document Commands

```bash
node skills/clickup/query.mjs <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `docs ["query"]` | Search/list docs in workspace (optional search query) |
| `doc <doc_id>` | Get doc details and page listing |
| `create-doc "title"` | Create a new doc (use `--content` for initial content) |
| `page <doc_id> <page_id>` | Get page content (markdown format) |
| `create-page <doc_id> "title"` | Add a new page to a doc (creates additional page) |
| `edit-page <doc_id> <page_id>` | Edit a page's content or name |

## Options

| Flag | Description |
|------|-------------|
| `--content`, `-c` | Page content for create-page/edit-page (markdown) |
| `--name`, `-n` | New page name for edit-page |

## Examples

### List/search docs

```bash
# List all docs in workspace
node skills/clickup/query.mjs docs

# Search docs by name
node skills/clickup/query.mjs docs "API"
```

### Get doc details

```bash
# Get doc info and page listing
node skills/clickup/query.mjs doc abc123def

# Using a doc URL
node skills/clickup/query.mjs doc "https://app.clickup.com/12345/v/dc/abc123def"
```

### Create a doc

```bash
# Create an empty doc
node skills/clickup/query.mjs create-doc "Project Notes"

# Create a doc with initial content (populates the first page)
node skills/clickup/query.mjs create-doc "API Documentation" --content "# API Documentation

This document covers the API endpoints and usage.

## Overview
..."
```

### Get page content

```bash
node skills/clickup/query.mjs page abc123def page456
```

### Create a page

```bash
# Create a page with just a title
node skills/clickup/query.mjs create-page abc123def "New Section"

# Create a page with content
node skills/clickup/query.mjs create-page abc123def "Getting Started" --content "# Welcome

This is the getting started guide.

## Prerequisites
- Node.js 18+
- npm or yarn"
```

### Edit a page

```bash
# Update page content
node skills/clickup/query.mjs edit-page abc123def page456 --content "Updated content here"

# Rename a page
node skills/clickup/query.mjs edit-page abc123def page456 --name "New Page Name"

# Update both content and name
node skills/clickup/query.mjs edit-page abc123def page456 --content "New content" --name "New Name"
```

## Doc page structure

When you create a doc via the API, ClickUp automatically creates an empty first page:

- **`create-doc`** — Creates a doc with an auto-generated first page. Use `--content` to populate that first page.
- **`create-page`** — Adds an *additional* page to a doc (second page, third page, etc.)
- **`edit-page`** — Modifies an existing page's content

To add content to a new doc, use `create-doc "Title" --content "..."` rather than creating the doc and then using `create-page` (which would leave the first page empty).
