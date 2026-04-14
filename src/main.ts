import { Plugin, TFile } from 'obsidian';
import { BibliographySettings, DEFAULT_SETTINGS, BibliographySettingTab } from "./settings";
import { ReferenceSuggest } from "./ReferenceSuggest";
import { BibliographyModal } from "./BibliographyModal";

export default class BibliographyPlugin extends Plugin {
	settings: BibliographySettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('library', 'Manage bibliographies', () => {
			new BibliographyModal(this.app, this).open();
		});

		this.registerEditorSuggest(new ReferenceSuggest(this.app, this));
		this.addSettingTab(new BibliographySettingTab(this.app, this));

		this.registerEvent(
			this.app.metadataCache.on('changed', this.handleMetadataChange.bind(this))
		);
	}

	private handleMetadataChange(file: TFile) {
		const cache = this.app.metadataCache.getFileCache(file);
		const rawBib = cache?.frontmatter?.['bibliography'] as unknown;

		if (!rawBib) return;

		let incoming: string[] = [];
		if (typeof rawBib === 'string') {
			incoming = [rawBib];
		} else if (Array.isArray(rawBib)) {
			incoming = rawBib.filter((item) => typeof item === 'string');
		}

		if (incoming.length === 0) return;

		const previousSize = this.settings.bibliographies.length;

		const merged = new Set<string>([...this.settings.bibliographies, ...incoming]);

		if (merged.size > previousSize) {
			this.settings.bibliographies = Array.from(merged);

			this.saveSettings().catch(err =>
				console.error("BibliographyPlugin: Failed to save settings.", err)
			);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<BibliographySettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}