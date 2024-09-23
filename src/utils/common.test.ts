import { describe, expect, test } from 'vitest';
import { asyncNoop, constant, identity, noop, panic, toStringTag } from './common';

const VALUES = [0, 1, NaN, 'false', 'true', '', false, true, null, undefined, Symbol(), [], {}, /\\/, () => {}] as const;

describe('asyncNoop', () => {
    type _NoopFunction = (...args: any[]) => Promise<void>;

    test('should do nothing and always return a promise that is already resolved with `undefined`', async () => {
        expect(await asyncNoop()).toBeUndefined();

        for (const value of VALUES) {
            expect(await (asyncNoop as _NoopFunction)(value)).toBeUndefined();
        }
    });
});

describe('constant', () => {
    test('should return function that always returns the same value', () => {
        const fn = constant(); // no argument

        expect(fn).toBeTypeOf('function');
        expect(fn()).toBeUndefined();

        VALUES.forEach(value => {
            const fn = constant(value);
            expect(fn).toBeTypeOf('function');
            expect(fn()).toBe(value);
        });
    });
});

describe('identity', () => {
    test('should do nothing and always return the value passed as argument', () => {
        expect(identity()).toBeUndefined(); // no argument
        VALUES.forEach(value => expect(identity(value)).toBe(value));
    });
});

describe('noop', () => {
    type _NoopFunction = (...args: any[]) => undefined;

    test('should do nothing and always return `undefined`', () => {
        expect((noop as _NoopFunction)()).toBeUndefined();
        VALUES.forEach(value => expect((noop as _NoopFunction)(value)).toBeUndefined());
    });
});

describe('panic', () => {
    test('should do nothing and always throw an exception with the value passed as argument', () => {
        let lastThrown: any;

        expect(() => {
            try {
                panic();
            } catch (ex) {
                lastThrown = ex;
                throw 'exception';
            }
        }).toThrowError(); // no argument

        expect(lastThrown).toBeUndefined();

        VALUES.forEach(value => {
            expect(() => {
                try {
                    panic(value);
                } catch (ex) {
                    lastThrown = ex;
                    throw 'exception';
                }
            }).toThrowError();

            expect(lastThrown).toBe(value);
        });
    });
});

describe('toStringTag', () => {
    test('should return same toStringTag as `Object.prototype.toString` when called with `value` as `this` context', () => {
        const VALUE_TAGS: [any, string][] = [
            [0, 'Number'],
            [1, 'Number'],
            [NaN, 'Number'],
            [Infinity, 'Number'],
            [-Infinity, 'Number'],
            [1_000n, 'BigInt'],
            ['false', 'String'],
            ['true', 'String'],
            ['', 'String'],
            [false, 'Boolean'],
            [true, 'Boolean'],
            [null, 'Null'],
            [undefined, 'Undefined'],
            [Symbol(), 'Symbol'],
            [new Date(), 'Date'],
            [Promise.resolve(), 'Promise'],
            [new Map(), 'Map'],
            [new Set(), 'Set'],
            [new WeakMap(), 'WeakMap'],
            [new WeakSet(), 'WeakSet'],
            [[], 'Array'],
            [{}, 'Object'],
            [/\\/, 'RegExp'],
            [() => {}, 'Function'],
            [async () => {}, 'AsyncFunction'],
            [(function* () {})(), 'Generator'],
            [(async function* () {})(), 'AsyncGenerator'],
            [
                new (class HelloWorld {
                    [Symbol.toStringTag] = 'HelloWorld';
                })(),
                'HelloWorld',
            ],
        ];

        expect(toStringTag()).toBe('Undefined');

        VALUE_TAGS.forEach(([value, tag]) => {
            expect(toStringTag(value)).toBe(tag);
            expect(Object.prototype.toString.call(value)).toBe(`[object ${tag}]`);
        });
    });
});
