// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { EMPTY_ARRAY } from '../value/constants';
import { getMappedValue, listFrom, pickFrom, some, uniqueFlatten, uniqueFlattenReversed } from './main';
import type { List } from '../types';

describe('getMappedValue', () => {
    test('should return value for key in map collection', () => {
        const MAP_ENTRIES: [any, any][] = [
            [NaN, 'some_value'],
            [-0, () => {}],
            [Symbol(), ['hello', 'world']],
            ['string_key', Infinity],
            [[], { hello: 'world' }],
        ];

        const WEAKMAP_ENTRIES: [any, boolean][] = [
            [() => {}, true],
            [['hello', 'world'], false],
            [{ hello: 'world' }, true],
            [document.createElement('div'), false],
        ];

        const map = new Map(MAP_ENTRIES);
        const weakMap = new WeakMap(WEAKMAP_ENTRIES);

        MAP_ENTRIES.forEach(([key, value]) => expect(getMappedValue(key, map)).toBe(value));
        WEAKMAP_ENTRIES.forEach(([key, value]) => expect(getMappedValue(key, weakMap)).toBe(value));

        // missing key
        expect(getMappedValue([], map)).toBeUndefined();
        expect(getMappedValue([], weakMap)).toBeUndefined();
    });

    test('should call factory function (when provided) with missing key and map', () => {
        const MISSING_KEYS = ['hello_world', 100, NaN, [], {}, Symbol(), () => {}] as const;
        const factory = vi.fn();
        const map = new Map();

        MISSING_KEYS.forEach(missingKey => {
            // factory function always returns `undefined`
            expect(getMappedValue(missingKey, map, factory)).toBeUndefined();
            expect(factory).toHaveBeenLastCalledWith(missingKey, map);

            // key not added to map
            expect(map.size).toBe(0);
        });
    });

    test('should add missing key to map if factory function returns a value that is not `undefined`', () => {
        const MISSING_KEYS = ['hello_world', 100, -Infinity, [], {}, Symbol(), () => {}] as const;
        const factory = vi.fn(missingKey => MISSING_KEYS.indexOf(missingKey) % 2 || undefined);
        const map = new Map();

        MISSING_KEYS.forEach((missingKey, index) => {
            expect(getMappedValue(missingKey, map, factory)).toBe(index % 2 || undefined);
            expect(factory).toHaveBeenLastCalledWith(missingKey, map);
            expect(map.has(missingKey)).toBe(!!(index % 2));
        });
    });
});

describe('listFrom', () => {
    test('should return empty array for nullish or empty values passed as argument', () => {
        // no argument
        expect(listFrom()).toBe(EMPTY_ARRAY);

        // nullish values
        expect(listFrom(null!)).toBe(EMPTY_ARRAY);
        expect(listFrom(undefined)).toBe(EMPTY_ARRAY);

        // empty string and whitespace-only strings
        expect(listFrom('')).toBe(EMPTY_ARRAY);
        expect(listFrom('  ,, , ')).toBe(EMPTY_ARRAY);

        // array of nullish and empty values
        expect(listFrom([void 0, ' ,, ', null, ' ,'])).toBe(EMPTY_ARRAY);
    });

    test('should return fallback array for nullish or empty values passed as argument', () => {
        const fallbackArray: never[] = [];

        // nullish values
        expect(listFrom(null!, fallbackArray)).toBe(fallbackArray);
        expect(listFrom(undefined, fallbackArray)).toBe(fallbackArray);

        // empty string and whitespace-only strings
        expect(listFrom('', fallbackArray)).toBe(fallbackArray);
        expect(listFrom('  ,, , ', fallbackArray)).toBe(fallbackArray);

        // array of nullish and empty values
        expect(listFrom([void 0, ' ,, ', null, ' ,'], fallbackArray)).toBe(fallbackArray);
    });

    test('should return a new flattened array (with stringified values) for array', () => {
        const returnedArray = ['5', '10', '15', '20', '25'];

        // flat
        expect(listFrom([5, 10, 15, 20, 25])).toMatchObject(returnedArray);
        expect(listFrom(['5', 10, 15, '20', 25])).toMatchObject(returnedArray);
        expect(listFrom(['5', '10', '15', '20', '25'])).toMatchObject(returnedArray);

        // nested
        expect(listFrom([5, [10, 15, 20], [25]])).toMatchObject(returnedArray);
        expect(listFrom([['5', [[10]], [[15], '20']], 25])).toMatchObject(returnedArray);
        expect(listFrom([[['5'], ['10', '15', '20', ['25']]]])).toMatchObject(returnedArray);

        // always returns new array
        expect(listFrom(returnedArray)).toMatchObject(returnedArray);
        expect(listFrom(returnedArray)).not.toBe(returnedArray);
    });

    test('should return a new flattened array for comma-separated string list or array of strings', () => {
        const returnedArray = ['hello', 'world'];

        // comma-separated string
        expect(listFrom('hello,world')).toMatchObject(returnedArray);

        // array of strings (flat or nested)
        expect(listFrom(['hello', 'world'])).toMatchObject(returnedArray);
        expect(listFrom([[['hello'], [['world']]]])).toMatchObject(returnedArray);
        expect(listFrom([['hello'], [[['world']]]])).toMatchObject(returnedArray);

        // always returns new array
        expect(listFrom(returnedArray)).toMatchObject(returnedArray);
        expect(listFrom(returnedArray)).not.toBe(returnedArray);
    });

    test('should exclude nullish values from the returned array', () => {
        const returnedArray = ['100', 'hello_world', 'null', 'false', 'NaN', '-Infinity'];

        // exclude nullish literals (null and undefined)
        expect(listFrom([100n, 'hello_world', void 0, 'null', false, NaN, -Infinity, null])).toMatchObject(returnedArray);
        expect(
            listFrom([
                [100, 'hello_world', [undefined]],
                [[`${null}`, !1, NaN], -1 / 0, null],
            ])
        ).toMatchObject(returnedArray);

        // preserve nullish literals in comma-separated string
        expect(listFrom('100,hello_world,null,false,NaN,-Infinity')).toMatchObject(returnedArray);
    });

    test('should trim unnecessary trailing and leading whitespace from each item in the returned array', () => {
        const returnedArray = ['hello', 'world'];

        // comma-separated string
        expect(listFrom(' hello ,, , world,,  ')).toMatchObject(returnedArray);

        // array of strings
        expect(listFrom([' hello  ', '  world '])).toMatchObject(returnedArray);
        expect(listFrom(['', [[' ', 'hello '], [['world ,,', ' ']]]])).toMatchObject(returnedArray);
        expect(listFrom([[' ', ' hello '], [['', [' world,']], ',, '], ''])).toMatchObject(returnedArray);
    });
});

describe('pickFrom', () => {
    const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

    test('should return the specified option if contained in list', () => {
        expect(pickFrom(PRIMES, 5)).toBe(5);
        expect(pickFrom(PRIMES, 29)).toBe(29);
        expect(pickFrom(PRIMES, 97)).toBe(97);
    });

    test('should return first item for specified option not contained in list, if without a default option', () => {
        expect(pickFrom(PRIMES, 10)).toBe(2);
        expect(pickFrom(PRIMES, 51)).toBe(2);
        expect(pickFrom(PRIMES, 77)).toBe(2);
    });

    test('should return first item if option is omitted or have a nullish value regardless of default option', () => {
        // option is omitted
        expect(pickFrom(PRIMES)).toBe(2);

        // nullish option value
        expect(pickFrom(PRIMES, null!)).toBe(2);
        expect(pickFrom(PRIMES, undefined!)).toBe(2);

        // default option is ignored
        expect(pickFrom(PRIMES, null!, 31)).toBe(2);
        expect(pickFrom(PRIMES, undefined!, 73)).toBe(2);
    });

    test('should return return default option as fallback if in list, and first item otherwise', () => {
        // default option in list
        expect(pickFrom(PRIMES, 10, 19)).toBe(19);
        expect(pickFrom(PRIMES, 51, 53)).toBe(53);
        expect(pickFrom(PRIMES, 77, 11)).toBe(11);

        // default option not in list
        expect(pickFrom(PRIMES, 10, 28)).toBe(2);
        expect(pickFrom(PRIMES, 51, 99)).toBe(2);
        expect(pickFrom(PRIMES, 77, 91)).toBe(2);
    });
});

describe('some', () => {
    const DIV = document.createElement('div');

    DIV.innerHTML = `
        <div>block text</div>
        <span>inline text (within implicit block container></span>
        <div>another block text</div>
    `;

    test('should behave as `Array.prototype.some` for arrays', () => {
        const map = new Map<any[], [(value: any) => any, boolean]>([
            [
                [void 0, false, NaN, 'null', -Infinity, null],
                [value => value, true],
            ],
            [
                [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
                [value => !(value % 9), false],
            ],
            [[], [() => true, false]],
            [[], [() => {}, false]],
        ]);

        map.forEach(([predicate, bool], arr) => {
            expect(arr.some(predicate)).toBe(bool);
            expect(some(arr, predicate)).toBe(bool);
        });
    });

    test('should treat array-likes (non-arrays) like arrays (unlike `Array.prototype.some`)', () => {
        const map = new Map<{ length: number }, [(value: any) => any, boolean]>([
            [DIV.children, [child => child.nodeName === 'SPAN', true]], // HTMLCollection
            [DIV.childNodes, [child => child.nodeName === 'P', false]], // NodeList
            ['hello world', [char => char === 'a', false]], // string
        ]);

        map.forEach(([predicate, bool], arr_like) => {
            expect(some(arr_like, predicate)).toBe(bool);
        });
    });
});

describe('uniqueFlatten', () => {
    const FLAT_LIST: List<any> = [3, 1, 2, 4, '5', '1', 5, 5, '3', 4, 1, 3];
    const NESTED_LIST: List<any> = [[[3, 1, [2]], 4, [[['5']], '1', 5]], 5, '3', [[[4], 1]], 3];
    const UNIQUE_ITEMS: List<any> = [3, 1, 2, 4, '5', '1', 5, '3'];

    test('should always return a new set when `uniqueItems` set is not provided', () => {
        const uniqueItemsForFlatList = uniqueFlatten(FLAT_LIST);
        const uniqueItemsForNestedList = uniqueFlatten(NESTED_LIST);

        expect(uniqueItemsForFlatList).toBeInstanceOf(Set);
        expect(uniqueItemsForNestedList).toBeInstanceOf(Set);
        expect(uniqueItemsForFlatList).not.toBe(uniqueItemsForNestedList);
    });

    test('should always return a reference to the `uniqueItems` set when it is provided', () => {
        const uniqueItemsSet = new Set<any>();
        const uniqueItemsForFlatList = uniqueFlatten(FLAT_LIST, uniqueItemsSet);
        const uniqueItemsForNestedList = uniqueFlatten(NESTED_LIST, uniqueItemsSet);

        expect(uniqueItemsForFlatList).toBe(uniqueItemsSet);
        expect(uniqueItemsForNestedList).toBe(uniqueItemsSet);
        expect(uniqueItemsForFlatList).toBe(uniqueItemsForNestedList);
    });

    test('should preserve the sequential order of list items in the returned set', () => {
        let uniqueItemsForFlatList = uniqueFlatten(FLAT_LIST);
        let uniqueItemsForNestedList = uniqueFlatten(NESTED_LIST);

        expect([...uniqueItemsForFlatList]).toMatchObject(UNIQUE_ITEMS);
        expect([...uniqueItemsForNestedList]).toMatchObject(UNIQUE_ITEMS);

        const uniqueItemsSequence: List<any> = ['3', 1, '5', 0, '1', 2, 3, 4, 5];
        const uniqueItemsSet = new Set<any>(['3', 1, '5', 0, '1', 2]);

        uniqueItemsForFlatList = uniqueFlatten(FLAT_LIST, uniqueItemsSet);
        uniqueItemsForNestedList = uniqueFlatten(NESTED_LIST, uniqueItemsSet);

        expect([...uniqueItemsForFlatList]).toMatchObject(uniqueItemsSequence);
        expect([...uniqueItemsForNestedList]).toMatchObject(uniqueItemsSequence);
    });
});

describe('uniqueFlattenReversed', () => {
    const FLAT_LIST: List<any> = [3, 1, 2, 4, '5', '1', 5, 5, '3', 4, 1, 3];
    const NESTED_LIST: List<any> = [[[3, 1, [2]], 4, [[['5']], '1', 5]], 5, '3', [[[4], 1]], 3];
    const UNIQUE_ITEMS: List<any> = [2, '5', '1', 5, '3', 4, 1, 3];

    test('should always return a new set when `uniqueItems` set is not provided', () => {
        const uniqueItemsForFlatList = uniqueFlattenReversed(FLAT_LIST);
        const uniqueItemsForNestedList = uniqueFlattenReversed(NESTED_LIST);

        expect(uniqueItemsForFlatList).toBeInstanceOf(Set);
        expect(uniqueItemsForNestedList).toBeInstanceOf(Set);
        expect(uniqueItemsForFlatList).not.toBe(uniqueItemsForNestedList);
    });

    test('should always return a reference to the `uniqueItems` set when it is provided', () => {
        const uniqueItemsSet = new Set<any>();
        const uniqueItemsForFlatList = uniqueFlattenReversed(FLAT_LIST, uniqueItemsSet);
        const uniqueItemsForNestedList = uniqueFlattenReversed(NESTED_LIST, uniqueItemsSet);

        expect(uniqueItemsForFlatList).toBe(uniqueItemsSet);
        expect(uniqueItemsForNestedList).toBe(uniqueItemsSet);
        expect(uniqueItemsForFlatList).toBe(uniqueItemsForNestedList);
    });

    test('should preserve the reverse sequential order of list items in the returned set', () => {
        let uniqueItemsForFlatList = uniqueFlattenReversed(FLAT_LIST);
        let uniqueItemsForNestedList = uniqueFlattenReversed(NESTED_LIST);

        expect([...uniqueItemsForFlatList]).toMatchObject(UNIQUE_ITEMS);
        expect([...uniqueItemsForNestedList]).toMatchObject(UNIQUE_ITEMS);

        const uniqueItemsSequence: List<any> = [0, ...UNIQUE_ITEMS];
        const uniqueItemsSet = new Set<any>(['3', 1, '5', 0, '1', 2]);

        uniqueItemsForFlatList = uniqueFlattenReversed(FLAT_LIST, uniqueItemsSet);
        uniqueItemsForNestedList = uniqueFlattenReversed(NESTED_LIST, uniqueItemsSet);

        expect([...uniqueItemsForFlatList]).toMatchObject(uniqueItemsSequence);
        expect([...uniqueItemsForNestedList]).toMatchObject(uniqueItemsSequence);
    });
});
