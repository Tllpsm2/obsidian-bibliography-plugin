# Obsidian Bibliographies

> **Work in progress.** Things may break or change without notice.

A plugin to manage a shared bibliography database and insert references into notes using autocomplete.

## Usage

Type `@ref ` followed by your search term. Pick an existing entry from the list, or select *Add new* to create and insert it at the same time.

References are automatically added to the `bibliography` field in the note's frontmatter.

The ribbon icon (book) opens a manager where you can add, edit, and delete entries.

## Installation

### From source

```bash
git clone https://github.com/Tllpsm2/obsidian-bibliography-plugin
cd obsidian-bibliography-plugin
npm install
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` into your vault:

```
<your-vault>/.obsidian/plugins/obsidian-bibliography-plugin/
```

Then go to **Settings → Community plugins** and enable **Obsidian Bibliographies**.

## License

[MIT](LICENSE)
