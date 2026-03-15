import { afterEach, describe, expect, it } from 'vitest';
import { Editor } from '../editor.js';
import { en } from '../locales/en.js';

describe('Editor locale detection', () => {
  let previousLanguageDescriptor: PropertyDescriptor | undefined;

  afterEach(() => {
    if (previousLanguageDescriptor) {
      Object.defineProperty(window.navigator, 'language', previousLanguageDescriptor);
      previousLanguageDescriptor = undefined;
    }
    document.body.innerHTML = '';
  });

  function withNavigatorLanguage(language: string): void {
    previousLanguageDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'language');
    Object.defineProperty(window.navigator, 'language', {
      configurable: true,
      value: language,
    });
  }

  it('uses built-in German locale for de-* browsers', () => {
    withNavigatorLanguage('de-AT');
    const mount = document.createElement('div');
    document.body.appendChild(mount);

    const editor = new Editor({ element: mount });

    expect(editor.locale.statusBar.words).toBe('Wörter');
    editor.destroy();
  });

  it('falls back to English for unsupported browser locales', () => {
    withNavigatorLanguage('fr-FR');
    const mount = document.createElement('div');
    document.body.appendChild(mount);

    const editor = new Editor({ element: mount });

    expect(editor.locale.statusBar.words).toBe(en.statusBar.words);
    editor.destroy();
  });

  it('allows explicit locale overrides regardless of browser language', () => {
    withNavigatorLanguage('fr-FR');
    const mount = document.createElement('div');
    document.body.appendChild(mount);

    const editor = new Editor({
      element: mount,
      locale: {
        statusBar: { words: 'Mots', characters: 'Caracteres', htmlSource: 'HTML' },
      },
    });

    expect(editor.locale.statusBar.words).toBe('Mots');
    expect(editor.locale.statusBar.characters).toBe('Caracteres');
    editor.destroy();
  });
});
