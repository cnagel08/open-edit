import { Editor } from './editor.js';
import { en } from './locales/en.js';
import { de } from './locales/de.js';
import { serializeToMarkdown, deserializeMarkdown } from './io/markdown.js';
import { createHighlightPlugin } from './plugins/highlight.js';
import { createEmojiPlugin } from './plugins/emoji.js';
import { createTemplateTagPlugin } from './plugins/template-tags.js';
import { createAIPlugin } from './plugins/ai.js';
import { createCalloutPlugin } from './plugins/callout.js';
import { createSlashCommandsPlugin } from './plugins/slash-commands.js';
import type { EditorOptions, EditorInterface, EditorPlugin, EditorDocument, EditorEventMap, ToolbarItemConfig, StatusBarOptions, Mark, MarkType, BlockNode, InlineNode, TextNode, ModelSelection, CalloutVariant, CalloutNode } from './core/types.js';
/**
 * Create a new OpenEdit editor instance.
 *
 * @example
 * // Script tag usage
 * const editor = OpenEdit.create('#my-editor', {
 *   content: '<p>Hello world</p>',
 *   placeholder: 'Start typing...',
 *   theme: 'auto',
 *   onChange: (html) => console.log(html),
 * });
 *
 * @example
 * // With image upload hook
 * const editor = OpenEdit.create('#editor', {
 *   onImageUpload: async (file) => {
 *     const formData = new FormData();
 *     formData.append('file', file);
 *     const res = await fetch('/upload', { method: 'POST', body: formData });
 *     const { url } = await res.json();
 *     return url;
 *   }
 * });
 */
declare function create(element: string | HTMLElement, options?: Omit<EditorOptions, 'element'>): EditorInterface;
export declare const OpenEdit: {
    create: typeof create;
    version: string;
    locales: {
        en: import("./index.js").EditorLocale;
        de: import("./index.js").EditorLocale;
    };
    plugins: {
        highlight: typeof createHighlightPlugin;
        emoji: typeof createEmojiPlugin;
        templateTags: typeof createTemplateTagPlugin;
        ai: typeof createAIPlugin;
        callout: typeof createCalloutPlugin;
        slashCommands: typeof createSlashCommandsPlugin;
    };
    markdown: {
        serialize: typeof serializeToMarkdown;
        deserialize: typeof deserializeMarkdown;
    };
};
export { Editor, serializeToMarkdown, deserializeMarkdown, createHighlightPlugin, createEmojiPlugin, createTemplateTagPlugin, createAIPlugin, createCalloutPlugin, createSlashCommandsPlugin, en, de };
export type { EditorOptions, EditorInterface, EditorPlugin, EditorDocument, EditorEventMap, ToolbarItemConfig, StatusBarOptions, Mark, MarkType, BlockNode, InlineNode, TextNode, ModelSelection, CalloutVariant, CalloutNode, };
export type { SlashCommand, SlashCommandsOptions } from './plugins/slash-commands.js';
export type { EditorLocale } from './locales/types.js';
export default OpenEdit;
