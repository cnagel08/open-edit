import type { EditorPlugin, EditorInterface } from '../core/types.js';
export interface SlashCommand {
    /** Eindeutiger Bezeichner, wird für CSS data-Attribute verwendet */
    id: string;
    /** Angezeigter Titel im Menü */
    title: string;
    /** Optionale kurze Beschreibung unter dem Titel */
    description?: string;
    /** Icon: SVG-String oder HTML-Text (z.B. "H1", "¶") */
    icon: string;
    /** Suchbegriffe für die Filterung (lowercase) */
    keywords: string[];
    /** Wird ausgeführt wenn der Nutzer den Befehl auswählt */
    execute: (editor: EditorInterface) => void;
}
export interface SlashCommandsOptions {
    /** Komplett eigene Befehlsliste (ersetzt die Standardbefehle) */
    commands?: SlashCommand[];
    /** Zusätzliche Befehle die zu den Standardbefehlen hinzugefügt werden */
    extraCommands?: SlashCommand[];
}
export declare function createSlashCommandsPlugin(options?: SlashCommandsOptions): EditorPlugin;
