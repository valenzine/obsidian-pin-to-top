import { App, Menu, TAbstractFile, TFile, TFolder, WorkspaceLeaf, setIcon } from "obsidian";
import type PinPlugin from "./main";

/**
 * CSS class name for pinned items
 */
const PINNED_CLASS = "pin-to-top-pinned";

/**
 * CSS class name for the pinned items container
 */
const PINNED_CONTAINER_CLASS = "pin-to-top-container";

/**
 * CSS class for pinned item wrapper
 */
const PINNED_ITEM_CLASS = "pin-to-top-item";

/**
 * Manages pinning functionality for files and folders in the file explorer
 */
export class PinManager {
	private app: App;
	private plugin: PinPlugin;

	constructor(app: App, plugin: PinPlugin) {
		this.app = app;
		this.plugin = plugin;
	}

	/**
	 * Check if an item is pinned
	 */
	isPinned(path: string): boolean {
		return this.plugin.settings.pinnedItems.includes(path);
	}

	/**
	 * Pin an item to the top
	 */
	async pinItem(path: string): Promise<void> {
		if (this.isPinned(path)) {
			return;
		}
		this.plugin.settings.pinnedItems.push(path);
		await this.plugin.saveSettings();
		this.refreshFileExplorer();
	}

	/**
	 * Unpin an item
	 */
	async unpinItem(path: string): Promise<void> {
		const index = this.plugin.settings.pinnedItems.indexOf(path);
		if (index === -1) {
			return;
		}
		this.plugin.settings.pinnedItems.splice(index, 1);
		await this.plugin.saveSettings();
		this.refreshFileExplorer();
	}

	/**
	 * Toggle pin state for an item
	 */
	async togglePin(path: string): Promise<void> {
		if (this.isPinned(path)) {
			await this.unpinItem(path);
		} else {
			await this.pinItem(path);
		}
	}

	/**
	 * Handle file/folder rename - update pinned path
	 */
	async handleRename(file: TAbstractFile, oldPath: string): Promise<void> {
		const index = this.plugin.settings.pinnedItems.indexOf(oldPath);
		if (index !== -1) {
			this.plugin.settings.pinnedItems[index] = file.path;
			await this.plugin.saveSettings();
			this.refreshFileExplorer();
		}
	}

	/**
	 * Handle file/folder delete - remove from pinned
	 */
	async handleDelete(file: TAbstractFile): Promise<void> {
		await this.unpinItem(file.path);
	}

	/**
	 * Get all file explorer leaves
	 */
	private getFileExplorerLeaves(): WorkspaceLeaf[] {
		return this.app.workspace.getLeavesOfType("file-explorer");
	}

	/**
	 * Refresh the file explorer to show pinned items at top
	 */
	refreshFileExplorer(): void {
		const leaves = this.getFileExplorerLeaves();

		for (const leaf of leaves) {
			this.reorderExplorerView(leaf);
		}
	}

	/**
	 * Reorder items in a specific file explorer view
	 */
	private reorderExplorerView(leaf: WorkspaceLeaf): void {
		const container = leaf.view.containerEl;
		const navFilesContainer = container.querySelector(
			".nav-files-container"
		);

		if (!navFilesContainer) {
			return;
		}

		// Remove existing pinned container if it exists
		const existingPinnedContainer = navFilesContainer.querySelector(
			`.${PINNED_CONTAINER_CLASS}`
		);
		if (existingPinnedContainer) {
			existingPinnedContainer.remove();
		}

		// Remove pinned class from all items
		const allPinnedItems = navFilesContainer.querySelectorAll(
			`.${PINNED_CLASS}`
		);
		allPinnedItems.forEach((item) => item.classList.remove(PINNED_CLASS));

		// Get all pinned items that exist
		const pinnedPaths = this.plugin.settings.pinnedItems.filter((path) => {
			const file = this.app.vault.getAbstractFileByPath(path);
			return file !== null;
		});

		if (pinnedPaths.length === 0) {
			return;
		}

		// Create pinned container
		const pinnedContainer = document.createElement("div");
		pinnedContainer.classList.add(PINNED_CONTAINER_CLASS);

		// Create pinned item elements (not clones - custom lightweight elements)
		for (const path of pinnedPaths) {
			const file = this.app.vault.getAbstractFileByPath(path);
			if (!file) continue;

			const pinnedItem = this.createPinnedItemElement(file);
			pinnedContainer.appendChild(pinnedItem);

			// Mark the original item as pinned (for styling)
			const originalItem = this.findItemByPath(navFilesContainer, path);
			if (originalItem) {
				originalItem.classList.add(PINNED_CLASS);
			}
		}

		// Insert pinned container at the top
		navFilesContainer.insertBefore(pinnedContainer, navFilesContainer.firstChild);
	}

	/**
	 * Create a lightweight pinned item element (not a clone)
	 */
	private createPinnedItemElement(file: TAbstractFile): HTMLElement {
		const isFolder = file instanceof TFolder;
		
		// Create wrapper
		const wrapper = document.createElement("div");
		wrapper.classList.add(PINNED_ITEM_CLASS);
		wrapper.classList.add(isFolder ? "nav-folder" : "nav-file");
		wrapper.setAttribute("data-path", file.path);
		wrapper.setAttribute("draggable", "true");

		// Create title element
		const titleEl = document.createElement("div");
		titleEl.classList.add(isFolder ? "nav-folder-title" : "nav-file-title");
		titleEl.setAttribute("data-path", file.path);

		// Add collapse icon for folders
		if (isFolder) {
			const collapseIcon = document.createElement("div");
			collapseIcon.classList.add("nav-folder-collapse-indicator", "collapse-icon");
			setIcon(collapseIcon, "right-triangle");
			titleEl.appendChild(collapseIcon);
		}

		// Add file/folder icon
		const iconEl = document.createElement("div");
		iconEl.classList.add(isFolder ? "nav-folder-title-content" : "nav-file-title-content");
		iconEl.textContent = file.name;
		titleEl.appendChild(iconEl);

		wrapper.appendChild(titleEl);

		// Add click handler
		titleEl.addEventListener("click", (evt: MouseEvent) => {
			evt.preventDefault();
			evt.stopPropagation();

			if (file instanceof TFile) {
				// Open the file
				void this.app.workspace.openLinkText(file.path, "", false);
			} else if (file instanceof TFolder) {
				// Scroll to and reveal the original folder in the file explorer
				this.revealInFileExplorer(file.path);
			}
		});

		// Add context menu handler with unpin option
		titleEl.addEventListener("contextmenu", (evt: MouseEvent) => {
			evt.preventDefault();
			evt.stopPropagation();

			const menu = new Menu();

			// Add unpin option at the top
			menu.addItem((item) => {
				item
					.setTitle("Unpin from top")
					.setIcon("pin-off")
					.onClick(async () => {
						await this.unpinItem(file.path);
					});
			});

			// Add separator
			menu.addSeparator();

			// Trigger the file menu to add default options
			this.app.workspace.trigger(
				"file-menu",
				menu,
				file,
				"file-explorer-context-menu",
				null
			);

			// Show menu at cursor position
			menu.showAtMouseEvent(evt);
		});

		// Add drag and drop handlers
		this.addDragDropHandlers(wrapper, file.path);

		return wrapper;
	}

	/**
	 * Add drag and drop handlers for reordering
	 */
	private addDragDropHandlers(element: HTMLElement, path: string): void {
		// Drag start
		element.addEventListener("dragstart", (evt: DragEvent) => {
			if (evt.dataTransfer) {
				evt.dataTransfer.effectAllowed = "move";
				evt.dataTransfer.setData("text/plain", path);
				element.classList.add("pin-dragging");
			}
		});

		// Drag end
		element.addEventListener("dragend", () => {
			element.classList.remove("pin-dragging");
			// Remove all drag-over classes
			document.querySelectorAll(".pin-drag-over").forEach((el) => {
				el.classList.remove("pin-drag-over");
			});
		});

		// Drag over
		element.addEventListener("dragover", (evt: DragEvent) => {
			evt.preventDefault();
			if (evt.dataTransfer) {
				evt.dataTransfer.dropEffect = "move";
			}
			element.classList.add("pin-drag-over");
		});

		// Drag leave
		element.addEventListener("dragleave", () => {
			element.classList.remove("pin-drag-over");
		});

		// Drop
		element.addEventListener("drop", (evt: DragEvent) => {
			evt.preventDefault();
			evt.stopPropagation();
			element.classList.remove("pin-drag-over");

			if (!evt.dataTransfer) return;

			const draggedPath = evt.dataTransfer.getData("text/plain");
			const targetPath = path;

			if (draggedPath === targetPath) return;

			// Reorder the pinned items
			void this.reorderPinnedItems(draggedPath, targetPath);
		});
	}

	/**
	 * Reorder pinned items by moving draggedPath before targetPath
	 */
	private async reorderPinnedItems(
		draggedPath: string,
		targetPath: string
	): Promise<void> {
		const items = this.plugin.settings.pinnedItems;
		const draggedIndex = items.indexOf(draggedPath);
		const targetIndex = items.indexOf(targetPath);

		if (draggedIndex === -1 || targetIndex === -1) return;

		// Remove dragged item
		items.splice(draggedIndex, 1);

		// Insert at new position
		const newTargetIndex = items.indexOf(targetPath);
		items.splice(newTargetIndex, 0, draggedPath);

		// Save and refresh
		await this.plugin.saveSettings();
		this.refreshFileExplorer();
	}

	/**
	 * Reveal and scroll to an item in the file explorer
	 */
	private revealInFileExplorer(path: string): void {
		const leaves = this.getFileExplorerLeaves();
		for (const leaf of leaves) {
			const fileExplorer = leaf.view as { revealInFolder?: (file: TAbstractFile) => void };
			const file = this.app.vault.getAbstractFileByPath(path);
			if (file && fileExplorer.revealInFolder) {
				fileExplorer.revealInFolder(file);
				return;
			}
		}
		
		// Fallback: try to find and click the original folder
		const originalItem = this.findOriginalItem(path);
		if (originalItem) {
			const titleEl = originalItem.querySelector(".nav-folder-title") as HTMLElement;
			if (titleEl) {
				titleEl.click();
				// Scroll into view
				originalItem.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	}

	/**
	 * Find an item in the file explorer by its path
	 */
	private findItemByPath(
		container: Element,
		path: string
	): HTMLElement | null {
		// Try to find by data-path attribute, excluding items in pinned container
		const items = container.querySelectorAll(
			`[data-path="${CSS.escape(path)}"]`
		);
		
		for (let i = 0; i < items.length; i++) {
			const item = items.item(i);
			if (!item) continue;
			// Skip items inside the pinned container
			if (item.closest(`.${PINNED_CONTAINER_CLASS}`)) {
				continue;
			}
			// Return the nav-file or nav-folder parent
			const navItem = item.closest(".nav-file, .nav-folder");
			if (navItem instanceof HTMLElement) {
				return navItem;
			}
		}
		return null;
	}

	/**
	 * Find the original (non-cloned) item in the file explorer
	 */
	private findOriginalItem(path: string): HTMLElement | null {
		const leaves = this.getFileExplorerLeaves();
		for (const leaf of leaves) {
			const container = leaf.view.containerEl;
			const navFilesContainer = container.querySelector(".nav-files-container");
			if (navFilesContainer) {
				const item = this.findItemByPath(navFilesContainer, path);
				if (item) {
					return item;
				}
			}
		}
		return null;
	}

	/**
	 * Clean up pinned items that no longer exist
	 */
	async cleanupDeletedItems(): Promise<void> {
		const validPaths = this.plugin.settings.pinnedItems.filter((path) => {
			return this.app.vault.getAbstractFileByPath(path) !== null;
		});

		if (validPaths.length !== this.plugin.settings.pinnedItems.length) {
			this.plugin.settings.pinnedItems = validPaths;
			await this.plugin.saveSettings();
		}
	}
}
