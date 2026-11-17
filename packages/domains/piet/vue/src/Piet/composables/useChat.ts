import { computed, onScopeDispose, ref } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { isFunction } from '@integration-components/utils';
import {
    PIET_STARTERS,
    PIET_TOOLS,
    executeToolCall,
    getCurrentDateInstruction,
    extractTextToolCalls,
    streamChatCompletion,
    toToolDefinition,
    type ChatToolCall,
    type PietChatConfig,
    type PietTool,
    type ToolEndpointCaller,
} from '../../../../domain/src';
import type { PietChatMessage } from '../types';

/** Upper bound on consecutive rounds in which the model asks for tools, so a misbehaving backend cannot loop forever. */
const MAX_TOOL_ROUNDS = 5;
const CANCELLED_TOOL_RESULT = JSON.stringify({ error: 'The request was cancelled before it finished.' });

const isAbortError = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

/**
 * Owns the conversation state for Piet: the message list, the in-flight request, streaming of the assistant reply into the
 * last message as it arrives, and the tool loop. When the model asks for tools, they run client-side through the session's
 * endpoints (so the user's own permissions apply), their results go back to the model, and the loop continues until it
 * answers in text.
 */
export function useChat(config: () => PietChatConfig | undefined) {
    const sessionConfig = useConfigContext();
    const allMessages = ref<PietChatMessage[]>([]);
    const isStreaming = ref(false);
    const error = ref<Error>();
    const runningTools = ref<PietTool[]>([]);

    let nextMessageId = 0;
    let controller: AbortController | undefined;

    /** Messages worth showing: what the user wrote and what the assistant said. Tool plumbing stays hidden. */
    const messages = computed(() =>
        allMessages.value.filter(
            ({ role, content, tool_calls: toolCalls }) => (role === 'user' || role === 'assistant') && (content || !toolCalls?.length)
        )
    );

    const addMessage = (message: Omit<PietChatMessage, 'id'>) => {
        allMessages.value.push({ id: nextMessageId++, ...message });
        return allMessages.value[allMessages.value.length - 1]!;
    };

    const getEndpoint = (tool: PietTool) => {
        const endpoint = sessionConfig.endpoints[tool.endpoint];
        return isFunction(endpoint) ? (endpoint as unknown as ToolEndpointCaller) : undefined;
    };

    /** Only tools whose endpoint the session grants to this user are offered to the model. */
    const getAvailableTools = () => (config()?.tools === false ? [] : PIET_TOOLS.filter(tool => getEndpoint(tool)));

    /** Shortcuts for the empty chat. Only topics the user has access to, and none when the assistant has no tools. */
    const starters = computed(() =>
        config()?.tools === false ? [] : PIET_STARTERS.filter(({ endpoint }) => isFunction(sessionConfig.endpoints[endpoint]))
    );

    /** The system message: the configured prompt, plus today's date when tools are offered (they take dates as arguments). */
    const toSystemMessages = (hasTools: boolean) => {
        const content = [config()?.systemPrompt, hasTools ? getCurrentDateInstruction() : undefined].filter(Boolean).join('\n\n');
        return content ? [{ role: 'system' as const, content }] : [];
    };

    const toRequestMessages = (hasTools: boolean) => [
        ...toSystemMessages(hasTools),
        ...allMessages.value.map(({ role, content, tool_calls: toolCalls, tool_call_id: toolCallId }) => ({
            role,
            content,
            ...(toolCalls ? { tool_calls: toolCalls } : {}),
            ...(toolCallId ? { tool_call_id: toolCallId } : {}),
        })),
    ];

    const runToolCalls = async (toolCalls: ChatToolCall[], tools: PietTool[], signal: AbortSignal) => {
        runningTools.value = tools.filter(tool => toolCalls.some(call => call.function.name === tool.name));

        const results = await Promise.all(toolCalls.map(call => executeToolCall(call, tools, getEndpoint, signal)));
        toolCalls.forEach((call, index) => addMessage({ role: 'tool', content: results[index]!, tool_call_id: call.id }));

        runningTools.value = [];
    };

    /** Every tool call needs an answer before the conversation can be sent again, also after an abort or a failure. */
    const answerUnfinishedToolCalls = () => {
        const lastCallIndex = allMessages.value.findLastIndex(({ tool_calls: toolCalls }) => !!toolCalls?.length);
        if (lastCallIndex < 0) return;

        const answeredIds = new Set(allMessages.value.slice(lastCallIndex + 1).map(({ tool_call_id: toolCallId }) => toolCallId));

        for (const { id } of allMessages.value[lastCallIndex]!.tool_calls!) {
            if (!answeredIds.has(id)) addMessage({ role: 'tool', content: CANCELLED_TOOL_RESULT, tool_call_id: id });
        }
    };

    const requestReply = async () => {
        const chatConfig = config();
        if (!chatConfig || isStreaming.value) return;

        controller = new AbortController();
        const { signal } = controller;

        isStreaming.value = true;
        error.value = undefined;

        try {
            for (let round = 0; ; round++) {
                // After the last allowed round no tools are offered, which forces the model to answer in text.
                const tools = round < MAX_TOOL_ROUNDS ? getAvailableTools() : [];
                const history = toRequestMessages(tools.length > 0);
                const reply = addMessage({ role: 'assistant', content: '' });
                let toolCalls: ChatToolCall[] = [];

                for await (const event of streamChatCompletion({
                    config: chatConfig,
                    messages: history,
                    tools: tools.map(toToolDefinition),
                    signal,
                })) {
                    if (event.type === 'text') reply.content += event.content;
                    else toolCalls = event.toolCalls;
                }

                // Some models write the call as text instead of using `tool_calls`. Recover it, so the user never sees it.
                if (toolCalls.length === 0 && tools.length > 0) {
                    const recovered = extractTextToolCalls(reply.content, tools, `call_text_${reply.id}`);
                    reply.content = recovered.text;
                    toolCalls = recovered.toolCalls;
                }

                if (toolCalls.length === 0) break;

                reply.tool_calls = toolCalls;
                await runToolCalls(toolCalls, tools, signal);
            }
        } catch (ex) {
            if (!isAbortError(ex)) error.value = ex instanceof Error ? ex : new Error(String(ex));
        } finally {
            answerUnfinishedToolCalls();
            // An empty reply (failed or stopped before the first token) is not worth keeping in the conversation.
            allMessages.value = allMessages.value.filter(
                ({ role, content, tool_calls: toolCalls }) => role !== 'assistant' || !!content || !!toolCalls?.length
            );
            runningTools.value = [];
            isStreaming.value = false;
            controller = undefined;
        }
    };

    const send = async (content: string) => {
        const text = content.trim();
        if (!text || !config() || isStreaming.value) return;

        addMessage({ role: 'user', content: text });
        await requestReply();
    };

    /** Asks for the reply again after a failed request. */
    const retry = async () => {
        const lastRole = allMessages.value[allMessages.value.length - 1]?.role;
        if (lastRole !== 'user' && lastRole !== 'tool') return;
        await requestReply();
    };

    const stop = () => controller?.abort();

    onScopeDispose(stop);

    return { error, isStreaming, messages, retry, runningTools, send, starters, stop };
}
