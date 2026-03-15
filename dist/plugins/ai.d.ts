import type { EditorPlugin } from '../core/types.js';
export interface AIPluginOptions {
    /** Anthropic API key. Keep this server-side in production — use `endpoint` for a proxy. */
    apiKey?: string;
    /**
     * Custom endpoint URL (proxy server). The plugin POSTs the same payload as the
     * Anthropic Messages API. Use this to avoid exposing your API key in the browser.
     * Example: '/api/ai' → your server calls Anthropic and returns the response.
     */
    endpoint?: string;
    /** Model ID. Default: 'claude-sonnet-4-6' */
    model?: string;
    /** Max output tokens. Default: 2048 */
    maxTokens?: number;
}
export declare function createAIPlugin(opts?: AIPluginOptions): EditorPlugin;
