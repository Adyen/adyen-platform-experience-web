import { describe, expect, test } from 'vitest';
import { noop } from '../../../utils';
import { createWatchListCurrentStateRecord, createWatchListSubscriptionEventCallbacks } from './helpers';

describe('createWatchListCurrentStateRecord', () => {
    test('should have constant state getters for static entries', () => {
        let NUMBER = 30;
        let STRING = 'Hello World';
        const state = createWatchListCurrentStateRecord({ prop1: STRING, prop2: NUMBER });

        expect(state).toHaveProperty('prop1');
        expect(state).toHaveProperty('prop2');
        expect(state.prop1).toBe(STRING);
        expect(state.prop2).toBe(NUMBER);

        const PREV_NUMBER = NUMBER;
        const PREV_STRING = STRING;

        NUMBER = 50;
        STRING = 'Hello World!!!';

        expect(state.prop1).not.toBe(STRING);
        expect(state.prop2).not.toBe(NUMBER);
        expect(state.prop1).toBe(PREV_STRING);
        expect(state.prop2).toBe(PREV_NUMBER);
    });

    test('should have computed state getters for getter entries', () => {
        let NUMBER = 30;
        let STRING = 'Hello World';

        const state = createWatchListCurrentStateRecord({
            get prop1() {
                return STRING;
            },
            get prop2() {
                return NUMBER;
            },
            get prop3() {
                return this.prop2 / 2;
            },
        });

        expect(state).toHaveProperty('prop1');
        expect(state).toHaveProperty('prop2');
        expect(state).toHaveProperty('prop3');
        expect(state.prop1).toBe(STRING);
        expect(state.prop2).toBe(NUMBER);
        expect(state.prop3).toBe(NUMBER / 2);

        const PREV_NUMBER = NUMBER;
        const PREV_STRING = STRING;

        NUMBER = 50;
        STRING = 'Hello World!!!';

        expect(state.prop1).not.toBe(PREV_STRING);
        expect(state.prop2).not.toBe(PREV_NUMBER);
        expect(state.prop3).not.toBe(PREV_NUMBER / 2);
        expect(state.prop1).toBe(STRING);
        expect(state.prop2).toBe(NUMBER);
        expect(state.prop3).toBe(NUMBER / 2);
    });

    test('should have computed state getters for callable entries', () => {
        let NUMBER = 30;
        let STRING = 'Hello World';

        const state = createWatchListCurrentStateRecord({
            prop1: () => STRING,
            prop2: () => NUMBER,
            prop3() {
                return this.prop2() / 2;
            },
        } as const);

        expect(state).toHaveProperty('prop1');
        expect(state).toHaveProperty('prop2');
        expect(state).toHaveProperty('prop3');
        expect(state.prop1).toBe(STRING);
        expect(state.prop2).toBe(NUMBER);
        expect(state.prop3).toBe(NUMBER / 2);

        const PREV_NUMBER = NUMBER;
        const PREV_STRING = STRING;

        NUMBER = 50;
        STRING = 'Hello World!!!';

        expect(state.prop1).not.toBe(PREV_STRING);
        expect(state.prop2).not.toBe(PREV_NUMBER);
        expect(state.prop3).not.toBe(PREV_NUMBER / 2);
        expect(state.prop1).toBe(STRING);
        expect(state.prop2).toBe(NUMBER);
        expect(state.prop3).toBe(NUMBER / 2);
    });
});

describe('createWatchListSubscriptionEventCallbacks', () => {
    test('should create struct of callbacks', () => {
        const callbacks = createWatchListSubscriptionEventCallbacks();

        expect(callbacks).toBeTypeOf('object');
        expect(callbacks).toHaveProperty('idle');
        expect(callbacks).toHaveProperty('resume');
        expect(callbacks.idle).toBeTypeOf('function');
        expect(callbacks.resume).toBeTypeOf('function');

        expect(callbacks.idle).toBe(noop);
        expect(callbacks.idle).toBe(callbacks.resume);

        // Setting with non-nullish values
        let idleCallback = (callbacks.idle = () => {}); // idleCallback is a function (callable)
        let resumeCallback = (callbacks.resume = {} as unknown as () => any); // resumeCallback is not a function

        expect(callbacks.idle).not.toBe(noop);
        expect(callbacks.idle).not.toBe(callbacks.resume);
        expect(callbacks.idle).toBe(idleCallback);

        expect(callbacks.resume).toBe(noop);
        expect(callbacks.resume).not.toBe(resumeCallback);

        // Setting with nullish values
        idleCallback = callbacks.idle = null as unknown as () => any;
        resumeCallback = callbacks.resume = undefined as unknown as () => any;

        expect(callbacks.idle).toBe(noop);
        expect(callbacks.idle).toBe(callbacks.resume);
        expect(callbacks.idle).not.toBe(idleCallback);
        expect(callbacks.resume).not.toBe(resumeCallback);
    });
});
