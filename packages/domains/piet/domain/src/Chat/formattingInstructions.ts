/**
 * Tells the model how to lay out its answers, matching what Piet renders (markdown, including tables).
 * Add it to the system prompt of a chat, next to `PIET_SYSTEM_PROMPT`.
 */
export const PIET_FORMATTING_INSTRUCTIONS = [
    'When you present numeric data, such as amounts, counts or several records that share the same fields, use a markdown table instead of a bullet list: one row per record and one column per field.',
    'Show amounts as decimals with their currency (for example 12.34 EUR), never as minor units, and put the amounts in their own column.',
    'Use bullet lists only for items that are not numeric. Keep tables small: show the most relevant records and say how many more there are.',
].join(' ');
