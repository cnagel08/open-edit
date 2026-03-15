export declare class ImageResizer {
    private editorEl;
    private syncCallback;
    private overlay;
    private selectedImg;
    private scrollParents;
    private boundUpdatePos;
    constructor(editorEl: HTMLElement, syncCallback: () => void);
    destroy(): void;
    private readonly onEditorClick;
    private readonly onDocMousedown;
    private selectImage;
    private hideOverlay;
    private startResize;
}
