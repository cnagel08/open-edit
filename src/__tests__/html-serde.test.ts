import { describe, it, expect } from 'vitest';
import { deserializeHTML } from '../io/deserializer.js';
import { serializeToHTML } from '../io/serializer.js';

describe('HTML serializer/deserializer', () => {
  it('removes scripts and keeps semantic content', () => {
    const html = [
      '<h2 style="text-align:center">Hello</h2>',
      '<p><strong>World</strong> <a href="https://example.com" target="_blank">link</a></p>',
      '<script>alert("xss")</script>',
    ].join('');

    const doc = deserializeHTML(html);
    const output = serializeToHTML(doc);

    expect(output).toContain('<h2 style="text-align:center">Hello</h2>');
    expect(output).toContain('<strong>World</strong>');
    expect(output).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>');
    expect(output).not.toContain('<script');
    expect(output).not.toContain('alert("xss")');
  });

  it('parses and serializes callouts with safe variant fallback', () => {
    const html = [
      '<div class="oe-callout oe-callout-warning" data-callout-variant="warning">Watch out</div>',
      '<div class="oe-callout oe-callout-danger" data-callout-variant="not-valid">Fallback</div>',
    ].join('');

    const doc = deserializeHTML(html);
    const output = serializeToHTML(doc);

    expect(output).toContain('data-callout-variant="warning"');
    expect(output).toContain('oe-callout-warning');
    expect(output).toContain('Watch out');

    // Invalid data-callout-variant should fall back to a known class variant.
    expect(output).toContain('oe-callout-danger');
    expect(output).toContain('data-callout-variant="danger"');
    expect(output).toContain('Fallback');
  });
});
