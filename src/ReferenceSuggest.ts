import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo } from "obsidian";
import BibliographyPlugin from "./main";

interface ReferenceCompletion {
    reference: string;
    isNew: boolean;
}

export class ReferenceSuggest extends EditorSuggest<ReferenceCompletion> {

    constructor(app: App, private plugin: BibliographyPlugin) {
        super(app);
    }

    onTrigger(cursor: EditorPosition, editor: Editor): EditorSuggestTriggerInfo | null {
        const sub = editor.getLine(cursor.line).substring(0, cursor.ch);
        const match = sub.match(/@ref\s(.*)$/);

        if (!match) return null;

        return {
            start: { line: cursor.line, ch: match.index! },
            end: cursor,
            query: match[1] ?? ""
        };
    }

    getSuggestions(context: EditorSuggestContext): ReferenceCompletion[] {
        const query = context.query.toLowerCase().trim();
        const { bibliographies } = this.plugin.settings;

        const suggestions: ReferenceCompletion[] = bibliographies
            .filter(b => b.toLowerCase().includes(query))
            .map(reference => ({ reference, isNew: false }));

        const hasExactMatch = bibliographies.some(b => b.toLowerCase() === query);

        if (query && !hasExactMatch) {
            suggestions.push({
                reference: context.query.trim(),
                isNew: true
            });
        }

        return suggestions;
    }

    renderSuggestion(value: ReferenceCompletion, el: HTMLElement): void {
        if (value.isNew) {
            el.addClass("suggestion-new-item");
            el.createSpan({ text: "Create new reference: ", cls: "suggestion-prefix" });
            el.createSpan({ text: value.reference, cls: "suggestion-highlight" });
        } else {
            el.setText(value.reference);
        }
    }

    selectSuggestion(value: ReferenceCompletion, evt: MouseEvent | KeyboardEvent): void {
        if (!this.context?.file) return;

        const { editor, start, end, file } = this.context;
        const { reference } = value;

        if (value.isNew) {
            this.plugin.settings.bibliographies.push(reference);
            this.plugin.saveSettings().catch(err =>
                console.error("BibliographyPlugin: Failed to save new reference.", err)
            );
        }

        editor.replaceRange(reference, start, end);

        void this.plugin.app.fileManager.processFrontMatter(file, (fm) => {
            const frontmatter = fm as Record<string, unknown>;
            const currentBib = frontmatter['bibliography'];
            
            let bibArray: string[] = [];
            if (typeof currentBib === 'string') {
                bibArray = [currentBib];
            } else if (Array.isArray(currentBib)) {
                bibArray = (currentBib as unknown[]).filter((item): item is string => typeof item === 'string');
            }

            if (!bibArray.includes(reference)) {
                bibArray.push(reference);
            }

            frontmatter['bibliography'] = bibArray;
        });
    }
}