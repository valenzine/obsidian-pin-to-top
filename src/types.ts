import type { TAbstractFile } from "obsidian";

/**
 * Settings interface for the Pin to Top plugin
 */
export interface PinPluginSettings {
	/** Array of file/folder paths that are pinned */
	pinnedItems: string[];
	/** Automatically expand folders when clicking pinned folder items */
	autoExpandFolders: boolean;
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
};
