import type { EditorInterface, ToolbarItemConfig } from '../core/types.js';
import type { EditorLocale } from '../locales/types.js';
/** All item IDs available in the default toolbar, in order. */
export declare const TOOLBAR_ITEM_IDS: readonly ["undo", "redo", "blockType", "bold", "italic", "underline", "code", "alignLeft", "alignCenter", "alignRight", "alignJustify", "bulletList", "orderedList", "link", "image", "blockquote", "hr", "callout"];
/** English default toolbar (backwards-compatible export). */
export declare const DEFAULT_TOOLBAR: ToolbarItemConfig[];
/**
 * Filter the default toolbar by a list of item IDs.
 * Orphaned separators (leading, trailing, consecutive) are removed automatically.
 */
export declare function filterToolbar(ids: string[], locale?: EditorLocale): ToolbarItemConfig[];
export declare class Toolbar {
    private el;
    private editor;
    private config;
    private itemEls;
    private disabled;
    private locale;
    private calloutPickerEl;
    private calloutPickerCleanup;
    constructor(el: HTMLElement, editor: EditorInterface, config?: ToolbarItemConfig[], toolbarItems?: string[], locale?: EditorLocale);
    private render;
    private renderItem;
    private handleCommand;
    private toggleCalloutPicker;
    private closeCalloutPicker;
    private handleBlockTypeChange;
    private handleLinkCommand;
    private handleImageCommand;
    updateActiveState(): void;
    setDisabled(disabled: boolean): void;
}
