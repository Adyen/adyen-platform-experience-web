import { effectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { PietChatConfig } from '../../../../domain/src';
import { useChat } from './useChat';

const endpoints: Record<string, unknown> = {};

vi.mock('@integration-components/core/vue', () => ({ useConfigContext: () => ({ endpoints }) }));

const config: PietChatConfig = { url: 'https://example.test/v1/chat/completions' };

const chunkEvent = (content: string) => `data: ${JSON.stringify({ choices: [{ index: 0, delta: { content }, finish_reason: null }] })}\n\n`;
const streamResponse = (...words: string[]) =>
    new Response([...words.map(chunkEvent), 'data: [DONE]\n\n'].join(''), { headers: { 'Content-Type': 'text/event-stream' } });

const fetchMock = vi.fn();

const createChat = (chatConfig: PietChatConfig | undefined) => {
    const scope = effectScope();
    return { chat: scope.run(() => useChat(() => chatConfig))!, scope };
};

const requestBody = (callIndex: number) => JSON.parse((fetchMock.mock.calls[callIndex]![1] as RequestInit).body as string);

/** Offering tools adds a system message with the current date, which these tests about the tool flow do not care about. */
const withoutSystemMessage = (messages: any[]): any[] => messages.filter(({ role }) => role !== 'system');

beforeEach(() => {
    for (const key of Object.keys(endpoints)) delete endpoints[key];
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

test('starts with an empty conversation', () => {
    const { chat, scope } = createChat(config);

    expect(chat.messages.value).toEqual([]);
    expect(chat.isStreaming.value).toBe(false);
    expect(chat.error.value).toBeUndefined();
    scope.stop();
});

test('adds the user message and streams the reply into an assistant message', async () => {
    fetchMock.mockResolvedValue(streamResponse('Hello ', 'there'));
    const { chat, scope } = createChat(config);

    await chat.send('  Hi Piet  ');

    expect(chat.messages.value.map(({ role, content }) => ({ role, content }))).toEqual([
        { role: 'user', content: 'Hi Piet' },
        { role: 'assistant', content: 'Hello there' },
    ]);
    expect(chat.isStreaming.value).toBe(false);
    scope.stop();
});

test('exposes the partial reply while it is still streaming', async () => {
    let finishStream!: () => void;
    const encoder = new TextEncoder();
    fetchMock.mockResolvedValue(
        new Response(
            new ReadableStream<Uint8Array>({
                async start(controller) {
                    controller.enqueue(encoder.encode(chunkEvent('Part')));
                    await new Promise<void>(resolve => (finishStream = resolve));
                    controller.enqueue(encoder.encode(`${chunkEvent('ial')}data: [DONE]\n\n`));
                    controller.close();
                },
            }),
            { headers: { 'Content-Type': 'text/event-stream' } }
        )
    );
    const { chat, scope } = createChat(config);

    const sending = chat.send('Hi');

    await vi.waitFor(() => expect(chat.messages.value[1]?.content).toBe('Part'));
    expect(chat.isStreaming.value).toBe(true);

    finishStream();
    await sending;

    expect(chat.messages.value[1]?.content).toBe('Partial');
    expect(chat.isStreaming.value).toBe(false);
    scope.stop();
});

test('sends the whole conversation with every request', async () => {
    fetchMock.mockImplementation(async () => streamResponse('ok'));
    const { chat, scope } = createChat(config);

    await chat.send('first');
    await chat.send('second');

    expect(requestBody(1).messages).toEqual([
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'ok' },
        { role: 'user', content: 'second' },
    ]);
    scope.stop();
});

test('prepends the system prompt to every request without showing it', async () => {
    fetchMock.mockImplementation(async () => streamResponse('ok'));
    const { chat, scope } = createChat({ ...config, systemPrompt: 'Be nice' });

    await chat.send('first');
    await chat.send('second');

    expect(requestBody(1).messages[0]).toEqual({ role: 'system', content: 'Be nice' });
    expect(requestBody(1).messages.filter((message: { role: string }) => message.role === 'system')).toHaveLength(1);
    expect(chat.messages.value.map(({ role }) => role)).toEqual(['user', 'assistant', 'user', 'assistant']);
    scope.stop();
});

test.each([[''], ['   ']])('ignores a blank message (%j)', async content => {
    const { chat, scope } = createChat(config);

    await chat.send(content);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(chat.messages.value).toEqual([]);
    scope.stop();
});

test('does nothing without a chat configuration', async () => {
    const { chat, scope } = createChat(undefined);

    await chat.send('Hi');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(chat.messages.value).toEqual([]);
    scope.stop();
});

test('keeps the user message, drops the empty reply and exposes the error when the request fails', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));
    const { chat, scope } = createChat(config);

    await chat.send('Hi');

    expect(chat.error.value).toBeInstanceOf(Error);
    expect(chat.messages.value.map(message => message.role)).toEqual(['user']);
    expect(chat.isStreaming.value).toBe(false);
    scope.stop();
});

test('retries the last user message after a failure', async () => {
    fetchMock.mockResolvedValueOnce(new Response('boom', { status: 500 })).mockResolvedValueOnce(streamResponse('Recovered'));
    const { chat, scope } = createChat(config);

    await chat.send('Hi');
    await chat.retry();

    expect(chat.error.value).toBeUndefined();
    expect(chat.messages.value.map(({ role, content }) => ({ role, content }))).toEqual([
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Recovered' },
    ]);
    expect(requestBody(1).messages).toEqual([{ role: 'user', content: 'Hi' }]);
    scope.stop();
});

test('stop keeps the partial reply without reporting an error', async () => {
    const encoder = new TextEncoder();
    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
        return new Response(
            new ReadableStream<Uint8Array>({
                start(controller) {
                    controller.enqueue(encoder.encode(chunkEvent('Partial')));
                    init.signal?.addEventListener('abort', () => controller.error(new DOMException('Aborted', 'AbortError')));
                },
            }),
            { headers: { 'Content-Type': 'text/event-stream' } }
        );
    });
    const { chat, scope } = createChat(config);

    const sending = chat.send('Hi');
    await vi.waitFor(() => expect(chat.messages.value[1]?.content).toBe('Partial'));

    chat.stop();
    await sending;

    expect(chat.error.value).toBeUndefined();
    expect(chat.isStreaming.value).toBe(false);
    expect(chat.messages.value[1]?.content).toBe('Partial');
    scope.stop();
});

describe('tools', () => {
    const toolCallResponse = (name: string, args: object, id = 'call_1') =>
        new Response(
            [
                `data: ${JSON.stringify({ choices: [{ index: 0, delta: { tool_calls: [{ index: 0, id, type: 'function', function: { name, arguments: JSON.stringify(args) } }] }, finish_reason: null }] })}\n\n`,
                'data: [DONE]\n\n',
            ].join(''),
            { headers: { 'Content-Type': 'text/event-stream' } }
        );

    const balanceAccounts = { data: [{ id: 'BA1', description: 'Main', defaultCurrencyCode: 'EUR', timeZone: 'UTC' }] };

    test('offers only the tools the session grants', async () => {
        endpoints.getBalanceAccounts = vi.fn();
        fetchMock.mockResolvedValue(streamResponse('ok'));
        const { chat, scope } = createChat(config);

        await chat.send('Hi');

        expect(requestBody(0).tools.map((tool: { function: { name: string } }) => tool.function.name)).toEqual(['listBalanceAccounts']);
        scope.stop();
    });

    test('offers no tools when none are granted or tools are disabled', async () => {
        fetchMock.mockImplementation(async () => streamResponse('ok'));
        const { chat, scope } = createChat(config);
        await chat.send('Hi');
        expect(requestBody(0)).not.toHaveProperty('tools');
        scope.stop();

        endpoints.getBalanceAccounts = vi.fn();
        const disabled = createChat({ ...config, tools: false });
        await disabled.chat.send('Hi');
        expect(requestBody(1)).not.toHaveProperty('tools');
        disabled.scope.stop();
    });

    test('runs a requested tool client-side and sends its result back to get the final answer', async () => {
        endpoints.getBalanceAccounts = vi.fn(async () => balanceAccounts);
        fetchMock.mockResolvedValueOnce(toolCallResponse('listBalanceAccounts', {})).mockResolvedValueOnce(streamResponse('You have one account.'));
        const { chat, scope } = createChat(config);

        await chat.send('What accounts do I have?');

        expect(endpoints.getBalanceAccounts).toHaveBeenCalledTimes(1);
        const followUp = withoutSystemMessage(requestBody(1).messages);
        expect(followUp.map((message: { role: string }) => message.role)).toEqual(['user', 'assistant', 'tool']);
        expect(followUp[1].tool_calls[0].id).toBe('call_1');
        expect(followUp[2].tool_call_id).toBe('call_1');
        expect(JSON.parse(followUp[2].content).balanceAccounts[0].id).toBe('BA1');
        // Tool plumbing and the empty tool-calling assistant turn stay hidden.
        expect(chat.messages.value.map(({ role, content }) => ({ role, content }))).toEqual([
            { role: 'user', content: 'What accounts do I have?' },
            { role: 'assistant', content: 'You have one account.' },
        ]);
        expect(chat.runningTools.value).toEqual([]);
        expect(chat.error.value).toBeUndefined();
        scope.stop();
    });

    test('exposes the running tools while a call is in flight', async () => {
        let finishCall!: () => void;
        endpoints.getBalanceAccounts = vi.fn(() => new Promise(resolve => (finishCall = () => resolve(balanceAccounts))));
        fetchMock.mockResolvedValueOnce(toolCallResponse('listBalanceAccounts', {})).mockResolvedValueOnce(streamResponse('Done'));
        const { chat, scope } = createChat(config);

        const sending = chat.send('Hi');
        await vi.waitFor(() => expect(chat.runningTools.value.map(({ name }) => name)).toEqual(['listBalanceAccounts']));

        finishCall();
        await sending;

        expect(chat.runningTools.value).toEqual([]);
        scope.stop();
    });

    test('rejects a tool the session did not grant, telling the model it is unknown', async () => {
        endpoints.getBalanceAccounts = vi.fn(async () => balanceAccounts);
        fetchMock.mockResolvedValueOnce(toolCallResponse('listPayouts', { balanceAccountId: 'BA1' })).mockResolvedValueOnce(streamResponse('Sorry.'));
        const { chat, scope } = createChat(config);

        await chat.send('Payouts?');

        expect(requestBody(0).tools.map((tool: { function: { name: string } }) => tool.function.name)).toEqual(['listBalanceAccounts']);
        const toolMessage = requestBody(1).messages.at(-1);
        expect(toolMessage.role).toBe('tool');
        expect(JSON.parse(toolMessage.content).error).toContain('Unknown tool "listPayouts"');
        expect(endpoints.getBalanceAccounts).not.toHaveBeenCalled();
        scope.stop();
    });

    test('stops offering tools after the maximum number of rounds', async () => {
        endpoints.getBalanceAccounts = vi.fn(async () => balanceAccounts);
        let call = 0;
        fetchMock.mockImplementation(async (_url: string, init: RequestInit) =>
            JSON.parse(init.body as string).tools ? toolCallResponse('listBalanceAccounts', {}, `call_${call++}`) : streamResponse('Enough.')
        );
        const { chat, scope } = createChat(config);

        await chat.send('Loop');

        expect(fetchMock).toHaveBeenCalledTimes(6);
        expect(requestBody(5)).not.toHaveProperty('tools');
        expect(chat.messages.value.at(-1)?.content).toBe('Enough.');
        scope.stop();
    });

    test('answers pending tool calls when stopped, so the conversation stays valid', async () => {
        endpoints.getBalanceAccounts = vi.fn(
            (_options: { signal?: AbortSignal }) =>
                new Promise((_, reject) => _options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
        );
        fetchMock.mockResolvedValueOnce(toolCallResponse('listBalanceAccounts', {})).mockResolvedValueOnce(streamResponse('Fine.'));
        const { chat, scope } = createChat(config);

        const sending = chat.send('Hi');
        await vi.waitFor(() => expect(chat.runningTools.value).toHaveLength(1));
        chat.stop();
        await sending;

        expect(chat.error.value).toBeUndefined();
        expect(chat.runningTools.value).toEqual([]);

        await chat.send('Again');

        const history = requestBody(1).messages;
        const toolMessage = history.find((message: { role: string }) => message.role === 'tool');
        expect(toolMessage.tool_call_id).toBe('call_1');
        expect(JSON.parse(toolMessage.content).error).toContain('cancelled');
        scope.stop();
    });

    test('retries after a failure that follows a tool result', async () => {
        endpoints.getBalanceAccounts = vi.fn(async () => balanceAccounts);
        fetchMock
            .mockResolvedValueOnce(toolCallResponse('listBalanceAccounts', {}))
            .mockResolvedValueOnce(new Response('boom', { status: 500 }))
            .mockResolvedValueOnce(streamResponse('Recovered'));
        const { chat, scope } = createChat(config);

        await chat.send('Hi');
        expect(chat.error.value).toBeInstanceOf(Error);

        await chat.retry();

        expect(chat.error.value).toBeUndefined();
        expect(endpoints.getBalanceAccounts).toHaveBeenCalledTimes(1);
        expect(chat.messages.value.at(-1)?.content).toBe('Recovered');
        scope.stop();
    });
    test('recovers a tool call the model wrote as text, runs it and hides the text', async () => {
        endpoints.getBalanceAccounts = vi.fn(async () => balanceAccounts);
        fetchMock
            .mockResolvedValueOnce(streamResponse('Checking.\n', 'call:listBalanceAccounts{}'))
            .mockResolvedValueOnce(streamResponse('You have one account.'));
        const { chat, scope } = createChat(config);

        await chat.send('What accounts do I have?');

        expect(endpoints.getBalanceAccounts).toHaveBeenCalledTimes(1);
        const followUp = withoutSystemMessage(requestBody(1).messages);
        expect(followUp.map((message: { role: string }) => message.role)).toEqual(['user', 'assistant', 'tool']);
        expect(followUp[1].content).toBe('Checking.');
        expect(followUp[1].tool_calls[0].function.name).toBe('listBalanceAccounts');
        expect(chat.messages.value.map(({ content }) => content)).toEqual(['What accounts do I have?', 'Checking.', 'You have one account.']);
        scope.stop();
    });
});

describe('current date', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test('tells the model the date when tools are offered, after the configured system prompt', async () => {
        vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-11-06T12:00:00Z') });
        endpoints.getBalanceAccounts = vi.fn();
        fetchMock.mockResolvedValue(streamResponse('ok'));
        const { chat, scope } = createChat({ ...config, systemPrompt: 'Be nice' });

        await chat.send('Hi');

        const [system] = requestBody(0).messages;
        expect(system.role).toBe('system');
        expect(system.content).toMatch(/^Be nice\n\nToday's date is 2026-11-06 \(time zone .+\)\./);
        scope.stop();
    });

    test('adds no system message without a prompt or tools', async () => {
        fetchMock.mockResolvedValue(streamResponse('ok'));
        const { chat, scope } = createChat(config);

        await chat.send('Hi');

        expect(requestBody(0).messages.map((message: { role: string }) => message.role)).toEqual(['user']);
        scope.stop();
    });
});

describe('starters', () => {
    test('offers a starter for every topic the session grants', () => {
        endpoints.getPayouts = vi.fn();
        endpoints.getDisputeList = vi.fn();
        const { chat, scope } = createChat(config);

        expect(chat.starters.value.map(({ id }) => id)).toEqual(['payouts', 'disputes']);
        scope.stop();
    });

    test('offers none without access, or when the assistant has no tools', () => {
        const { chat, scope } = createChat(config);
        expect(chat.starters.value).toEqual([]);
        scope.stop();

        endpoints.getPayouts = vi.fn();
        const withoutTools = createChat({ ...config, tools: false });
        expect(withoutTools.chat.starters.value).toEqual([]);
        withoutTools.scope.stop();
    });
});
