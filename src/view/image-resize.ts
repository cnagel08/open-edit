// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Image Resize Handler
// Click on an image to select it, then drag the corner handles to resize.
// ─────────────────────────────────────────────────────────────────────────────

type Handle = 'nw' | 'ne' | 'sw' | 'se';

export class ImageResizer {
  private editorEl: HTMLElement;
  private syncCallback: () => void;
  private overlay: HTMLDivElement | null = null;
  private selectedImg: HTMLImageElement | null = null;
  private scrollParents: Element[] = [];
  private boundUpdatePos: (() => void) | null = null;

  constructor(editorEl: HTMLElement, syncCallback: () => void) {
    this.editorEl = editorEl;
    this.syncCallback = syncCallback;

    editorEl.addEventListener('click', this.onEditorClick);
    document.addEventListener('mousedown', this.onDocMousedown, true);
  }

  destroy(): void {
    this.editorEl.removeEventListener('click', this.onEditorClick);
    document.removeEventListener('mousedown', this.onDocMousedown, true);
    this.hideOverlay();
  }

  // ── Event handlers ──────────────────────────────────────────────────────────

  private readonly onEditorClick = (e: MouseEvent): void => {
    if (!(e.target instanceof HTMLImageElement)) return;
    e.stopPropagation();
    this.selectImage(e.target);
  };

  private readonly onDocMousedown = (e: MouseEvent): void => {
    if (!this.overlay) return;
    const t = e.target as Node;
    // Keep overlay when clicking handles or the selected image itself
    if (this.overlay.contains(t) || t === this.selectedImg) return;
    this.hideOverlay();
  };

  // ── Selection ───────────────────────────────────────────────────────────────

  private selectImage(img: HTMLImageElement): void {
    this.hideOverlay();
    this.selectedImg = img;

    const overlay = document.createElement('div');
    overlay.className = 'oe-img-overlay';
    // Overlay is transparent and non-blocking, handles do the work
    Object.assign(overlay.style, {
      position: 'fixed',
      border: '2px solid #3b82f6',
      borderRadius: '3px',
      zIndex: '9900',
      pointerEvents: 'none',
      boxSizing: 'border-box',
    });

    // Corner resize handles
    for (const pos of ['nw', 'ne', 'sw', 'se'] as Handle[]) {
      const handle = document.createElement('div');
      handle.className = `oe-img-handle oe-img-handle-${pos}`;
      Object.assign(handle.style, {
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: '#ffffff',
        border: '2px solid #3b82f6',
        borderRadius: '2px',
        boxSizing: 'border-box',
        pointerEvents: 'all',
        cursor: `${pos}-resize`,
        ...handleOffset(pos),
      });
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.startResize(e, img, pos);
      });
      overlay.appendChild(handle);
    }

    // Dimension label (bottom-right)
    const label = document.createElement('div');
    label.className = 'oe-img-label';
    Object.assign(label.style, {
      position: 'absolute',
      bottom: '-26px',
      right: '0',
      background: 'rgba(28,25,23,0.85)',
      color: '#fff',
      fontSize: '11px',
      fontFamily: 'monospace',
      padding: '2px 6px',
      borderRadius: '4px',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    });
    overlay.appendChild(label);

    document.body.appendChild(overlay);
    this.overlay = overlay;

    const updatePos = (): void => {
      if (!img.isConnected) { this.hideOverlay(); return; }
      const r = img.getBoundingClientRect();
      Object.assign(overlay.style, {
        top: `${r.top}px`,
        left: `${r.left}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
      });
      label.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
    };

    updatePos();
    this.boundUpdatePos = updatePos;
    window.addEventListener('scroll', updatePos, { passive: true, capture: true });
    window.addEventListener('resize', updatePos, { passive: true });
  }

  private hideOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.boundUpdatePos) {
      window.removeEventListener('scroll', this.boundUpdatePos, true);
      window.removeEventListener('resize', this.boundUpdatePos);
      this.boundUpdatePos = null;
    }
    this.selectedImg = null;
  }

  // ── Resize drag ─────────────────────────────────────────────────────────────

  private startResize(e: MouseEvent, img: HTMLImageElement, handle: Handle): void {
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = img.getBoundingClientRect().width;
    const startH = img.getBoundingClientRect().height;
    const aspect = startW / (startH || 1);

    // Disable text selection while dragging
    const prev = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent): void => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      // Determine delta based on handle position
      const rightSide = handle === 'ne' || handle === 'se';
      const bottomSide = handle === 'sw' || handle === 'se';

      const wDelta = rightSide ? dx : -dx;
      const hDelta = bottomSide ? dy : -dy;

      // Use the larger delta to drive resize, maintain aspect ratio
      const delta = Math.abs(wDelta) >= Math.abs(hDelta) ? wDelta : hDelta * aspect;
      const newW = Math.max(40, Math.round(startW + delta));
      const newH = Math.max(20, Math.round(newW / aspect));

      // Apply directly to img element
      img.style.width = `${newW}px`;
      img.style.height = 'auto';
      img.setAttribute('width', String(newW));
      img.setAttribute('height', String(newH));

      this.boundUpdatePos?.();
    };

    const onUp = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = prev;
      this.syncCallback();
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function handleOffset(pos: Handle): Partial<CSSStyleDeclaration> {
  const offset = '-6px';
  switch (pos) {
    case 'nw': return { top: offset, left: offset };
    case 'ne': return { top: offset, right: offset };
    case 'sw': return { bottom: offset, left: offset };
    case 'se': return { bottom: offset, right: offset };
  }
}
