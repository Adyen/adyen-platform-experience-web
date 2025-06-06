import type { Defined, Nullable } from '../../../utils/types';
import type { Ref, RefAsCallback, Reflex, Reflexable, ReflexAction, ReflexRecord, ReflexRegister } from './types';
import { enumerable, isFunction, sameValue, struct } from '../../../utils';
import { assertReflexAction, unwrap } from './helpers';
import { UnknownRefError } from './errors';
import { REF } from './constants';

export const createReflexRegister = (() => {
    const _getRecordForRef = <T = any>(register: WeakMap<NonNullable<Ref>, ReflexRecord>, ref: NonNullable<Ref<T>>): ReflexRecord<T> => {
        const record = register.get(ref);
        if (!record) throw new UnknownRefError();
        return record;
    };

    const _bindReflexAction = <T = any>(
        register: WeakMap<NonNullable<Ref>, ReflexRecord>,
        reflexable: NonNullable<Reflexable<T>>,
        action?: ReflexAction<T>
    ): ReflexRecord<T>[0] => {
        let record: ReflexRecord<T> | undefined;
        let actions: Defined<typeof record>[1];

        const _ref = unwrap(reflexable) as NonNullable<Ref>;

        try {
            record = _getRecordForRef(register, _ref);
        } catch {
            /**
             * Ignore the original exception — since this could be a potential
             * reflex action binding. If no reflex action was provided, throw
             * an exception to signal the missing reflex action.
             */
            assertReflexAction<T>(action);
        }

        if (record) [, actions] = record;
        else {
            const isCallbackRef = isFunction(_ref);

            const _updateCurrentInstance: RefAsCallback<T | undefined> = isCallbackRef
                ? instance => {
                      _ref((_current = instance));
                  }
                : instance => {
                      if (_ref) {
                          _ref.current = instance;
                          _current = _ref.current;
                      }
                  };

            const reflex = (instance => {
                if (actions.size === 0) {
                    // Reflex is dead when there are no more reflex actions.
                    // It should no longer mutate the _ref current instance.
                    // Binding a new action registers _ref afresh with a new
                    // reflex.
                    return;
                }

                const previous = _current;

                _updateCurrentInstance(instance);

                if (!sameValue(_current, previous)) {
                    for (const [action] of actions) {
                        action(_current, previous);
                    }
                }
            }) as Reflex<T>;

            let _current: Nullable<T> = isCallbackRef ? null : _ref.current;

            register.set(_ref, (record = [reflex, (actions = new Map())]));

            Object.defineProperties(reflex, {
                [REF]: { value: _ref },
                actions: {
                    value: struct({
                        get: { value: actions.get.bind(actions) },
                        size: { get: () => actions.size },
                    }),
                },
                current: {
                    get: () => _current,
                    set: isCallbackRef ? (void 0 as unknown as typeof reflex) : reflex,
                },
            });
        }

        if (action) {
            actions.set(action, 1 + (actions.get(action) || 0));
        }

        return record[0];
    };

    const _unbindReflexAction = <T = any>(
        register: WeakMap<NonNullable<Ref>, ReflexRecord>,
        reflexable: Reflexable<T>,
        action: ReflexAction<T>
    ): void => {
        const _ref = unwrap(reflexable);
        const [, actions] = _getRecordForRef(register, _ref as NonNullable<Ref>);
        const bindings = actions.get(action) || 0;

        if (bindings === 1) actions.delete(action);
        else if (bindings > 1) actions.set(action, bindings - 1);
        if (actions.size === 0 && _ref) register.delete(_ref);
    };

    return (): ReflexRegister => {
        const _register = new WeakMap<NonNullable<Ref>, ReflexRecord>();
        return struct({
            bind: enumerable(_bindReflexAction.bind(void 0, _register)),
            unbind: enumerable(_unbindReflexAction.bind(void 0, _register)),
        }) as ReflexRegister;
    };
})();

export const $globalReflexRegister = createReflexRegister();
export default $globalReflexRegister;
