import { http, HttpResponse } from 'msw';
import { withDelay } from '@integration-components/testing/msw';
import type { ChatCompletionChunk, ChatCompletionRequest, ChatCompletionResponse, ChatToolCall } from '../../domain/src';
import { PIET_ENDPOINTS as endpoints } from '../endpoints';
import { getMockReply, type MockReply } from '../mock-data/piet';

const MOCK_MODEL = 'piet-mock';
const MOCK_COMPLETION_ID = 'chatcmpl-piet-mock';
const DEFAULT_CHUNK_DELAY = 60;

const encoder = new TextEncoder();
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const toServerSentEvent = (data: ChatCompletionChunk | '[DONE]') => encoder.encode(`data: ${data === '[DONE]' ? data : JSON.stringify(data)}\n\n`);

const createChunk = (delta: ChatCompletionChunk['choices'][number]['delta'], finishReason: string | null = null): ChatCompletionChunk => ({
    id: MOCK_COMPLETION_ID,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: MOCK_MODEL,
    choices: [{ index: 0, delta, finish_reason: finishReason }],
});

const TOOL_ARGUMENT_FRAGMENT_LENGTH = 12;

const toToolCalls = ({ toolCalls = [] }: MockReply): ChatToolCall[] =>
    toolCalls.map(({ name, arguments: args }, index) => ({
        id: `call_mock_${index}`,
        type: 'function',
        function: { name, arguments: JSON.stringify(args) },
    }));

/**
 * Streams the reply in the OpenAI `chat.completion.chunk` event format, followed by `[DONE]`: the text word by word, then
 * each tool call as a header chunk and its JSON arguments in small fragments, as real backends do.
 */
const createReplyStream = (reply: MockReply, chunkDelay: number) => {
    const words = reply.text.match(/\S+\s*/g) ?? [];
    const toolCalls = toToolCalls(reply);
    let cancelled = false;

    return new ReadableStream<Uint8Array>({
        async start(controller) {
            const emit = async (delta: ChatCompletionChunk['choices'][number]['delta'], finishReason: string | null = null) => {
                await sleep(chunkDelay);
                if (cancelled) return false;
                controller.enqueue(toServerSentEvent(createChunk(delta, finishReason)));
                return true;
            };

            controller.enqueue(toServerSentEvent(createChunk({ role: 'assistant', content: '' })));

            for (const word of words) {
                if (!(await emit({ content: word }))) return;
            }

            for (const [index, { id, function: fn }] of toolCalls.entries()) {
                if (!(await emit({ tool_calls: [{ index, id, type: 'function', function: { name: fn.name, arguments: '' } }] }))) return;

                for (let offset = 0; offset < fn.arguments.length; offset += TOOL_ARGUMENT_FRAGMENT_LENGTH) {
                    const fragment = fn.arguments.slice(offset, offset + TOOL_ARGUMENT_FRAGMENT_LENGTH);
                    if (!(await emit({ tool_calls: [{ index, function: { arguments: fragment } }] }))) return;
                }
            }

            controller.enqueue(toServerSentEvent(createChunk({}, toolCalls.length > 0 ? 'tool_calls' : 'stop')));
            controller.enqueue(toServerSentEvent('[DONE]'));
            controller.close();
        },
        cancel() {
            cancelled = true;
        },
    });
};

export const createChatCompletionHandler = (options?: { chunkDelay?: number; error?: boolean }) =>
    http.post(
        endpoints.chatCompletions,
        withDelay(async ({ request }) => {
            if (options?.error) {
                return HttpResponse.json({ error: { message: 'The mocked chat backend is unavailable.', type: 'server_error' } }, { status: 500 });
            }

            const { messages, stream } = (await request.json()) as ChatCompletionRequest;
            const reply = getMockReply(messages);

            if (!stream) {
                const response: ChatCompletionResponse = {
                    id: MOCK_COMPLETION_ID,
                    object: 'chat.completion',
                    created: Math.floor(Date.now() / 1000),
                    model: MOCK_MODEL,
                    choices: [
                        {
                            index: 0,
                            message: { role: 'assistant', content: reply.text, ...(reply.toolCalls ? { tool_calls: toToolCalls(reply) } : {}) },
                            finish_reason: reply.toolCalls ? 'tool_calls' : 'stop',
                        },
                    ],
                };

                return HttpResponse.json(response);
            }

            const isTest = Number(process.env.TEST_ENV) === 1;
            const stream$ = createReplyStream(reply, isTest ? 0 : (options?.chunkDelay ?? DEFAULT_CHUNK_DELAY));

            return new HttpResponse(stream$, {
                headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'text/event-stream' },
            });
        }, 500)
    );

export const pietMocks = [createChatCompletionHandler()];

export const PIET_CHAT_HANDLERS = {
    error: { handlers: [createChatCompletionHandler({ error: true })] },
    slowStream: { handlers: [createChatCompletionHandler({ chunkDelay: 400 })] },
} as const;
