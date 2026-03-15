import { describe, it, expect } from 'vitest';
import { History } from '../core/history.js';
import { createDocument, createParagraph } from '../core/model.js';

describe('History', () => {
  it('returns the latest snapshot on undo', () => {
    const history = new History();
    const initial = createDocument([createParagraph('first')]);
    const updated = createDocument([createParagraph('second')]);

    history.push(initial);
    const undone = history.undo(updated);

    expect(undone).toEqual(initial);
  });

  it('clears redo stack when new changes are pushed', () => {
    const history = new History();
    const v1 = createDocument([createParagraph('v1')]);
    const v2 = createDocument([createParagraph('v2')]);
    const v3 = createDocument([createParagraph('v3')]);

    history.push(v1);
    const undone = history.undo(v2);
    expect(undone).toEqual(v1);
    expect(history.canRedo()).toBe(true);

    history.push(v3);
    expect(history.canRedo()).toBe(false);
  });
});
