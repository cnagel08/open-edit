import type { EditorDocument } from './types.js';
export declare class History {
    private undoStack;
    private redoStack;
    private _paused;
    /** Push a snapshot onto the undo stack (clears redo) */
    push(doc: EditorDocument): void;
    /** Undo: returns the previous state (or null if nothing to undo) */
    undo(current: EditorDocument): EditorDocument | null;
    /** Redo: returns the next state (or null if nothing to redo) */
    redo(current: EditorDocument): EditorDocument | null;
    canUndo(): boolean;
    canRedo(): boolean;
    /** Pause recording (e.g. during undo/redo itself) */
    pause(): void;
    resume(): void;
    clear(): void;
}
