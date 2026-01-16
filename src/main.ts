import { Menu, Notice, Plugin, TAbstractFile, TFile, TFolder } from "obsidian";
import { DEFAULT_SETTINGS, PinSettingTab } from "./settings";
import type { PinPluginSettings } from "./types";
import { PinManager } from "./pin-manager";

export default class PinPlugin extends Plugin {
	settings: PinPluginSettings;
	pinManager: PinManager;

	async onload() {
		await this.loadSettings();

		// Initialize pin manager
		this.pinManager = new PinManager(this.app, this);

		// Clean up any deleted items on load
		await this.pinManager.cleanupDeletedItems();

		// Add settings tab
		this.addSettingTab(new PinSettingTab(this.app, this));

		// Register context menu for files
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu: Menu, file: TAbstractFile) => {
				if (file instanceof TFile || file instanceof TFolder) {
					const isPinned = this.pinManager.isPinned(file.path);

					menu.addItem((item) => {
						item
							.setTitle(isPinned ? "Unpin from top" : "Pin to top")
							.setIcon(isPinned ? "pin-off" : "pin")
							.onClick(async () => {
								await this.pinManager.togglePin(file.path);
								new Notice(
									isPinned
										? `Unpinned: ${file.name}`
										: `Pinned: ${file.name}`
								);
							});
					});
				}
			})
		);

		// Command: Pin current file
		this.addCommand({
			id: "pin-current-file",
			name: "Pin current file",
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file && !this.pinManager.isPinned(file.path)) {
					if (!checking) {
						void this.pinManager.pinItem(file.path);
						new Notice(`Pinned: ${file.name}`);
					}
					return true;
				}
				return false;
			},
		});

		// Command: Unpin current file
		this.addCommand({
			id: "unpin-current-file",
			name: "Unpin current file",
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file && this.pinManager.isPinned(file.path)) {
					if (!checking) {
						void this.pinManager.unpinItem(file.path);
						new Notice(`Unpinned: ${file.name}`);
					}
					return true;
				}
				return false;
			},
		});

		// Command: Toggle pin for current file
		this.addCommand({
			id: "toggle-pin-current-file",
			name: "Toggle pin for current file",
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file) {
					if (!checking) {
						const isPinned = this.pinManager.isPinned(file.path);
						void this.pinManager.togglePin(file.path);
						new Notice(
							isPinned
								? `Unpinned: ${file.name}`
								: `Pinned: ${file.name}`
						);
					}
					return true;
				}
				return false;
			},
		});

		// Handle file rename
		this.registerEvent(
			this.app.vault.on("rename", (file: TAbstractFile, oldPath: string) => {
				void this.pinManager.handleRename(file, oldPath);
			})
		);

		// Handle file delete
		this.registerEvent(
			this.app.vault.on("delete", (file: TAbstractFile) => {
				void this.pinManager.handleDelete(file);
			})
		);

		// Refresh file explorer on layout change
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				// Delay slightly to ensure DOM is ready
				setTimeout(() => {
					this.pinManager.refreshFileExplorer();
				}, 100);
			})
		);

		// Initial refresh after a short delay to ensure file explorer is loaded
		this.app.workspace.onLayoutReady(() => {
			setTimeout(() => {
				this.pinManager.refreshFileExplorer();
			}, 500);
		});
	}

	onunload() {
		// Clean up pinned containers from DOM
		const pinnedContainers = document.querySelectorAll(
			".pin-to-top-container"
		);
		pinnedContainers.forEach((container) => container.remove());

		// Remove pinned classes
		const pinnedItems = document.querySelectorAll(".pin-to-top-pinned");
		pinnedItems.forEach((item) => item.classList.remove("pin-to-top-pinned"));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		) as PinPluginSettings;
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
