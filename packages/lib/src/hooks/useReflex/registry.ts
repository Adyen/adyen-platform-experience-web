import { NullableReflexable, Reflex, Reflexable, ReflexableRecord, ReflexableRef, ReflexAction } from './types';
import { isFunction } from '@src/utils/common';

const REGISTRY = new WeakMap<ReflexableRef, ReflexableRecord>();

const getRecordFromRegistry = <T = any>(ref: ReflexableRef<T>) => {
    const record = REGISTRY.get(ref);
    if (!record) throw new ReferenceError('unknown_ref');
    return record;
};

const isReflex = <T = any>(reflexable: NullableReflexable<T>): reflexable is Reflex<T> =>
    isFunction(reflexable) &&
    (reflexable as Reflex<T>)?._ref &&
    (reflexable as Reflex<T>)?._ref !== reflexable &&
    Object.getOwnPropertyNames((reflexable as Reflex<T>)?._ref).includes('current');

export const getReflexableRef = <T = any>(reflexable: Reflexable<T>): ReflexableRef<T> =>
    isReflex(reflexable) ? getReflexableRef(reflexable._ref) : reflexable;

export const bindAction = <T = any>(reflexable: Reflexable<T>, action: ReflexAction<T>) => {
    const [, actions] = getRecordFromRegistry(getReflexableRef(reflexable));
    actions.set(action, (actions.get(action) || 0) + 1);
};

export const unbindAction = <T = any>(reflexable: Reflexable<T>, action: ReflexAction<T>) => {
    const _ref = getReflexableRef(reflexable);
    const [, actions] = getRecordFromRegistry(_ref);
    const instances = actions.get(action) || 0;

    if (instances > 1) actions.set(action, instances - 1);
    else if (instances === 1) actions.delete(action);
    if (actions.size === 0) REGISTRY.delete(_ref);
};

export const registerReflexable = <T = any>(reflexable: Reflexable<T>, action?: ReflexAction<T>) => {
    const _ref = getReflexableRef(reflexable);

    if (!REGISTRY.has(_ref)) {
        if (!action) throw new Error('missing_reflex_action');

        let _current: T | null = null;
        const actions = new Map<ReflexAction<T>, number>().set(action, 1);
        const updateCurrent = isFunction(_ref)
            ? _ref
            : (instance: T | null) => {
                  _ref.current = instance;
              };

        const callbackRef = Object.defineProperties(
            (instance: T | null) => {
                if (_current === instance) return;
                const previous = _current;
                updateCurrent((_current = instance));
                for (const [action] of actions) action(_current, previous);
            },
            {
                _ref: { value: _ref },
                current: { get: () => _current },
            }
        ) as Reflex<T>;

        REGISTRY.set(_ref, [callbackRef, actions]);
    } else if (action) bindAction(_ref, action);

    return REGISTRY.get(_ref) as ReflexableRecord<T>;
};
