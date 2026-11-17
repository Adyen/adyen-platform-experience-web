import { describe, expect, test } from 'vitest';
import { extractTextToolCalls, hideUnfinishedTextToolCall, type TextToolDefinition } from './textToolCalls';

const tools: TextToolDefinition[] = [
    {
        name: 'getTransactionTotals',
        parameters: { properties: { balanceAccountId: { type: 'string' }, categories: { type: 'array' }, createdSince: { type: 'string' } } },
    },
    { name: 'listPayouts', parameters: { properties: { balanceAccountId: { type: 'string' }, limit: { type: 'integer' } } } },
];

const extract = (content: string) => extractTextToolCalls(content, tools, 'call_text_1');
const argumentsOf = (content: string) => JSON.parse(extract(content).toolCalls[0]!.function.arguments);

describe('extractTextToolCalls', () => {
    test('recovers the call a model wrote as text', () => {
        const { text, toolCalls } = extract(
            'call:getTransactionTotals{balanceAccountId:BA32CNP223227N5KZ2NDW77PR,categories:[Chargeback],createdSince:2025-04-22T00:00:00Z}'
        );

        expect(text).toBe('');
        expect(toolCalls).toEqual([
            {
                id: 'call_text_1_0',
                type: 'function',
                function: {
                    name: 'getTransactionTotals',
                    arguments: JSON.stringify({
                        balanceAccountId: 'BA32CNP223227N5KZ2NDW77PR',
                        categories: ['Chargeback'],
                        createdSince: '2025-04-22T00:00:00Z',
                    }),
                },
            },
        ]);
    });

    test('keeps the text around the call', () => {
        const { text, toolCalls } = extract('Let me check that.\n\ncall:listPayouts{balanceAccountId:BA1}');

        expect(text).toBe('Let me check that.');
        expect(toolCalls).toHaveLength(1);
    });

    test('reads values by the type the tool declares', () => {
        expect(argumentsOf('call:listPayouts{balanceAccountId:12345,limit:20}')).toEqual({ balanceAccountId: '12345', limit: 20 });
    });

    test('understands quoted values, quote tokens, lists and the surrounding markers', () => {
        expect(
            argumentsOf('<|tool_call>call:getTransactionTotals{balanceAccountId:<|"|>BA1<|"|>,categories:["Payment","Refund"]}<tool_call|>')
        ).toEqual({
            balanceAccountId: 'BA1',
            categories: ['Payment', 'Refund'],
        });
        expect(extract('<|tool_call>call:listPayouts{balanceAccountId:BA1}<tool_call|> done').text).toBe('done');
    });

    test('accepts JSON-style arguments', () => {
        expect(argumentsOf('call:listPayouts{"balanceAccountId":"BA1","limit":10}')).toEqual({ balanceAccountId: 'BA1', limit: 10 });
    });

    test('recovers several calls', () => {
        const { toolCalls } = extract('call:listPayouts{balanceAccountId:BA1} call:listPayouts{balanceAccountId:BA2}');

        expect(toolCalls.map(({ id }) => id)).toEqual(['call_text_1_0', 'call_text_1_1']);
    });

    test.each([
        ['an unknown tool', 'call:deleteEverything{id:1}'],
        ['an unfinished call', 'call:listPayouts{balanceAccountId:BA1'],
        ['ordinary text', 'Please call: me back {soon}'],
    ])('ignores %s', (_, content) => {
        expect(extract(content)).toEqual({ text: content, toolCalls: [] });
    });
});

describe('hideUnfinishedTextToolCall', () => {
    test('hides a call that is still being written, and leaves other text alone', () => {
        expect(hideUnfinishedTextToolCall('Checking.\ncall:listPayouts{balanceAcc')).toBe('Checking.');
        expect(hideUnfinishedTextToolCall('<|tool_call>call:listPayouts{')).toBe('');
        expect(hideUnfinishedTextToolCall('Use call: sparingly')).toBe('Use call: sparingly');
    });
});
