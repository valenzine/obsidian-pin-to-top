/**
 * Settings interface for the Pin to Top plugin
 */
export interface PinPluginSettings {
	/** Array of file/folder paths that are pinned */
	pinnedItems: string[];
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: PinPluginSettings = {
	pinnedItems: [],
};
