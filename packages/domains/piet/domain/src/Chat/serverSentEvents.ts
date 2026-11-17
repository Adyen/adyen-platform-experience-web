const EVENT_BOUNDARY = /\r\n\r\n|\n\n|\r\r/;
const LINE_BREAK = /\r\n|\r|\n/;

/** Returns the joined `data:` lines of one raw event, or `undefined` when it carries no data (comments, keep-alives). */
const getEventData = (rawEvent: string): string | undefined => {
    const dataLines = rawEvent
        .split(LINE_BREAK)
        .filter(line => line.startsWith('data:'))
        .map(line => line.slice('data:'.length).replace(/^ /, ''));

    return dataLines.length > 0 ? dataLines.join('\n') : undefined;
};

/**
 * Reads a Server-Sent Events body and yields the `data` payload of every event.
 *
 * Network chunks do not align with event boundaries, so incomplete events stay buffered until their terminating blank
 * line arrives. The reader is released (and the underlying request cancelled) when the consumer stops iterating early.
 */
export async function* readServerSentEventData(body: ReadableStream<Uint8Array>): AsyncGenerator<string, void, undefined> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();

            buffer += decoder.decode(value, { stream: !done });

            let boundary = EVENT_BOUNDARY.exec(buffer);

            while (boundary) {
                const data = getEventData(buffer.slice(0, boundary.index));
                buffer = buffer.slice(boundary.index + boundary[0].length);
                if (data !== undefined) yield data;
                boundary = EVENT_BOUNDARY.exec(buffer);
            }

            if (done) break;
        }

        // A stream that ends without a trailing blank line still delivers its last event.
        const data = getEventData(buffer);
        if (data !== undefined) yield data;
    } finally {
        await reader.cancel().catch(() => {});
    }
}
