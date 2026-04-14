import { App, Modal } from "obsidian";
import BibliographyPlugin from "./main";

export class BibliographyModal extends Modal {
    plugin: BibliographyPlugin;

    constructor(app: App, plugin: BibliographyPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        this.display();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    display() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("h2", { text: "Bibliography database" });

        // Add new entry section
        const addContainer = contentEl.createEl("div", { cls: "bibliography-add-container" });

        const inputEl = addContainer.createEl("input", {
            type: "text",
            placeholder: "Add new bibliography entry..."
        });

        const addBtn = addContainer.createEl("button", { 
            text: "Add",
            cls: "bibliography-button"
        });

        addBtn.addEventListener("click", () => {
            const val = inputEl.value.trim();
            if (val) {
                if (!this.plugin.settings.bibliographies.includes(val)) {
                    this.plugin.settings.bibliographies.push(val);
                    this.plugin.saveSettings().then(() => {
                        this.display(); // Refresh the modal
                    }).catch(err => {
                        console.error("BibliographyPlugin: Failed to save settings.", err);
                    });
                }
            }
        });

        // List existing entries
        const listContainer = contentEl.createEl("div", { cls: "bibliography-list-container" });

        if (this.plugin.settings.bibliographies.length === 0) {
            listContainer.createEl("p", { text: "No bibliographies saved yet." });
            return;
        }

        this.plugin.settings.bibliographies.forEach((bib, index) => {
            const itemEl = listContainer.createEl("div", { cls: "bibliography-item" });

            // Inline text input for editing
            const editInput = itemEl.createEl("input", { 
                type: "text", 
                value: bib,
                cls: "bibliography-item-input"
            });

            let originalValue = bib;

            editInput.addEventListener("blur", () => {
                const newVal = editInput.value.trim();
                if (newVal && newVal !== originalValue) {
                    this.plugin.settings.bibliographies[index] = newVal;
                    originalValue = newVal;
                    this.plugin.saveSettings().catch(err => {
                        console.error("BibliographyPlugin: Failed to save settings.", err);
                    });
                } else {
                    editInput.value = originalValue; // Restore if empty
                }
            });

            const deleteBtn = itemEl.createEl("button", { 
                text: "Delete",
                cls: ["bibliography-button", "bibliography-button-delete"]
            });

            deleteBtn.addEventListener("click", () => {
                this.plugin.settings.bibliographies.splice(index, 1);
                this.plugin.saveSettings().then(() => {
                    this.display(); // Refresh the list
                }).catch(err => {
                    console.error("BibliographyPlugin: Failed to save settings.", err);
                });
            });
        });
    }
}
