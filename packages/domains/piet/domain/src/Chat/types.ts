/**
 * Request and response shapes follow the OpenAI "chat completions" API, so any backend that speaks
 * (a subset of) that format can be used. Only the fields Piet reads or writes are modelled.
 */
export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

/** A call to a tool (function) that the model asks the client to run. `arguments` is a JSON-encoded string. */
export interface ChatToolCall {
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
}

export interface ChatMessage {
    role: ChatRole;
    content: string;
    /** Set on assistant messages that ask for tools to be run. */
    tool_calls?: ChatToolCall[];
    /** Set on `tool` messages: the id of the call this message answers. */
    tool_call_id?: string;
}

/** A tool the model may call, described with a JSON Schema for its arguments. */
export interface ChatToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}

export interface ChatCompletionRequest {
    model?: string;
    messages: ChatMessage[];
    stream?: boolean;
    tools?: ChatToolDefinition[];
}

/** Non-streaming response (`stream: false`). */
export interface ChatCompletionResponse {
    id?: string;
    object?: 'chat.completion';
    created?: number;
    model?: string;
    choices: Array<{
        index: number;
        message: { role: 'assistant'; content: string | null; tool_calls?: ChatToolCall[] };
        finish_reason: string | null;
    }>;
}

/** A fragment of a tool call in a streaming response. Fragments of one call share an `index`. */
export interface ChatToolCallDelta {
    index: number;
    id?: string;
    type?: 'function';
    function?: { name?: string; arguments?: string };
}

/** A single `data:` event of a streaming response (`stream: true`). */
export interface ChatCompletionChunk {
    id?: string;
    object?: 'chat.completion.chunk';
    created?: number;
    model?: string;
    choices: Array<{
        index: number;
        delta: { role?: 'assistant'; content?: string | null; tool_calls?: ChatToolCallDelta[] };
        finish_reason: string | null;
    }>;
}

/** What {@link streamChatCompletion} yields: reply text as it arrives, then (at most once) the tools the model wants run. */
export type ChatCompletionEvent = { type: 'text'; content: string } | { type: 'tool_calls'; toolCalls: ChatToolCall[] };
