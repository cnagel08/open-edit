// ─────────────────────────────────────────────────────────────────────────────
// OpenEdit — Locale Interface
//
// Implement this interface to add a new language:
//   import type { EditorLocale } from 'openedit';
//   export const fr: EditorLocale = { ... };
// ─────────────────────────────────────────────────────────────────────────────

export interface EditorLocale {
  toolbar: {
    undo: string;
    redo: string;
    textFormat: string;
    paragraph: string;
    heading: (level: number) => string;
    quote: string;
    codeBlock: string;
    bold: string;
    italic: string;
    underline: string;
    inlineCode: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
    justify: string;
    bulletList: string;
    orderedList: string;
    insertLink: string;
    insertImage: string;
    blockquote: string;
    horizontalRule: string;
    htmlSource: string;
    calloutInfo: string;
    calloutSuccess: string;
    calloutWarning: string;
    calloutDanger: string;
    insertCallout: string;
  };
  statusBar: {
    /** Label prefix for word count, e.g. "Words" */
    words: string;
    /** Label prefix for character count, e.g. "Characters" */
    characters: string;
    /** Label/text on the HTML source toggle button */
    htmlSource: string;
  };
  dialogs: {
    linkUrl: string;
    openInNewTab: string;
    imageUrl: string;
    imageAlt: string;
  };
  plugins: {
    ai: {
      panelTitle: string;
      noSelection: string;
      customPromptPlaceholder: string;
      runButton: string;
      applyButton: string;
      generating: string;
      noApiKey: string;
      errorPrefix: string;
      actions: {
        improve: string;
        shorten: string;
        expand: string;
        summarize: string;
        toGerman: string;
        toEnglish: string;
      };
    };
    emoji: {
      buttonTitle: string;
      categories: {
        faces: string;
        hearts: string;
        gestures: string;
        nature: string;
        food: string;
        objects: string;
        symbols: string;
      };
    };
  };
}
