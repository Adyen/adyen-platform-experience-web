import { describe, expect, test } from 'vitest';
import { enumerable, getter, hasOwnProperty } from './property';

describe('enumerable', () => {
    const VALUES = [NaN, 'hello_world', 83, false, true, null, undefined, [], {}, () => {}] as const;

    test('should always return an enumerable non-configurable data property descriptor object', () => {
        VALUES.forEach(value => {
            const readonlyDescriptor = enumerable(value, false);
            const writableDescriptor = enumerable(value, true);

            // configurable: will default to `false`
            expect((readonlyDescriptor as any).configurable).toBeUndefined();
            expect((writableDescriptor as any).configurable).toBeUndefined();

            // always enumerable
            expect(readonlyDescriptor.enumerable).toBe(true);
            expect(writableDescriptor.enumerable).toBe(true);

            expect(readonlyDescriptor.writable).toBe(false);
            expect(writableDescriptor.writable).toBe(true);

            expect(readonlyDescriptor.value).toBe(value);
            expect(writableDescriptor.value).toBe(value);
            expect(writableDescriptor.value).toBe(readonlyDescriptor.value);
        });
    });

    test('should always return a readonly property descriptor if the `writable` argument is omitted', () => {
        VALUES.forEach(value => {
            const readonlyDescriptor = enumerable(value);

            // configurable: will default to `false`
            expect((readonlyDescriptor as any).configurable).toBeUndefined();
            expect(readonlyDescriptor.enumerable).toBe(true);
            expect(readonlyDescriptor.writable).toBe(false);
            expect(readonlyDescriptor.value).toBe(value);
        });
    });

    test('should always return a readonly property descriptor if the `writable` argument is non-boolean', () => {
        VALUES.filter((value): value is Exclude<typeof value, boolean> => typeof value !== 'boolean').forEach(writable => {
            const readonlyDescriptor = enumerable(100, writable as unknown as boolean);

            // configurable: will default to `false`
            expect((readonlyDescriptor as any).configurable).toBeUndefined();
            expect(readonlyDescriptor.enumerable).toBe(true);
            expect(readonlyDescriptor.writable).toBe(false);
            expect(readonlyDescriptor.value).toBe(100);
        });
    });
});

describe('getter', () => {
    const VALUES = [NaN, 'hello_world', 83, false, true, null, undefined, [], {}, () => {}] as const;

    test('should always return a readonly non-configurable accessor property descriptor object', () => {
        VALUES.forEach(value => {
            const getterFn = () => value;
            const nonEnumerableDescriptor = getter(getterFn, false);
            const enumerableDescriptor = getter(getterFn, true);

            // configurable: will default to `false`
            expect((nonEnumerableDescriptor as any).configurable).toBeUndefined();
            expect((enumerableDescriptor as any).configurable).toBeUndefined();

            // set: property will be readonly (no setter)
            expect((nonEnumerableDescriptor as any).set).toBeUndefined();
            expect((enumerableDescriptor as any).set).toBeUndefined();

            // always enumerable
            expect(nonEnumerableDescriptor.enumerable).toBe(false);
            expect(enumerableDescriptor.enumerable).toBe(true);

            expect(nonEnumerableDescriptor.get).toBe(getterFn);
            expect(enumerableDescriptor.get).toBe(getterFn);
            expect(enumerableDescriptor.get).toBe(nonEnumerableDescriptor.get);
        });
    });

    test('should always return an enumerable accessor property descriptor if the `enumerable` argument is omitted', () => {
        VALUES.forEach(value => {
            const enumerableDescriptor = getter(() => value);
            const obj = Object.create(null, { value: enumerableDescriptor });

            // configurable: will default to `false`
            expect((enumerableDescriptor as any).configurable).toBeUndefined();

            // set: property will be readonly (no setter)
            expect((enumerableDescriptor as any).set).toBeUndefined();

            // always enumerable
            expect(enumerableDescriptor.enumerable).toBe(true);

            // get the value (accessor property)
            expect(obj.value).toBe(value);
        });
    });

    test('should always return an enumerable accessor property descriptor if the `enumerable` argument is non-boolean', () => {
        VALUES.filter((value): value is Exclude<typeof value, boolean> => typeof value !== 'boolean').forEach(enumerable => {
            const enumerableDescriptor = getter(() => 100, enumerable as unknown as boolean);

            // configurable: will default to `false`
            expect((enumerableDescriptor as any).configurable).toBeUndefined();

            // set: property will be readonly (no setter)
            expect((enumerableDescriptor as any).set).toBeUndefined();

            // always enumerable
            expect(enumerableDescriptor.enumerable).toBe(true);
        });
    });
});

describe('hasOwnProperty', () => {
    // prototype => `Object.prototype`
    const OBJ_1 = {
        prop1: 'Hello World',
        prop2: 32,
    };

    // prototype => `null`
    const OBJ_2 = Object.create(null, {
        prop1: { enumerable: true, value: 'Hello World' },
        prop2: { enumerable: true, value: 32 },
    });

    test('should behave as `Object.hasOwn` for objects', () => {
        [OBJ_1, OBJ_2].forEach(obj => {
            for (const prop of Object.keys(obj)) {
                expect(Object.hasOwn(obj, prop)).toBe(true);
                expect(hasOwnProperty(obj, prop)).toBe(true);
            }

            expect(Object.hasOwn(obj, 'toString')).toBe(false);
            expect(hasOwnProperty(obj, 'toString')).toBe(false);
        });
    });
});
