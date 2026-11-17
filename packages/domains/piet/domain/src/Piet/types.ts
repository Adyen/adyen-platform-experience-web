/** Connection settings for an OpenAI-compatible chat completions backend. */
export interface PietChatConfig {
    /** Full URL of the chat completions endpoint (`POST`). */
    url: string;
    /** Extra request headers, e.g. `Authorization`. */
    headers?: Record<string, string>;
    /** Sent as `model` in the request body when set. */
    model?: string;
    /** Requests a streamed (server-sent events) reply. Defaults to `true`. */
    stream?: boolean;
    /**
     * Sent as the first (`system`) message of every request. It is not shown in the conversation.
     * Append `PIET_FORMATTING_INSTRUCTIONS` (tables for numeric data) and `PIET_REPLY_OPTIONS_INSTRUCTIONS` (clickable
     * follow-up options) to match what Piet can render.
     */
    systemPrompt?: string;
    /** Lets the assistant call read-only tools (e.g. list transactions) on the user's behalf. Defaults to `true`. */
    tools?: boolean;
}

export interface PietProps {
    /** Enables the chat. Without it, Piet only renders its header and placeholder illustration. */
    chat?: PietChatConfig;
}
