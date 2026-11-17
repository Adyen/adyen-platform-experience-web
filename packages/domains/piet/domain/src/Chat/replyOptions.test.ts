import { describe, expect, test } from 'vitest';
import { MAX_REPLY_OPTIONS, parseReplyOptions } from './replyOptions';

const block = (json: string) => `\`\`\`piet-options\n${json}\n\`\`\``;

describe('parseReplyOptions', () => {
    test('leaves a reply without options untouched', () => {
        expect(parseReplyOptions('Hello **there**')).toEqual({ text: 'Hello **there**', options: [] });
    });

    test('splits the text from the options block at its end', () => {
        const reply = `You have two disputes. Want details?\n\n${block('[{"label":"D1","message":"Show dispute D1"},{"label":"D2"}]')}`;

        expect(parseReplyOptions(reply)).toEqual({
            text: 'You have two disputes. Want details?',
            options: [
                { label: 'D1', message: 'Show dispute D1' },
                { label: 'D2', message: 'D2' },
            ],
        });
    });

    test('accepts plain strings as options', () => {
        expect(parseReplyOptions(block('["A", "B"]')).options).toEqual([
            { label: 'A', message: 'A' },
            { label: 'B', message: 'B' },
        ]);
    });

    test('hides a block that is still streaming in', () => {
        expect(parseReplyOptions('Pick one\n\n```piet-options\n[{"label":"D').text).toBe('Pick one');
        expect(parseReplyOptions('Pick one\n\n```piet-options').text).toBe('Pick one');
        expect(parseReplyOptions('Pick one\n\n```pie', true).text).toBe('Pick one');
        expect(parseReplyOptions('Pick one\n\n``', true).text).toBe('Pick one');
        expect(parseReplyOptions('Pick one\n\n```piet-options\n[{"label":"D').options).toEqual([]);
    });

    test('keeps a trailing backtick once the reply is complete', () => {
        expect(parseReplyOptions('Run `ls`').text).toBe('Run `ls`');
        expect(parseReplyOptions('Run `ls`', true).text).toBe('Run `ls');
    });

    test('keeps ordinary code blocks', () => {
        const reply = 'Use this:\n\n```js\nconst a = 1;\n```';

        expect(parseReplyOptions(reply)).toEqual({ text: reply, options: [] });
    });

    test('hides a malformed block without showing options', () => {
        expect(parseReplyOptions(`Text\n${block('[{label: oops')}`)).toEqual({ text: 'Text', options: [] });
        expect(parseReplyOptions(`Text\n${block('{"label":"A"}')}`)).toEqual({ text: 'Text', options: [] });
    });

    test('drops invalid and duplicate options and caps their number', () => {
        const many = Array.from({ length: 10 }, (_, index) => ({ label: `O${index}` }));
        const json = JSON.stringify([{ label: '' }, 5, null, { label: 'A' }, { label: 'A', message: 'again' }, ...many]);

        const { options } = parseReplyOptions(block(json));

        expect(options).toHaveLength(MAX_REPLY_OPTIONS);
        expect(options.map(({ label }) => label).slice(0, 3)).toEqual(['A', 'O0', 'O1']);
    });

    test('limits the length of labels and messages', () => {
        const [option] = parseReplyOptions(block(JSON.stringify([{ label: 'L'.repeat(200), message: 'M'.repeat(1000) }]))).options;

        expect(option!.label).toHaveLength(60);
        expect(option!.message).toHaveLength(300);
    });

    test('reads actions that open a flow', () => {
        const json = JSON.stringify([
            { label: 'Refund', action: { type: 'refundTransaction', id: 'EVJN123' } },
            { label: 'New link', action: { type: 'createPaymentLink' }, message: 'Create a payment link' },
        ]);

        expect(parseReplyOptions(block(json)).options).toEqual([
            { label: 'Refund', message: 'Refund', action: { type: 'refundTransaction', transactionId: 'EVJN123' } },
            { label: 'New link', message: 'Create a payment link', action: { type: 'createPaymentLink' } },
        ]);
    });

    test('drops an invalid action, keeping the option only when it has a message', () => {
        const json = JSON.stringify([
            { label: 'No id', action: { type: 'manageDispute' } },
            { label: 'Unknown', action: { type: 'transfer', id: 'X1' } },
            { label: 'With message', message: 'Show dispute D1', action: { type: 'manageDispute' } },
        ]);

        expect(parseReplyOptions(block(json)).options).toEqual([{ label: 'With message', message: 'Show dispute D1' }]);
    });
});
