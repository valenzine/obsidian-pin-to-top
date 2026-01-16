# Pin to Top

An Obsidian plugin that lets you pin folders and notes to the top of the file explorer for quick access.

## Features

- 📌 **Pin files and folders** to the top of the file explorer
- 🖱️ **Right-click context menu** - easily pin/unpin any item
- ⌨️ **Command palette** support for keyboard-driven workflows
- 💾 **Persistent pins** - your pins are saved and restored across sessions
- 🎨 **Visual indicators** - pinned items are clearly marked with a pin emoji
- 🔄 **Auto-updates** - pins automatically update when files are renamed or deleted

## Usage

### Pin an item

1. **Right-click** on any file or folder in the file explorer
2. Select **"Pin to top"** from the context menu
3. The item will appear at the top of the file explorer with a 📌 indicator

### Unpin an item

1. **Right-click** on a pinned item
2. Select **"Unpin from top"** from the context menu

### Command palette

You can also use the command palette (`Cmd/Ctrl + P`) to:

- **Pin current file** - pins the currently active file
- **Unpin current file** - unpins the currently active file
- **Toggle pin for current file** - toggles the pin state

### Settings

Go to **Settings → Community plugins → Pin to Top** to:

- View all pinned items
- Unpin individual items
- Clear all pins at once

## Installation

### From Obsidian Community Plugins

1. Open **Settings → Community plugins**
2. Disable **Safe mode**
3. Click **Browse** and search for "Pin to Top"
4. Click **Install**, then **Enable**

### Manual installation

1. Download `main.js`, `styles.css`, and `manifest.json` from the latest release
2. Create a folder: `<vault>/.obsidian/plugins/obsidian-pin-to-top/`
3. Copy the downloaded files into this folder
4. Reload Obsidian
5. Enable the plugin in **Settings → Community plugins**

## Development

```bash
# Clone the repository
git clone https://github.com/valenzine/obsidian-pin.git

# Install dependencies
npm install

# Start development build (watch mode)
npm run dev

# Production build
npm run build

# Lint code
npm run lint
```

### Testing locally

Copy `main.js`, `styles.css`, and `manifest.json` to:
```
<vault>/.obsidian/plugins/obsidian-pin-to-top/
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

If you find this plugin helpful, consider:
- ⭐ Starring the repository on GitHub
- 🐛 Reporting bugs or suggesting features via [Issues](https://github.com/valenzine/obsidian-pin/issues)
