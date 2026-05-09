import type { TAbstractFile } from "obsidian";

/**
 * Settings interface for the Pin to Top plugin
 */
export interface PinPluginSettings {
	/** Array of file/folder paths that are pinned */
	pinnedItems: string[];
	/** Automatically expand folders when clicking pinned folder items */
	autoExpandFolders: boolean;
	/** Show the pin icon before items pinned at the top */
	showPinnedTopIcon: boolean;
	/** Show the pin icon after items in the main explorer */
	showMainExplorerPinIcon: boolean;
	/** Show the "Pinned" label in the pinned header */
	showPinnedHeaderLabel: boolean;
	/** Keep pinned items visible at the top while scrolling */
	keepPinnedItemsVisible: boolean;
}

/**
 * File Explorer view interface for type-safe access to Obsidian's file explorer
 */
export interface FileExplorerView {
	revealInFolder?: (file: TAbstractFile) => void;
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: PinPluginSettings = {
	pinnedItems: [],
	autoExpandFolders: true,
	showPinnedTopIcon: true,
	showMainExplorerPinIcon: true,
	showPinnedHeaderLabel: true,
	keepPinnedItemsVisible: false,
};
