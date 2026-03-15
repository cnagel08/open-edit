import type { EditorInterface } from '../core/types.js';
export declare class CodeLangPicker {
    private editorEl;
    private editor;
    private pickerEl;
    private activeIndex;
    private filtered;
    private targetPreEl;
    private onOutside;
    private onOutsideTimer;
    private onScroll;
    constructor(editorEl: HTMLElement, editor: EditorInterface);
    private readonly onBadgeMousedown;
    private readonly onBadgeClick;
    private openPicker;
    private renderList;
    private updateActive;
    private selectLang;
    private closePicker;
    destroy(): void;
}
