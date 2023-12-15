import { beforeEach, describe, expect, test, vi } from 'vitest';
import { REF } from '../constants';
import { createReflexRegister } from './registry';
import type { RefAsObject, ReflexAction, ReflexRegister } from '../types';
import { isReflex } from './utils';

describe('createReflexRegister', () => {
    type TestContextExtension = {
        action: ReflexAction<number>;
        ref: RefAsObject<number>;
        register: ReflexRegister;
    };

    beforeEach<TestContextExtension>(context => {
        context.action = vi.fn(() => {});
        context.ref = { current: 5 };
        context.register = createReflexRegister();
    });

    test<TestContextExtension>('should throw error if reflex action is missing for unregistered ref', ({ ref, register }) => {
        expect(() => register.bind(ref)).toThrowError();
    });

    test<TestContextExtension>('should throw error if trying to unbind action for unregistered ref', ({ action, ref, register }) => {
        expect(() => register.unbind(ref, action)).toThrowError();

        const { actions } = register.bind(ref, action);

        expect(actions.size).toBe(1);
        expect(actions.get(action)).toBe(1);

        register.unbind(ref, action);

        expect(actions.size).toBe(0);
        expect(actions.get(action)).toBeUndefined;

        // Assert: ref has been unregistered when there are no more actions
        expect(() => register.unbind(ref, action)).toThrowError();
    });

    test<TestContextExtension>('should register unknown ref if reflex action is provided', ({ action, ref, register }) => {
        const reflex = register.bind(ref, action);
        const { actions } = reflex;

        expect(isReflex(reflex)).toBe(true);
        expect(reflex.current).toBe(ref.current);
        expect(reflex[REF]).toBe(ref);

        expect(actions.size).toBe(1);
        expect(actions.get(action)).toBe(1);
        expect(action).toBeCalledTimes(0);

        let previous = ref.current;

        // change ref value from reflex by assignment
        reflex.current = 10;

        expect(ref.current).toBe(10);
        expect(ref.current).toBe(reflex.current);
        expect(action).toBeCalledWith(10, previous);
        expect(action).toBeCalledTimes(1);

        // same value assignment
        reflex.current = previous = ref.current;

        expect(ref.current).toBe(previous);
        expect(ref.current).toBe(reflex.current);
        expect(action).toBeCalledTimes(1);

        // change ref value from reflex by invocation
        reflex(5);

        expect(ref.current).toBe(5);
        expect(ref.current).toBe(reflex.current);
        expect(action).toBeCalledWith(5, previous);
        expect(action).toBeCalledTimes(2);

        // same value invocation
        reflex((previous = ref.current));

        expect(ref.current).toBe(previous);
        expect(ref.current).toBe(reflex.current);
        expect(action).toBeCalledTimes(2);
    });

    test<TestContextExtension>('should increase and decrease binding count for reflex action', ({ action, ref, register }) => {
        let { actions } = register.bind(ref, action);

        expect(actions.size).toBe(1);
        expect(actions.get(action)).toBe(1);

        ({ actions } = register.bind(ref, action));

        expect(actions.size).toBe(1);
        expect(actions.get(action)).toBe(2);

        register.bind(ref, action);
        register.bind(ref, action);
        register.bind(ref, console.log); // different action

        expect(actions.size).toBe(2);
        expect(actions.get(action)).toBe(4);
        expect(actions.get(console.log)).toBe(1);

        register.unbind(ref, action);
        register.unbind(ref, action);
        register.unbind(ref, action);

        expect(actions.size).toBe(2);
        expect(actions.get(action)).toBe(1);

        register.unbind(ref, action);
        register.bind(ref, console.log);

        expect(actions.size).toBe(1);
        expect(actions.get(action)).toBeUndefined;
        expect(actions.get(console.log)).toBe(2);

        register.unbind(ref, console.log);
        register.unbind(ref, console.log);

        expect(actions.size).toBe(0);
        expect(actions.get(console.log)).toBeUndefined;

        // Assert: ref has been unregistered when there are no more actions
        expect(() => register.bind(ref)).toThrowError();
    });

    test<TestContextExtension>('should trigger reflex action once regardless of binding count', ({ action, ref, register }) => {
        register.bind(ref, action);
        register.bind(ref, action);
        register.bind(ref, action);

        const reflex = register.bind(ref);
        const { actions } = reflex;

        expect(actions.size).toBe(1);
        expect(actions.get(action)).toBe(3);

        let previous = ref.current;

        // change ref value from reflex by assignment
        reflex.current = 10;

        expect(action).toBeCalledWith(10, previous);
        expect(action).toBeCalledTimes(1);
        expect(actions.get(action)).toBe(3);

        previous = ref.current;

        // change ref value from reflex by invocation
        reflex(5);

        expect(action).toBeCalledWith(5, previous);
        expect(action).toBeCalledTimes(2);
        expect(actions.get(action)).toBe(3);

        register.unbind(ref, action);
        register.unbind(ref, action);
        register.unbind(ref, action);

        previous = ref.current;

        // reflex is dead (no more actions)
        reflex(10);

        expect(ref.current).not.toBe(10);
        expect(ref.current).toBe(previous);
        expect(ref.current).toBe(reflex.current);

        expect(actions.size).toBe(0);
        expect(action).toBeCalledTimes(2);
        expect(actions.get(action)).toBeUndefined;

        // Assert: ref has been unregistered when there are no more actions
        expect(() => register.bind(ref)).toThrowError();
    });
});
