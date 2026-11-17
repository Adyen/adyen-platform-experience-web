import { CHAT_STREAM_DONE } from './constants';
import { readServerSentEventData } from './serverSentEvents';
import type {
    ChatCompletionChunk,
    ChatCompletionEvent,
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatMessage,
    ChatToolCall,
    ChatToolDefinition,
} from './types';
import type { PietChatConfig } from '../Piet/types';

export class ChatCompletionError extends Error {
    public readonly status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'ChatCompletionError';
        this.status = status;
    }
}

export interface StreamChatCompletionOptions {
    config: PietChatConfig;
    messages: ChatMessage[];
    /** Tools the model may call. Omitted from the request when empty. */
    tools?: ChatToolDefinition[];
    signal?: AbortSignal;
    /** Replaces the global `fetch`, e.g. to add authentication. */
    fetchFn?: typeof fetch;
}

const parseJson = <T>(text: string): T => {
    try {
        return JSON.parse(text) as T;
    } catch {
        throw new ChatCompletionError('The chat backend returned an invalid response.');
    }
};

/** Collects the fragments of streamed tool calls (grouped by `index`) into complete calls. */
const createToolCallAccumulator = () => {
    const calls = new Map<number, { id: string; name: string; arguments: string }>();

    return {
        add(deltas: ChatCompletionChunk['choices'][number]['delta']['tool_calls']) {
            for (const { index, id, function: fn } of deltas ?? []) {
                const call = calls.get(index) ?? { id: '', name: '', arguments: '' };
                if (id) call.id = id;
                if (fn?.name) call.name += fn.name;
                if (fn?.arguments) call.arguments += fn.arguments;
                calls.set(index, call);
            }
        },
        complete(): ChatToolCall[] {
            return [...calls.entries()]
                .sort(([a], [b]) => a - b)
                .map(([index, call]) => ({
                    id: call.id || `call_${index}`,
                    type: 'function' as const,
                    function: { name: call.name, arguments: call.arguments },
                }));
        },
    };
};

/**
 * Sends the conversation to an OpenAI-compatible chat completions endpoint and yields the reply as events.
 *
 * - `text/event-stream` responses are read incrementally: one `text` event per content delta until `[DONE]`, followed by a
 *   single `tool_calls` event when the model asked for tools (their argument fragments are assembled first).
 * - `application/json` responses (backends that ignore `stream`, or `stream: false`) yield the whole reply as one `text`
 *   event, plus a `tool_calls` event when the message carries tool calls.
 */
export async function* streamChatCompletion({
    config,
    messages,
    tools,
    signal,
    fetchFn = fetch,
}: StreamChatCompletionOptions): AsyncGenerator<ChatCompletionEvent, void, undefined> {
    const stream = config.stream ?? true;
    const request: ChatCompletionRequest = {
        messages,
        stream,
        ...(config.model ? { model: config.model } : {}),
        ...(tools?.length ? { tools } : {}),
    };

    const response = await fetchFn(config.url, {
        method: 'POST',
        headers: {
            Accept: stream ? 'text/event-stream, application/json' : 'application/json',
            'Content-Type': 'application/json',
            ...config.headers,
        },
        body: JSON.stringify(request),
        signal,
    });

    if (!response.ok) throw new ChatCompletionError(`The chat backend responded with status ${response.status}.`, response.status);

    if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
        if (!response.body) throw new ChatCompletionError('The chat backend returned an empty stream.');

        const toolCalls = createToolCallAccumulator();

        for await (const data of readServerSentEventData(response.body)) {
            if (data.trim() === CHAT_STREAM_DONE) break;

            const delta = parseJson<ChatCompletionChunk>(data).choices?.[0]?.delta;
            if (delta?.content) yield { type: 'text', content: delta.content };
            toolCalls.add(delta?.tool_calls);
        }

        const completeToolCalls = toolCalls.complete();
        if (completeToolCalls.length > 0) yield { type: 'tool_calls', toolCalls: completeToolCalls };

        return;
    }

    const message = parseJson<ChatCompletionResponse>(await response.text()).choices?.[0]?.message;
    if (message?.content) yield { type: 'text', content: message.content };
    if (message?.tool_calls?.length) yield { type: 'tool_calls', toolCalls: message.tool_calls };
}
