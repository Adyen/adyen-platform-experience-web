import { describe, expect, test } from 'vitest';
import { isBoolean, isFunction, isNull, isNullish, isNumber, isPlainObject, isString, isSymbol, isUndefined } from './is';

describe('isBoolean', () => {
    test('should return `true` only for boolean values', () => {
        expect(isBoolean(false)).toBe(true);
        expect(isBoolean(true)).toBe(true);
    });

    test('should return `false` for non-boolean values', () => {
        // no argument
        expect(isBoolean()).toBe(false);

        [0, 1, NaN, 'false', 'true', '', null, undefined, Symbol(), [], {}, /\\/, () => {}].forEach(value => {
            expect(isBoolean(value)).toBe(false);
        });
    });
});

describe('isFunction', () => {
    test('should return `true` for every flavor of function (callable)', () => {
        const obj = {
            method() {},
        };

        [
            console.log, // native function
            obj.method, // object method
            obj.method.bind(obj), // bound function
            () => {}, // arrow function
            function () {}, // function expression
            function* () {}, // generator function expression
            async function () {}, // async function expression
            async function* () {}, // async generator function expression
        ].forEach(value => expect(isFunction(value)).toBe(true));
    });

    test('should return `false` for every other value', () => {
        const obj = {
            get prop() {
                return;
            },
        };

        // no argument
        expect(isFunction()).toBe(false);

        ['string', 100, false, true, null, undefined, Symbol(), [], {}, /\\/, /* property get accessor */ obj.prop].forEach(value => {
            expect(isFunction(value)).toBe(false);
        });
    });
});

describe('isNull', () => {
    test('should return `true` only for `null`', () => {
        expect(isNull(null)).toBe(true);
    });

    test('should return `false` for every other value', () => {
        // no argument
        expect(isNull()).toBe(false);

        [0, 1, NaN, 'false', 'true', '', false, true, undefined, Symbol(), [], {}, /\\/, () => {}].forEach(value => {
            expect(isNull(value)).toBe(false);
        });
    });
});

describe('isNullish', () => {
    test('should return `true` only for nullish values or when no argument is provided', () => {
        expect(isNullish()).toBe(true);
        expect(isNullish(null)).toBe(true);
        expect(isNullish(undefined)).toBe(true);
    });

    test('should return `false` for non-nullish values', () => {
        [0, 1, NaN, 'false', 'true', '', false, true, Symbol(), [], {}, /\\/, () => {}].forEach(value => {
            expect(isNullish(value)).toBe(false);
        });
    });
});

describe('isNumber', () => {
    test('should return `true` only for number literals', () => {
        [0, -0, NaN, Infinity, -Infinity, 0b1010011, 0o123, 0x53, 83, 1e3, -5.455e3, -5.455, 100_344_344, 1 << 31, Math.PI].forEach(value => {
            expect(isNumber(value)).toBe(true); // number literals
            expect(isNumber(`${value}`)).toBe(false); // numeric strings
        });
    });

    test('should return `false` for big integers', () => {
        [-100n, 100_344_344n].forEach(value => expect(isNumber(value)).toBe(false));
    });

    test('should return `false` for every other value', () => {
        // no argument
        expect(isNumber()).toBe(false);

        ['false', 'true', '', false, true, null, undefined, Symbol(), [], {}, /\\/, () => {}].forEach(value => {
            expect(isNumber(value)).toBe(false);
        });
    });
});

describe('isPlainObject', () => {
    test('should return `true` for PoJS objects', () => {
        [{}, { hello: 'world' }, new Object()].forEach(value => {
            expect(isPlainObject(value)).toBe(true);
        });
    });

    test('should return `true` for objects with `null` prototype', () => {
        [
            Object.create(null),
            Object.create(null, {
                hello: { value: 'world' },
            }),
        ].forEach(value => expect(isPlainObject(value)).toBe(true));
    });
});

describe('isString', () => {
    test('should return `true` for only string literals', () => {
        // no argument
        expect(isString()).toBe(false);

        // String objects
        [new String(), new String(''), new String('  ')].forEach(value => {
            expect(isString(value)).toBe(false);
        });

        ['', ' ', 'hello_world', `${Math.PI}`, ['hello', 'world'].join(' ')].forEach(value => {
            expect(isString(value)).toBe(true);
        });
    });
});

describe('isSymbol', () => {
    test('should return `true` only for symbols', () => {
        [Symbol(), Symbol.iterator, Symbol.toPrimitive, Symbol.toStringTag].forEach(symbol => {
            expect(isSymbol(symbol)).toBe(true);
        });
    });

    test('should return `false` for every other value', () => {
        [0, 1, NaN, 'false', 'true', '', false, true, null, undefined, [], {}, /\\/, () => {}].forEach(value => {
            expect(isSymbol(value)).toBe(false);
        });
    });
});

describe('isUndefined', () => {
    test('should return `true` only for `undefined` or when no argument is provided', () => {
        expect(isUndefined()).toBe(true);
        expect(isUndefined(undefined)).toBe(true);
    });

    test('should return `false` for every other value', () => {
        [0, 1, NaN, 'false', 'true', '', false, true, null, Symbol(), [], {}, /\\/, () => {}].forEach(value => {
            expect(isUndefined(value)).toBe(false);
        });
    });
});
