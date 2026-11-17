import type { ChatToolCall, ChatToolDefinition } from '../Chat/types';
import { ToolArgumentError } from './arguments';
import type { PietTool, ToolArguments, ToolEndpointCaller } from './types';

/** Results above this size are replaced by an error, so one call cannot flood the model's context window. */
export const MAX_TOOL_RESULT_LENGTH = 12_000;

export const toToolDefinition = ({ name, description, parameters }: PietTool): ChatToolDefinition => ({
    type: 'function',
    function: { name, description, parameters },
});

const errorResult = (message: string) => JSON.stringify({ error: message });

/**
 * Gemma-style models mark string values with a special quote token (`<|"|>`). Serving setups sometimes leak it into the
 * arguments, even half of it (`<|"|Chargeback<|"|`), which then fails validation although the model asked for a valid value.
 */
const QUOTE_TOKEN = /<\|"\|>?/g;

const stripQuoteTokens = (value: unknown): unknown => {
    if (typeof value === 'string') return value.replace(QUOTE_TOKEN, '');
    if (Array.isArray(value)) return value.map(stripQuoteTokens);
    if (typeof value === 'object' && value !== null)
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, stripQuoteTokens(item)]));
    return value;
};

const parseArguments = (rawArguments: string): ToolArguments => {
    let parsed: unknown;

    try {
        parsed = rawArguments.trim() ? JSON.parse(rawArguments) : {};
    } catch {
        throw new ToolArgumentError('The arguments are not valid JSON.');
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new ToolArgumentError('The arguments must be a JSON object.');
    return stripQuoteTokens(parsed) as ToolArguments;
};

/**
 * Runs one tool call requested by the model and returns the content of the `tool` message to send back.
 *
 * Problems with the call (unknown tool, bad arguments, a failing API request) are reported to the model as an `{ error }`
 * result, so it can correct itself or explain the problem to the user. Only an abort of `signal` is thrown.
 */
export async function executeToolCall(
    call: ChatToolCall,
    tools: readonly PietTool[],
    getEndpoint: (tool: PietTool) => ToolEndpointCaller | undefined,
    signal?: AbortSignal
): Promise<string> {
    const tool = tools.find(({ name }) => name === call.function.name);
    if (!tool) return errorResult(`Unknown tool "${call.function.name}".`);

    const endpoint = getEndpoint(tool);
    if (!endpoint) return errorResult('This tool is not available for the current user.');

    try {
        const args = parseArguments(call.function.arguments);
        const query = tool.query(args);
        const path = tool.path?.(args);
        const params =
            query === undefined && path === undefined
                ? undefined
                : { ...(query === undefined ? {} : { query }), ...(path === undefined ? {} : { path }) };
        const data = await endpoint({ signal }, params);
        const result = JSON.stringify(tool.summarize(data as never));

        return result.length > MAX_TOOL_RESULT_LENGTH
            ? errorResult('The result is too large. Narrow the date range or request a smaller page.')
            : result;
    } catch (error) {
        if (signal?.aborted) throw error;
        if (error instanceof ToolArgumentError) return errorResult(error.message);
        return errorResult('The request failed. Try again later or tell the user the data is currently unavailable.');
    }
}
