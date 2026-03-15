import { describe, it, expect } from 'vitest';
import { deserializeMarkdown, serializeToMarkdown } from '../io/markdown.js';

describe('Markdown roundtrip', () => {
  it('preserves common block and inline formatting', () => {
    const input = [
      '# Title',
      '',
      'This is **bold** and *italic* and [link](https://example.com).',
      '',
      '- one',
      '- two',
      '',
      '```ts',
      'const n = 1;',
      '```',
    ].join('\n');

    const doc = deserializeMarkdown(input);
    const output = serializeToMarkdown(doc);

    expect(output).toContain('# Title');
    expect(output).toContain('**bold**');
    expect(output).toContain('*italic*');
    expect(output).toContain('[link](https://example.com)');
    expect(output).toContain('- one');
    expect(output).toContain('```ts');
    expect(output).toContain('const n = 1;');
  });
});
