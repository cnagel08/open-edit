// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Undo/Redo History
// Approach: Model snapshots (full document state after each command)
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorDocument } from './types.js';

const MAX_HISTORY = 200;

export class History {
  private undoStack: EditorDocument[] = [];
  private redoStack: EditorDocument[] = [];
  private _paused = false;

  /** Push a snapshot onto the undo stack (clears redo) */
  push(doc: EditorDocument): void {
    if (this._paused) return;
    this.undoStack.push(deepClone(doc));
    if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
    this.redoStack = [];
  }

  /** Undo: returns the previous state (or null if nothing to undo) */
  undo(current: EditorDocument): EditorDocument | null {
    if (this.undoStack.length === 0) return null;
    this.redoStack.push(deepClone(current));
    return this.undoStack.pop()!;
  }

  /** Redo: returns the next state (or null if nothing to redo) */
  redo(current: EditorDocument): EditorDocument | null {
    if (this.redoStack.length === 0) return null;
    this.undoStack.push(deepClone(current));
    return this.redoStack.pop()!;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Pause recording (e.g. during undo/redo itself) */
  pause(): void {
    this._paused = true;
  }

  resume(): void {
    this._paused = false;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}

function deepClone<T>(val: T): T {
  // Structured clone is available in all modern browsers
  return structuredClone(val);
}
