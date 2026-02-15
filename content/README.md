# How to Edit Your Website Content

All the text on your website is stored in simple text files in this `content/` folder. You can edit them directly on GitHub — no coding needed!

## How to edit a file on GitHub

1. Go to the `content/` folder on GitHub
2. Click the file you want to edit (e.g. `research.md`)
3. Click the pencil icon (top right) to edit
4. Make your changes
5. Click **Commit changes** at the bottom
6. Your site will update automatically within a few minutes

---

## Text Formatting

You can use these anywhere in your text:

| What you type | What it looks like |
|---|---|
| `**bold text**` | **bold text** |
| `*italic text*` | *italic text* |
| `[link text](https://example.com)` | [link text](https://example.com) |

Example:

```
I combine connectomics with [two-photon imaging](https://example.com)
to study *Drosophila* **neural circuits**.
```

---

## File Guide

### `research.md` — Research section

The first paragraph (before the first `---`) is the intro text. Each subsequent block has three parts:

1. **Tag** (e.g. "Current", "Previous") — first line, shown as a small label
2. **Title** — line starting with `# `
3. **Description** — remaining text

```
I study how sensory inputs drive behaviour.

---

Current
# My Research Project Title
Description of this research goes here. You can use
**bold**, *italic*, and [links](https://example.com).

---

Previous
# Another Project
Description of another project.
```

---

### `talks.md` — Talks & Posters section

Each entry has exactly 4 lines, separated by `---`:

1. **Type** — `Talk` or `Poster`
2. **Title** — the talk/poster title
3. **Venue** — conference or event name
4. **Date** — when and where

```
Talk
My Talk Title
Conference Name
June 2025, City, Country

---

Poster
My Poster Title
Another Conference
November 2024, City, Country
```

---

### `cv.md` — CV section

Sections start with `## Section Name`. Each entry within a section has:
- **Line 1**: Date range (use `--` for en-dash, e.g. `2024--present`)
- **Line 2**: Title (can include `[links](url)`)
- **Line 3**: Institution/location
- **Line 4** (optional): Additional detail

Entries are separated by blank lines.

```
## Education

2024--present
PhD, Biological Sciences
University of Cambridge
[Jefferis Lab](https://example.com). My PhD research topic.

2021--2024
MSc, Biological Sciences
University of Konstanz, Germany
My MSc research details.
```

---

### Publications

Publications load automatically from your Semantic Scholar profile — no editing needed! When a new paper is indexed by Semantic Scholar, it will appear on your website automatically.
