import { App, PluginSettingTab, Setting } from "obsidian";
import BibliographyPlugin from "./main";

export interface BibliographySettings {
	bibliographies: string[];
}

export const DEFAULT_SETTINGS: BibliographySettings = {
	bibliographies: []
}

export class BibliographySettingTab extends PluginSettingTab {

	constructor(app: App, private plugin: BibliographyPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Saved bibliographies')
			.setDesc('Manage your global reference database. Enter one entry per line.')
			.addTextArea(text => {
				text.inputEl.setAttr('rows', 10);
				text.inputEl.addClass('bibliography-settings-textarea');

				text
					.setPlaceholder("Enter your references here, one per line")
					.setValue(this.plugin.settings.bibliographies.join("\n"))
					.onChange(async (value) => {
						this.plugin.settings.bibliographies = value
							.split("\n")
							.map(v => v.trim())
							.filter(Boolean);
						this.plugin.saveSettings().catch(err =>
							console.error("BibliographyPlugin: Failed to save settings.", err)
						);
					});
			});
	}
}