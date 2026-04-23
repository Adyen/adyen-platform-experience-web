import { describe, expect, test, vi } from 'vitest';
import { EMPTY_OBJECT } from '../value/constants';
import { asPlainObject, struct, structFrom, withFreezeProxyHandlers } from './main';

describe('asPlainObject', () => {
    const POJO_VALUES = [
        {},
        { hello: 'world' },
        Object.create(null),
        Object.create(
            { hello: 'world' },
            {
                language: { value: 'javascript' },
            }
        ),
    ] as const;

    const NON_POJO_VALUES = [0, 1, NaN, 'false', 'true', '', false, true, null, undefined, Symbol(), [], /\\/, () => {}] as const;

    test('should return the same POJO passed as argument', () => {
        POJO_VALUES.forEach(obj => expect(asPlainObject(obj)).toBe(obj));
    });

    test('should return the same empty object by default for non-POJO', () => {
        NON_POJO_VALUES.forEach(obj => expect(asPlainObject(obj)).toBe(EMPTY_OBJECT));
    });

    test('should return the specified object passed as second argument for non-POJO', () => {
        NON_POJO_VALUES.forEach(obj => {
            const randomPOJO = POJO_VALUES[Math.floor(Math.random() * POJO_VALUES.length)];
            expect(asPlainObject(obj, randomPOJO)).toBe(randomPOJO);
        });
    });
});

describe('struct', () => {
    test('should behave the same as `Object.create` called with `null` prototype', () => {
        const aValue = 5;
        const bValue = { hello: 'world' };

        const obj = struct({
            a: { value: aValue, writable: true }, // non-configurable, non-enumerable, writable
            b: { value: bValue, configurable: true, enumerable: true }, // configurable, enumerable, non-writable
        });

        expect(obj).toBeTypeOf('object');
        expect(obj).toHaveProperty('a');
        expect(obj).toHaveProperty('b');

        expect(obj.a).toBe(aValue);
        expect(obj.b).toBe(bValue);

        expect(Object.getPrototypeOf(obj)).toBeNull();
        expect(Object.getOwnPropertyNames(obj)).toMatchObject(['a', 'b']);
        expect(Object.keys(obj)).toMatchObject(['b']);

        const _aValue = 10;
        const _bValue = ['hello world'];

        try {
            // attempt writes
            obj.a = _aValue;
            obj.b = _bValue as any; // will throw an error
        } catch {}

        // modified `obj.a` (writable)
        expect(obj.a).not.toBe(aValue);
        expect(obj.a).toBe(_aValue);

        // unmodified `obj.b` (non-writable)
        expect(obj.b).not.toBe(_bValue);
        expect(obj.b).toBe(bValue);

        const bGetter = vi.fn(() => 100);

        try {
            // attempt re-configuration
            Object.defineProperty(obj, 'b', {
                get: bGetter, // readonly
                configurable: false, // non-configurable
                enumerable: false, // non-enumerable
            });

            Object.defineProperty(obj, 'a', {
                get: bGetter, // will throw an error
            });
        } catch {}

        expect(Object.getOwnPropertyNames(obj)).toMatchObject(['a', 'b']);
        expect(Object.keys(obj)).toMatchObject([]); // `obj.b` is no longer enumerable

        // unchanged `obj.a`
        expect(obj.a).toBe(_aValue);

        // reconfigured `obj.b`
        for (let i = 0; i < 3; i++) {
            expect(obj.b).toBe(100);
            expect(bGetter).toHaveBeenCalledTimes(i + 1);
            expect(bGetter.mock.results[i]!.value).toBe(100);
        }
    });
});

describe('structFrom', () => {
    test('should behave the same as `Object.create` called with the specified prototype', () => {
        const aValue = 5;
        const bValue = { hello: 'world' };
        const proto = { a: 100, language: 'javascript' };

        const obj = structFrom(proto, {
            a: { value: aValue, writable: true }, // non-configurable, non-enumerable, writable
            b: { value: bValue, configurable: true, enumerable: true }, // configurable, enumerable, non-writable
        });

        expect(obj).toBeTypeOf('object');
        expect(obj).toHaveProperty('a');
        expect(obj).toHaveProperty('b');
        expect(obj).toHaveProperty('language');

        expect(obj.a).not.toBe(proto.a);
        expect(obj.a).toBe(aValue);
        expect(obj.b).toBe(bValue);
        expect(obj.language).toBe(proto.language);

        expect(Object.getPrototypeOf(obj)).toBe(proto);
        expect(Object.getOwnPropertyNames(obj)).toMatchObject(['a', 'b']);
        expect(Object.keys(obj)).toMatchObject(['b']);

        const _aValue = 10;
        const _bValue = ['hello world'];

        try {
            // attempt writes
            obj.a = _aValue;
            obj.b = _bValue as any; // will throw an error
        } catch {}

        // modified `obj.a` (writable)
        expect(obj.a).not.toBe(aValue);
        expect(obj.a).toBe(_aValue);

        // unmodified `obj.b` (non-writable)
        expect(obj.b).not.toBe(_bValue);
        expect(obj.b).toBe(bValue);

        const bGetter = vi.fn(() => 100);

        try {
            // attempt re-configuration
            Object.defineProperty(obj, 'b', {
                get: bGetter, // readonly
                configurable: false, // non-configurable
                enumerable: false, // non-enumerable
            });

            Object.defineProperty(obj, 'a', {
                get: bGetter, // will throw an error
            });
        } catch {}

        expect(Object.getOwnPropertyNames(obj)).toMatchObject(['a', 'b']);
        expect(Object.keys(obj)).toMatchObject([]); // `obj.b` is no longer enumerable

        // unchanged `obj.a`
        expect(obj.a).toBe(_aValue);

        // reconfigured `obj.b`
        for (let i = 0; i < 3; i++) {
            expect(obj.b).toBe(100);
            expect(bGetter).toHaveBeenCalledTimes(i + 1);
            expect(bGetter.mock.results[i]!.value).toBe(100);
        }
    });
});

describe('withFreezeProxyHandlers', () => {
    type _Callable = () => any;

    test('should always return frozen proxy handlers object', () => {
        const handlerFn = vi.fn();

        [
            {},
            Object.create(null),
            {
                // both will be overridden
                defineProperty: handlerFn,
                set: handlerFn,
            },
        ].forEach(handlers => {
            const frozenHandlers = withFreezeProxyHandlers(handlers);

            expect(Object.isFrozen(frozenHandlers)).toBe(true);
            expect(frozenHandlers).toHaveProperty('defineProperty');
            expect(frozenHandlers).toHaveProperty('set');

            expect((frozenHandlers.defineProperty as _Callable)?.()).toBe(true);
            expect(handlerFn).toHaveBeenCalledTimes(0);

            expect((frozenHandlers.set as _Callable)?.()).toBe(true);
            expect(handlerFn).toHaveBeenCalledTimes(0);
        });
    });
});
