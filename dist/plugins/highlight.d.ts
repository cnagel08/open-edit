import type { EditorPlugin } from '../core/types.js';
declare global {
    interface Window {
        hljs?: {
            highlightElement(el: HTMLElement): void;
            configure(opts: Record<string, unknown>): void;
        };
    }
}
export interface HighlightPluginOptions {
    /** Force 'light' or 'dark' theme for code highlighting. Default: follows editor theme. */
    theme?: 'light' | 'dark';
    /**
     * Custom highlight.js CSS theme URL.
     * Pass a string to use the same URL for light and dark,
     * or an object `{ light, dark }` to use different URLs per mode.
     * Available themes: https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/
     */
    themeUrl?: string | {
        light: string;
        dark: string;
    };
}
export declare function createHighlightPlugin(opts?: HighlightPluginOptions): EditorPlugin;
