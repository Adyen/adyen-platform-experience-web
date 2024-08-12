import { describe, expect, test } from 'vitest';
import { REF } from './constants';
import type { RefAsObject, Reflex, ReflexAction } from './types';
import { assertReflexAction, isReflex, unwrap } from './helpers';

type RelaxedReflex = Omit<Reflex, 'actions' | typeof REF> & {
    (instance?: any): any;
    [REF]: Reflex[typeof REF];
    actions: Map<ReflexAction, number>;
};

describe('assertReflexAction', () => {
    test('should throw for non-callable', () => {
        expect(() => assertReflexAction()).toThrowError();
        expect(() => assertReflexAction({})).toThrowError();
        expect(() => assertReflexAction([])).toThrowError();
        expect(() => assertReflexAction(null)).toThrowError();
        expect(() => assertReflexAction('hello')).toThrowError();
    });

    test('should not throw for callable', () => {
        expect(() => assertReflexAction(() => {})).not.toThrowError();
    });
});

describe('isReflex', () => {
    test('should return false for refs', () => {
        const refObject = { current: 5 };
        const refCallback = (): void => {};

        expect(isReflex(refObject)).toBe(false);
        expect(isReflex(refCallback)).toBe(false);
    });

    test('should return true for only true reflexes', () => {
        let reflex = {} as RelaxedReflex;

        // Not a function
        expect(isReflex(reflex)).toBe(false);

        reflex = (() => {}) as RelaxedReflex;

        // Missing [REF] and current properties
        expect(isReflex(reflex)).toBe(false);

        reflex[REF] = { current: 5 };

        // Missing current property
        expect(isReflex(reflex)).toBe(false);

        reflex.current = reflex[REF].current;

        // Has both [REF] and current properties
        // But lacks the map-like `actions` property + behavior
        expect(isReflex(reflex)).toBe(false);

        reflex.actions = new Map();

        // Has expected reflex behavior and structure (true reflex)
        expect(isReflex(reflex)).toBe(true);

        reflex[REF] = reflex;

        // Circular reference at the [REF] property
        expect(isReflex(reflex)).toBe(false);
    });
});

describe('unwrap', () => {
    test('should return refs (the same)', () => {
        const refObject = { current: 5 };
        const refCallback = (): void => {};

        expect(unwrap(refObject)).toBe(refObject);
        expect(unwrap(refCallback)).toBe(refCallback);
    });

    test('should return root ref for true reflexes', () => {
        const _ref = { current: 5 };
        const reflex = (() => {}) as RelaxedReflex;

        reflex[REF] = _ref;
        reflex.current = reflex[REF].current;
        reflex.actions = new Map();

        expect(unwrap(reflex)).toBe(_ref);
        expect((unwrap(reflex) as RefAsObject).current).toBe(_ref.current);
    });
});
