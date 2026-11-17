import { describe, expect, test } from 'vitest';
import { readServerSentEventData } from './serverSentEvents';

const encoder = new TextEncoder();

const createBody = (chunks: string[]) =>
    new ReadableStream<Uint8Array>({
        start(controller) {
            chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
            controller.close();
        },
    });

const collect = async (chunks: string[]) => {
    const payloads: string[] = [];
    for await (const data of readServerSentEventData(createBody(chunks))) payloads.push(data);
    return payloads;
};

describe('readServerSentEventData', () => {
    test('yields the data payload of every event', async () => {
        expect(await collect(['data: first\n\ndata: second\n\n'])).toEqual(['first', 'second']);
    });

    test('reassembles events that are split across network chunks', async () => {
        expect(await collect(['da', 'ta: hel', 'lo\n', '\ndata: wor', 'ld\n\n'])).toEqual(['hello', 'world']);
    });

    test.each([
        ['LF', 'data: a\n\ndata: b\n\n'],
        ['CRLF', 'data: a\r\n\r\ndata: b\r\n\r\n'],
        ['CR', 'data: a\r\rdata: b\r\r'],
    ])('supports %s line endings', async (_, body) => {
        expect(await collect([body])).toEqual(['a', 'b']);
    });

    test('joins multiple data lines of one event with a line break', async () => {
        expect(await collect(['data: line one\ndata: line two\n\n'])).toEqual(['line one\nline two']);
    });

    test('ignores comments, other fields and events without data', async () => {
        expect(await collect([': keep-alive\n\nevent: ping\nid: 1\n\ndata: kept\n\n'])).toEqual(['kept']);
    });

    test('delivers a last event that has no terminating blank line', async () => {
        expect(await collect(['data: one\n\ndata: last'])).toEqual(['one', 'last']);
    });

    test('keeps multi-byte characters that are split across chunks intact', async () => {
        const bytes = encoder.encode('data: héllo\n\n');
        const body = new ReadableStream<Uint8Array>({
            start(controller) {
                controller.enqueue(bytes.slice(0, 7));
                controller.enqueue(bytes.slice(7));
                controller.close();
            },
        });

        const payloads: string[] = [];
        for await (const data of readServerSentEventData(body)) payloads.push(data);

        expect(payloads).toEqual(['héllo']);
    });

    test('cancels the stream when the consumer stops early', async () => {
        let cancelled = false;
        const body = new ReadableStream<Uint8Array>({
            start(controller) {
                controller.enqueue(encoder.encode('data: one\n\ndata: two\n\n'));
            },
            cancel() {
                cancelled = true;
            },
        });

        for await (const data of readServerSentEventData(body)) {
            expect(data).toBe('one');
            break;
        }

        expect(cancelled).toBe(true);
    });
});
