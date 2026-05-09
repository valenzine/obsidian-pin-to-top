import { App, PluginSettingTab, Setting } from "obsidian";
import type PinPlugin from "./main";

export { DEFAULT_SETTINGS, type PinPluginSettings } from "./types";

/**
 * Settings tab for the Pin to Top plugin
 */
export class PinSettingTab extends PluginSettingTab {
	plugin: PinPlugin;

	constructor(app: App, plugin: PinPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName("Pinned items").setHeading();

		// Auto-expand folders setting
		new Setting(containerEl)
			.setName("Auto-expand folders")
			.setDesc("Automatically expand folders when clicking pinned folder items")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoExpandFolders)
					.onChange(async (value) => {
						this.plugin.settings.autoExpandFolders = value;
						await this.plugin.saveSettings();
					})
			);

		// Pinned-top icon setting
		new Setting(containerEl)
			.setName("Show pin icon for pinned items")
			.setDesc("Display the pin icon before items pinned at the top of the file explorer.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showPinnedTopIcon)
					.onChange(async (value) => {
						this.plugin.settings.showPinnedTopIcon = value;
						await this.plugin.saveSettings();
						this.plugin.pinManager.refreshFileExplorer();
					})
			);

		// Main explorer icon setting
		new Setting(containerEl)
			.setName("Show pin icon for main explorer items")
			.setDesc("Display the pin icon after items in the main file explorer.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showMainExplorerPinIcon)
					.onChange(async (value) => {
						this.plugin.settings.showMainExplorerPinIcon = value;
						await this.plugin.saveSettings();
						this.plugin.pinManager.refreshFileExplorer();
					})
			);

		// Pinned header label setting
		new Setting(containerEl)
			.setName("Show pinned header label")
			.setDesc("Display the pinned header above pinned items at the top of the file explorer.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showPinnedHeaderLabel)
					.onChange(async (value) => {
						this.plugin.settings.showPinnedHeaderLabel = value;
						await this.plugin.saveSettings();
						this.plugin.pinManager.refreshFileExplorer();
					})
			);

		// Sticky pinned items setting
		new Setting(containerEl)
			.setName("Keep pinned items visible while scrolling")
			.setDesc("Keep the pinned section stuck to the top of the file explorer while you scroll.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.keepPinnedItemsVisible)
					.onChange(async (value) => {
						this.plugin.settings.keepPinnedItemsVisible = value;
						await this.plugin.saveSettings();
						this.plugin.pinManager.refreshFileExplorer();
					})
			);

		// Display pinned items count
		new Setting(containerEl)
			.setName("Pinned items")
			.setDesc(
				`You have ${this.plugin.settings.pinnedItems.length} pinned item(s).`
			);

		// List all pinned items with unpin buttons
		if (this.plugin.settings.pinnedItems.length > 0) {
			const pinnedListContainer = containerEl.createDiv({
				cls: "pin-to-top-settings-list",
			});

			for (const path of this.plugin.settings.pinnedItems) {
				const itemContainer = pinnedListContainer.createDiv({
					cls: "pin-to-top-settings-item",
				});

				// Display path
				const pathSpan = itemContainer.createSpan({
					cls: "pin-to-top-settings-path",
				});
				pathSpan.setText(path);

				// Unpin button
				const unpinButton = itemContainer.createEl("button", {
					text: "Unpin",
					cls: "pin-to-top-unpin-button",
				});
				unpinButton.addEventListener("click", () => {
					void this.plugin.pinManager.unpinItem(path).then(() => {
						this.display(); // Refresh the settings tab
					});
				});
			}
		}

		// Clear all button
		if (this.plugin.settings.pinnedItems.length > 0) {
			new Setting(containerEl)
				.setName("Clear all pins")
				.setDesc("Remove all pinned items at once.")
				.addButton((button) =>
					button
						.setButtonText("Clear all")
						.setWarning()
						.onClick(async () => {
							this.plugin.settings.pinnedItems = [];
							await this.plugin.saveSettings();
							this.plugin.pinManager.refreshFileExplorer();
							this.display();
						})
				);
		}
	}
}
