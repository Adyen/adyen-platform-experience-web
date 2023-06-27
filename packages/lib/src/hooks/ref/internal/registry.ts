import { CallbackRef, CallbackRefEffect, TrackableRef, TrackableRefArgument, TrackableRefRecord } from '../types';

const REGISTRY = new WeakMap<TrackableRef, TrackableRefRecord>();

const getRecord = <T = any>(ref: TrackableRef<T>) => {
    const record = REGISTRY.get(ref);
    if (!record) throw new ReferenceError('UNREGISTERED_REF');
    return record;
};

const isCallbackRef = <T = any>(ref: TrackableRefArgument<T>): ref is CallbackRef<T> =>
    typeof ref === 'function' &&
    (ref as CallbackRef<T>)?._ref &&
    (ref as CallbackRef<T>)?._ref !== ref &&
    Object.getOwnPropertyNames((ref as CallbackRef<T>)?._ref).includes('current');

export const getTrackedRef = <T = any>(ref: TrackableRefArgument<T>): TrackableRef<T> => {
    return isCallbackRef(ref) ? getTrackedRef(ref._ref) : ref;
};

export const attachEffect = <T = any>(ref: TrackableRefArgument<T>, effect: CallbackRefEffect<T>) => {
    const [, effects] = getRecord(getTrackedRef(ref));
    effects.set(effect, (effects.get(effect) || 0) + 1);
};

export const detachEffect = <T = any>(ref: TrackableRefArgument<T>, effect: CallbackRefEffect<T>) => {
    const _ref = getTrackedRef(ref);
    const [, effects] = getRecord(_ref);
    const instances = effects.get(effect) || 0;

    if (instances > 1) effects.set(effect, instances - 1);
    else if (instances === 1) effects.delete(effect);
    if (effects.size === 0) REGISTRY.delete(_ref);
};

export const registerRef = <T = any>(ref: TrackableRefArgument<T>, effect?: CallbackRefEffect<T>) => {
    const _ref = getTrackedRef(ref);

    if (!REGISTRY.has(_ref)) {
        if (!effect) throw new Error('MISSING_REF_EFFECT');

        let _current: T | null = null;
        const effects = new Map<CallbackRefEffect<T>, number>().set(effect, 1);
        const updateCurrent =
            typeof _ref === 'function'
                ? _ref
                : (instance: T | null) => {
                      _ref.current = instance;
                  };

        const callbackRef = Object.defineProperties(
            (instance: T | null) => {
                if (_current === instance) return;
                const previous = _current;
                updateCurrent((_current = instance));
                for (const [effect] of effects) effect(_current, previous);
            },
            {
                _ref: { value: _ref },
                current: { get: () => _current },
            }
        ) as CallbackRef<T>;

        REGISTRY.set(_ref, [callbackRef, effects]);
    } else if (effect) attachEffect(_ref, effect);

    return REGISTRY.get(_ref) as TrackableRefRecord<T>;
};
