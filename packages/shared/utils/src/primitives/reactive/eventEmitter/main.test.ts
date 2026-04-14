// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { createEventEmitter } from './main';

describe('createEventEmitter', () => {
    test('should create event emitter', () => {
        const emitter = createEventEmitter<{ hello: number }>();
        const listener = vi.fn();

        emitter.emit('hello');

        // listener callback not called — since it is yet to be attached to emitter
        expect(listener).not.toHaveBeenCalled();

        // attach listener callback to emitter
        const unlisten = emitter.on('hello', listener);
        const emitDetails = [5, 10, 15];

        for (let i = 0; i < emitDetails.length; i++) {
            // emit the 'hello' event multiple times from the emitter
            emitter.emit('hello', emitDetails[i]);

            // listener callback should be called once (synchronously) for each emit
            expect(listener).toHaveBeenCalledTimes(i + 1);

            const evt = listener.mock.lastCall?.[0];

            expect(evt.detail).toBe(emitDetails[i]);
            expect(evt.type).toBe('hello');
            expect(evt.timeStamp).toBeCloseTo(Date.now(), -1);
        }

        // detach the listener callback from emitter
        unlisten();

        for (let i = 0; i < emitDetails.length; i++) {
            // emit the 'hello' event multiple times from the emitter
            emitter.emit('hello');

            // listener callback not called — since it is no longer attached to emitter
            expect(listener).toHaveBeenCalledTimes(emitDetails.length);

            const evt = listener.mock.lastCall?.[0];

            expect(evt.detail).toBe(emitDetails[emitDetails.length - 1]);
            expect(evt.type).toBe('hello');
        }
    });
});
