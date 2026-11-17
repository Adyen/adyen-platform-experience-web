import type { ChatToolCall } from './types';

/**
 * Some models (and some serving setups) write a tool call as plain text in the message instead of the structured
 * `tool_calls` field. Gemma, for example, uses `call:listPayouts{balanceAccountId:BA1,limit:10}`: not JSON, and with the
 * special tokens that normally delimit string values already stripped by the server. Without a fallback the user would see
 * that raw text and the tool would never run.
 *
 * This recovers such calls. It only accepts calls to tools that were offered, and the arguments go through the same
 * validation as any other call, so it does not widen what the model can do.
 */
export interface TextToolDefinition {
    name: string;
    /** JSON Schema of the arguments. Used to read each value as the right type (a string stays a string, even if it looks numeric). */
    parameters: Record<string, unknown>;
}

const START = /(?:<\|tool_call>\s*)?call:([A-Za-z_][\w-]*)\s*\{/g;
const END_MARKER = /^\s*<tool_call\|>/;
const QUOTE_TOKEN = /<\|"\|>/g;

/** Index of the brace that closes the one opened at `open`, ignoring braces and brackets nested inside. */
const findClosingBrace = (text: string, open: number) => {
    let depth = 0;

    for (let index = open; index < text.length; index++) {
        const char = text[index];
        if (char === '{' || char === '[') depth++;
        else if (char === '}' || char === ']') depth--;
        if (depth === 0) return char === '}' ? index : -1;
    }

    return -1;
};

const splitTopLevel = (text: string): string[] => {
    const parts: string[] = [];
    let depth = 0;
    let quote: string | undefined;
    let start = 0;

    for (let index = 0; index < text.length; index++) {
        const char = text[index]!;
        if (quote) {
            if (char === quote) quote = undefined;
        } else if (char === '"' || char === "'") quote = char;
        else if (char === '{' || char === '[') depth++;
        else if (char === '}' || char === ']') depth--;
        else if (char === ',' && depth === 0) {
            parts.push(text.slice(start, index));
            start = index + 1;
        }
    }

    parts.push(text.slice(start));
    return parts.map(part => part.trim()).filter(Boolean);
};

const unquote = (value: string) => {
    const trimmed = value.trim();
    const quote = trimmed[0];
    return trimmed.length >= 2 && (quote === '"' || quote === "'") && trimmed.at(-1) === quote ? trimmed.slice(1, -1) : trimmed;
};

const readValue = (raw: string, type: unknown): unknown => {
    const value = raw.trim();

    if (type === 'array' || (value.startsWith('[') && value.endsWith(']'))) {
        const inner = value.startsWith('[') && value.endsWith(']') ? value.slice(1, -1) : value;
        return splitTopLevel(inner).map(unquote);
    }
    if (type === 'integer' || type === 'number') {
        const number = Number(unquote(value));
        return Number.isFinite(number) && unquote(value) !== '' ? number : unquote(value);
    }
    if (type === 'boolean') return unquote(value) === 'true';
    return unquote(value);
};

const parseArguments = (body: string, tool: TextToolDefinition): Record<string, unknown> => {
    const trimmed = body.trim();

    if (trimmed.startsWith('{')) {
        try {
            const parsed: unknown = JSON.parse(trimmed);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
        } catch {
            // Not JSON after all: read it as `key:value` pairs below.
        }
    }

    const properties = (tool.parameters.properties ?? {}) as Record<string, { type?: unknown }>;
    const args: Record<string, unknown> = {};

    for (const pair of splitTopLevel(trimmed.replace(/^\{|\}$/g, ''))) {
        const separator = pair.indexOf(':');
        if (separator <= 0) continue;

        const key = unquote(pair.slice(0, separator));
        args[key] = readValue(pair.slice(separator + 1), properties[key]?.type);
    }

    return args;
};

/**
 * Finds tool calls written as text, returns them in the structured form and the text without them.
 *
 * @param idPrefix Makes the generated call IDs unique within the conversation.
 */
export const extractTextToolCalls = (content: string, tools: readonly TextToolDefinition[], idPrefix: string) => {
    const toolCalls: ChatToolCall[] = [];
    let text = '';
    let cursor = 0;

    for (const match of content.matchAll(START)) {
        const tool = tools.find(({ name }) => name === match[1]);
        const open = match.index + match[0].length - 1;
        const close = tool ? findClosingBrace(content, open) : -1;
        if (!tool || close < 0 || match.index < cursor) continue;

        const marker = END_MARKER.exec(content.slice(close + 1));
        const args = parseArguments(content.slice(open + 1, close).replace(QUOTE_TOKEN, '"'), tool);

        toolCalls.push({
            id: `${idPrefix}_${toolCalls.length}`,
            type: 'function',
            function: { name: tool.name, arguments: JSON.stringify(args) },
        });
        text += content.slice(cursor, match.index);
        cursor = close + 1 + (marker?.[0].length ?? 0);
    }

    return { text: (text + content.slice(cursor)).trim(), toolCalls };
};

/** While a reply streams in, hides a tool call that has started but is not complete yet, so its raw text is never shown. */
export const hideUnfinishedTextToolCall = (content: string) => content.replace(/\s*(?:<\|tool_call>\s*)?call:[A-Za-z_][\w-]*\s*\{[\s\S]*$/, '');
