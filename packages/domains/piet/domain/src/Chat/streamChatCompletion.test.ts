import { describe, expect, test, vi } from 'vitest';
import { ChatCompletionError, streamChatCompletion } from './streamChatCompletion';
import type { ChatCompletionEvent, ChatMessage, ChatToolDefinition } from './types';

const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];
const config = { url: 'https://example.test/v1/chat/completions' };

const chunkEvent = (content: string) => `data: ${JSON.stringify({ choices: [{ index: 0, delta: { content }, finish_reason: null }] })}\n\n`;
const toolCallEvent = (...toolCalls: unknown[]) =>
    `data: ${JSON.stringify({ choices: [{ index: 0, delta: { tool_calls: toolCalls }, finish_reason: null }] })}\n\n`;

const eventStreamResponse = (...events: string[]) => new Response(events.join(''), { headers: { 'Content-Type': 'text/event-stream' } });

const collect = async (fetchFn: typeof fetch, overrides: Partial<Parameters<typeof streamChatCompletion>[0]> = {}) => {
    const events: ChatCompletionEvent[] = [];
    for await (const event of streamChatCompletion({ config, messages, fetchFn, ...overrides })) events.push(event);
    return events;
};

const texts = (events: ChatCompletionEvent[]) => events.flatMap(event => (event.type === 'text' ? [event.content] : []));

describe('streamChatCompletion', () => {
    test('yields the content delta of each streamed chunk until [DONE]', async () => {
        const fetchFn = vi.fn(async () =>
            eventStreamResponse(
                'data: {"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n',
                chunkEvent('Hel'),
                chunkEvent('lo '),
                chunkEvent('there'),
                'data: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
                'data: [DONE]\n\n',
                chunkEvent('ignored after done')
            )
        );

        expect(texts(await collect(fetchFn))).toEqual(['Hel', 'lo ', 'there']);
    });

    test('yields the whole reply at once for a JSON response', async () => {
        const fetchFn = vi.fn(async () =>
            Response.json({ choices: [{ index: 0, message: { role: 'assistant', content: 'Hi!' }, finish_reason: 'stop' }] })
        );

        expect(await collect(fetchFn, { config: { ...config, stream: false } })).toEqual([{ type: 'text', content: 'Hi!' }]);
    });

    test('posts the conversation in the OpenAI request format', async () => {
        const fetchFn = vi.fn(async () => eventStreamResponse('data: [DONE]\n\n'));
        const signal = new AbortController().signal;

        await collect(fetchFn, { config: { ...config, model: 'my-model', headers: { Authorization: 'Bearer token' } }, signal });

        expect(fetchFn).toHaveBeenCalledWith(
            config.url,
            expect.objectContaining({
                method: 'POST',
                signal,
                headers: expect.objectContaining({ Authorization: 'Bearer token', 'Content-Type': 'application/json' }),
            })
        );
        const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
        expect(JSON.parse(init.body as string)).toEqual({ model: 'my-model', messages, stream: true });
    });

    test('requests a streamed reply by default and a plain one when stream is false', async () => {
        const fetchFn = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => Response.json({ choices: [] }));

        await collect(fetchFn);
        await collect(fetchFn, { config: { ...config, stream: false } });

        const bodies = fetchFn.mock.calls.map(([, init]) => JSON.parse(init?.body as string));
        expect(bodies.map(body => body.stream)).toEqual([true, false]);
    });

    test('throws a ChatCompletionError with the status for a failed request', async () => {
        const fetchFn = vi.fn(async () => new Response('nope', { status: 503 }));

        await expect(collect(fetchFn)).rejects.toMatchObject({ name: 'ChatCompletionError', status: 503 });
    });

    test('throws a ChatCompletionError for a malformed chunk', async () => {
        const fetchFn = vi.fn(async () => eventStreamResponse('data: {not json}\n\n'));

        await expect(collect(fetchFn)).rejects.toBeInstanceOf(ChatCompletionError);
    });

    describe('tools', () => {
        const tools: ChatToolDefinition[] = [
            { type: 'function', function: { name: 'listPayouts', description: 'Lists payouts', parameters: { type: 'object' } } },
        ];

        test('sends the tool definitions, and omits them when there are none', async () => {
            const fetchFn = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => Response.json({ choices: [] }));

            await collect(fetchFn, { tools });
            await collect(fetchFn, { tools: [] });
            await collect(fetchFn);

            const bodies = fetchFn.mock.calls.map(([, init]) => JSON.parse(init?.body as string));
            expect(bodies[0].tools).toEqual(tools);
            expect(bodies[1]).not.toHaveProperty('tools');
            expect(bodies[2]).not.toHaveProperty('tools');
        });

        test('assembles streamed tool call fragments into complete calls', async () => {
            const fetchFn = vi.fn(async () =>
                eventStreamResponse(
                    chunkEvent('Let me check. '),
                    toolCallEvent({ index: 0, id: 'call_a', type: 'function', function: { name: 'listPayouts', arguments: '' } }),
                    toolCallEvent({ index: 1, id: 'call_b', type: 'function', function: { name: 'listTransactions', arguments: '' } }),
                    toolCallEvent({ index: 0, function: { arguments: '{"balanceAcc' } }),
                    toolCallEvent({ index: 1, function: { arguments: '{}' } }),
                    toolCallEvent({ index: 0, function: { arguments: 'ountId":"BA1"}' } }),
                    'data: {"choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}\n\n',
                    'data: [DONE]\n\n'
                )
            );

            expect(await collect(fetchFn)).toEqual([
                { type: 'text', content: 'Let me check. ' },
                {
                    type: 'tool_calls',
                    toolCalls: [
                        { id: 'call_a', type: 'function', function: { name: 'listPayouts', arguments: '{"balanceAccountId":"BA1"}' } },
                        { id: 'call_b', type: 'function', function: { name: 'listTransactions', arguments: '{}' } },
                    ],
                },
            ]);
        });

        test('yields no tool_calls event when the model did not ask for tools', async () => {
            const fetchFn = vi.fn(async () => eventStreamResponse(chunkEvent('Just text'), 'data: [DONE]\n\n'));

            expect((await collect(fetchFn)).map(({ type }) => type)).toEqual(['text']);
        });

        test('yields the tool calls of a JSON response', async () => {
            const toolCalls = [{ id: 'call_a', type: 'function', function: { name: 'listPayouts', arguments: '{}' } }];
            const fetchFn = vi.fn(async () =>
                Response.json({
                    choices: [{ index: 0, message: { role: 'assistant', content: null, tool_calls: toolCalls }, finish_reason: 'tool_calls' }],
                })
            );

            expect(await collect(fetchFn, { config: { ...config, stream: false } })).toEqual([{ type: 'tool_calls', toolCalls }]);
        });
    });
});
