import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';
import { createIsolatedFauxReflex, createReflexContainer } from './main';
import type { RefAsCallback, RefAsObject, Reflex, ReflexAction, ReflexContainer } from './types';
import { isReflex, unwrap } from './helpers';
import { REF } from './constants';

const __reflexAssignmentUpdateTests__ = (reflex: Reflex<number>, action: ReflexAction<number>) => {
    let previous = reflex.current;
    let calledTimes = (action as unknown as Mock).mock.calls.length;

    // update via assignment
    reflex.current = 10;

    expect(reflex.current).toBe(10);
    expect(action).toBeCalledWith(10, previous);
    expect(action).toBeCalledTimes(++calledTimes);

    // same value assignment
    reflex.current = previous = reflex[REF].current;

    expect(reflex.current).toBe(previous);
    expect(action).toBeCalledTimes(calledTimes);
};

const __reflexInvocationUpdateTests__ = (reflex: Reflex<number>, action: ReflexAction<number>) => {
    let previous = reflex.current;
    let calledTimes = (action as unknown as Mock).mock.calls.length;

    // update via invocation
    reflex(5);

    expect(reflex.current).toBe(5);
    expect(action).toBeCalledWith(5, previous);
    expect(action).toBeCalledTimes(++calledTimes);

    // same value invocation
    reflex((previous = reflex.current));

    expect(reflex.current).toBe(previous);
    expect(action).toBeCalledTimes(calledTimes);
};

const __reflexInstanceUpdateTests__ = (reflex: Reflex<number>, action: ReflexAction<number>) => {
    __reflexAssignmentUpdateTests__(reflex, action);
    __reflexInvocationUpdateTests__(reflex, action);
};

describe('createIsolatedFauxReflex', () => {
    type TestContextExtension = {
        action: ReflexAction<number>;
        reflex: Reflex<number>;
    };

    beforeEach<TestContextExtension>(context => {
        context.action = vi.fn(() => {});
        context.reflex = createIsolatedFauxReflex(context.action);
    });

    test<TestContextExtension>('should have expected structure + behavior', ({ action, reflex }) => {
        expect(reflex).toBeTypeOf('function');
        expect(isReflex(reflex)).toBe(false);
        expect(unwrap(reflex)).toBe(reflex);
        expect(reflex[REF]).toBe(reflex);
        expect(reflex.current).toBeNull();
        expect(reflex.actions.size).toBe(1);
        expect(reflex.actions.get(action)).toBe(1);
        expect(reflex.actions.get(console.log)).toBeUndefined();
    });

    test<TestContextExtension>('should update instance and trigger reflex action correctly', ({ action, reflex }) =>
        __reflexInstanceUpdateTests__(reflex, action));
});

describe('createReflexContainer', () => {
    type TestContextExtension = {
        action: ReflexAction<number>;
        container: ReflexContainer<number>;
    };

    beforeEach<TestContextExtension>(context => {
        context.action = vi.fn(() => {});
        context.container = createReflexContainer();
    });

    test<TestContextExtension>('should have expected initial shape', ({ container }) => {
        expect(container).toHaveProperty('action');
        expect(container).toHaveProperty('reflex');
        expect(container.action).toBeUndefined();
        expect(container.reflex).toBeUndefined();
    });

    test<TestContextExtension>('should throw error on attempt to update without reflex action', ({ container }) => {
        expect(() => {
            container.update(undefined as unknown as ReflexAction<number>);
        }).toThrowError();
    });

    test<TestContextExtension>('should still access reflex and action even after release', ({ action, container }) => {
        container.update(action);

        expect(container.action).toBe(action);
        expect(container.reflex).not.toBeUndefined();

        let reflex = container.reflex as NonNullable<Reflex<number>>;

        container.release();

        expect(container.action).toBe(action);
        expect(container.reflex).toBe(reflex);

        container.update(action);

        expect(container.action).toBe(action);
        expect(container.reflex).not.toBeUndefined();
        expect(container.reflex).not.toBe(reflex);
    });

    test<TestContextExtension>('should update correctly without a root reflexable', ({ action, container }) => {
        container.update(action);

        let reflex = container.reflex as NonNullable<Reflex<number>>;

        expect(container.action).toBe(action);
        expect(reflex).not.toBeUndefined();
        expect(reflex.current).toBeNull();
        expect(reflex.actions.size).toBe(1);
        expect(reflex.actions.get(action)).toBe(1);

        __reflexInstanceUpdateTests__(reflex, action);

        let previous = reflex.current;

        // same action so do nothing
        container.update(action);

        expect(container.action).toBe(action);
        expect(container.reflex).toBe(reflex);

        reflex = container.reflex as NonNullable<Reflex<number>>;

        expect(reflex.current).toBe(previous);

        // update to another action
        const action2 = vi.fn(() => {});
        container.update(action2);

        expect(container.action).toBe(action2);
        expect(container.action).not.toBe(action);
        expect(container.reflex).not.toBe(reflex);

        reflex = container.reflex as NonNullable<Reflex<number>>;

        expect(reflex.current).toBeNull();

        __reflexInstanceUpdateTests__(reflex, action2);
    });

    test<TestContextExtension>('should update correctly with root reflexable', ({ action, container }) => {
        const reflexable: RefAsObject<number> = { current: 5 };
        container.update(action, reflexable);

        let reflex = container.reflex as NonNullable<Reflex<number>>;

        expect(container.action).toBe(action);
        expect(reflex).not.toBeUndefined();
        expect(isReflex(reflex)).toBe(true);
        expect(unwrap(reflex)).toBe(reflexable);
        expect(reflex.current).toBe(reflexable.current);
        expect(reflex.actions.size).toBe(1);
        expect(reflex.actions.get(action)).toBe(1);

        __reflexInstanceUpdateTests__(reflex, action);

        let previous = reflex.current;

        // same action and reflexable so do nothing
        container.update(action, reflexable);

        expect(container.action).toBe(action);
        expect(container.reflex).toBe(reflex);

        reflex = container.reflex as NonNullable<Reflex<number>>;

        expect(reflex.current).toBe(previous);

        // same action, same reflexable (when reflex is unwrapped)
        // hence nothing changed
        container.update(action, reflex);

        expect(container.action).toBe(action);
        expect(container.reflex).toBe(reflex);

        reflex = container.reflex as NonNullable<Reflex<number>>;

        expect(reflex.current).toBe(previous);
        expect(reflex.actions.size).toBe(1);
        expect(reflex.actions.get(action)).toBe(1);

        // update to another reflexable
        const reflexable2: RefAsCallback<number> = () => {};
        container.update(action, reflexable2);

        expect(container.action).toBe(action);
        expect(container.reflex).not.toBe(reflex);

        reflex = container.reflex as NonNullable<Reflex<number>>;

        expect(reflex).not.toBeUndefined();
        expect(isReflex(reflex)).toBe(true);
        expect(unwrap(reflex)).toBe(reflexable2);
        expect(reflex.current).toBeNull();
        expect(reflex.actions.size).toBe(1);
        expect(reflex.actions.get(action)).toBe(1);

        __reflexInvocationUpdateTests__(reflex, action);

        // different action, same reflexable (when reflex is unwrapped)
        // hence nothing changed — reflex is still the same
        const action2 = vi.fn(() => {});
        container.update(action2, reflexable2);

        expect(container.action).not.toBe(action);
        expect(container.action).toBe(action2);
        expect(container.reflex).toBe(reflex);

        reflex = container.reflex as NonNullable<Reflex<number>>;
        reflex((previous = 100));

        expect(reflex).not.toBeUndefined();
        expect(isReflex(reflex)).toBe(true);
        expect(unwrap(reflex)).toBe(reflexable2);
        expect(reflex.current).toBe(previous);
        expect(reflex.actions.size).toBe(1);
        expect(reflex.actions.get(action)).toBeUndefined();
        expect(reflex.actions.get(action2)).toBe(1);

        __reflexInvocationUpdateTests__(reflex, action2);

        // same action, without reflexable
        container.update(action2, null);

        expect(container.action).toBe(action2);
        expect(container.reflex).not.toBe(reflex);

        reflex = container.reflex as NonNullable<Reflex<number>>;

        expect(reflex).not.toBeUndefined();
        expect(isReflex(reflex)).toBe(false);
        expect(unwrap(reflex)).toBe(reflex);
        expect(reflex.current).toBeNull();
        expect(reflex.actions.size).toBe(1);
        expect(reflex.actions.get(action2)).toBe(1);

        __reflexInstanceUpdateTests__(reflex, action2);
    });
});
