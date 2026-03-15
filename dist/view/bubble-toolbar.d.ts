import type { EditorInterface } from '../core/types.js';
import type { EditorLocale } from '../locales/types.js';
export declare class BubbleToolbar {
    private el;
    private editor;
    private locale;
    private hideTimer;
    constructor(el: HTMLElement, editor: EditorInterface, locale?: EditorLocale);
    private get editorEl();
    private render;
    onSelectionChange(): void;
    private showAtSelection;
    private hide;
    private updateActiveState;
    destroy(): void;
}
