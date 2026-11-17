import { parsePietAction, type PietActionRequest } from '../Piet/actions';

/**
 * Lets the assistant offer clickable follow-ups ("Show dispute D123") instead of making the user copy values into the chat.
 *
 * The model writes them at the very end of a reply as a fenced block with the language `piet-options`, holding a JSON array.
 * A plain-text convention works with every OpenAI-compatible backend and streams fine, unlike a tool call, which would need
 * an extra round trip to the model for a reply that only exists to be shown.
 *
 * @example
 * ```piet-options
 * [{ "label": "D123", "message": "Show me the details of dispute D123" }]
 * ```
 */
export interface ReplyOption {
    /** Short text on the button. */
    label: string;
    /** Sent as the user's message when the button is clicked. Defaults to the label. */
    message: string;
    /** When set, the button opens this flow for the user instead of sending the message. */
    action?: PietActionRequest;
}

export interface ParsedReply {
    /** The reply without the options block, also while that block is still streaming in. */
    text: string;
    options: ReplyOption[];
}

export const MAX_REPLY_OPTIONS = 6;
const MAX_LABEL_LENGTH = 60;
const MAX_MESSAGE_LENGTH = 300;

const OPENER = '```piet-options';
const COMPLETE_BLOCK = /```piet-options[ \t]*\r?\n([\s\S]*?)```/g;

/** Instructions for the model. Add them to the system prompt of a chat that should offer options. */
export const PIET_REPLY_OPTIONS_INSTRUCTIONS = [
    'When you ask the user to choose between specific items you just listed (for example a dispute, transaction, payment link, or a payout identified by its date), or suggest a clear next step, offer those choices as buttons.',
    `Put them at the very end of your reply, after your text, in a fenced code block with the language "piet-options" that holds a JSON array of at most ${MAX_REPLY_OPTIONS} objects.`,
    'Each object has a short "label" (for example the reference, or the date) and optionally a "message": the full sentence the user would send, such as "Show me the details of dispute D123".',
    'Only offer options that are real values from the data you retrieved, never invented ones. Do not mention the block in your text, and do not use it when there is nothing to choose.',
].join(' ');

const toOption = (value: unknown): ReplyOption | undefined => {
    if (typeof value === 'string') value = { label: value };
    if (typeof value !== 'object' || value === null) return undefined;

    const { label, message, action } = value as Record<string, unknown>;
    if (typeof label !== 'string' || !label.trim()) return undefined;

    const text = label.trim().slice(0, MAX_LABEL_LENGTH);
    const hasMessage = typeof message === 'string' && !!message.trim();
    const sent = hasMessage ? message.trim().slice(0, MAX_MESSAGE_LENGTH) : text;

    if (action === undefined) return { label: text, message: sent };

    // An action the model got wrong is not shown as a button that does something else, unless it also wrote a message.
    const parsedAction = parsePietAction(action);
    if (parsedAction) return { label: text, message: sent, action: parsedAction };
    return hasMessage ? { label: text, message: sent } : undefined;
};

const parseOptions = (json: string): ReplyOption[] => {
    try {
        const parsed: unknown = JSON.parse(json);
        if (!Array.isArray(parsed)) return [];

        const seen = new Set<string>();
        return parsed
            .map(toOption)
            .filter((option): option is ReplyOption => !!option && !seen.has(option.label) && !!seen.add(option.label))
            .slice(0, MAX_REPLY_OPTIONS);
    } catch {
        return [];
    }
};

/** Removes an options block that has started but not finished streaming, including a partly written opening fence. */
const stripUnfinishedBlock = (text: string, isStreaming: boolean) => {
    const start = text.lastIndexOf(OPENER);
    if (start >= 0) return text.slice(0, start);

    // A trailing backtick is only the start of a block while more text may still arrive.
    for (let length = isStreaming ? OPENER.length - 1 : 0; length > 0; length--) {
        if (text.endsWith(OPENER.slice(0, length))) return text.slice(0, -length);
    }

    return text;
};

/** @param isStreaming Whether more text may still arrive, so that a partly written opening fence is hidden too. */
export const parseReplyOptions = (content: string, isStreaming = false): ParsedReply => {
    let options: ReplyOption[] = [];

    const withoutBlocks = content.replace(COMPLETE_BLOCK, (_, json: string) => {
        options = parseOptions(json);
        return '';
    });

    return { text: stripUnfinishedBlock(withoutBlocks, isStreaming).trimEnd(), options };
};
