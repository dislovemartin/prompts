# Markdown Tools

This directory contains tools for linting and checking markdown files in the project.

## Tools

### 1. Markdown Linting

The project uses [markdownlint](https://github.com/DavidAnson/markdownlint) to enforce consistent markdown styling. The configuration is defined in `.markdownlint.json`.

To run the linter:

```bash
npx markdownlint "**/*.md" --ignore node_modules/

```text

### 2. Markdown Link Checking

The project includes a custom script (`check-links.js`) to verify that all links in markdown files are valid.

To check for broken links:

```bash
node check-links.js
````text
### 3. Markdown Fixingg

The project includes a custom script (`fix-markdown.js`) to automatically fix common markdown linting issues.

To fix markdown issues:

```bash
node fix-markdown.j
`````tex
## Configurationon

### Markdownlint Configuration

The `.markdownlint.json` file contains the following configuration:

```json
{
  "default": true,
  "MD001": false,
  "MD012": false,
  "MD013": { "line_length": 500 },
  "MD022": false,
  "MD024": false,
  "MD029": false,
  "MD031": false,
  "MD032": false,
  "MD033": false,
  "MD041": false,
  "MD046": false
``````text
This configuration:

- Enforces most markdown rules by default
- Disables specific rules that are not relevant to this project
- Sets a generous line length limit of 500 characters

## Scripts

### check-links.js

This script:
- Recursively finds all markdown files in the project (excluding `node_modules`)
- Checks all links in each file
- Reports any broken links found

### fix-markdown.js

This script:
- Recursively finds all markdown files in the project (excluding `node_modules`)
- Fixes common markdown linting issues:
  - Adds language specifiers to code blocks
  - Removes trailing spaces
  - Ensures blank lines around headings
  - Ensures blank lines around code blocks
  - Ensures blank lines around lists
  - Fixes ordered list item prefixes
  - Ensures files end with a single newline
- Fixes broken links (e.g., localhost links)

## Dependencies

These tools require the following npm packages:

- `markdownlint-cli`
- `markdown-link-check`

Install them with:

```bash
npm install --save-dev markdownlint-cli markdown-link-ch
```

```
