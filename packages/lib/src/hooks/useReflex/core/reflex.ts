import { REF } from '../constants';
import $registry from './registry';
import type { DefinedNullable, Nullable, Reflex, Reflexable, ReflexAction, ReflexContainer } from '../types';
import { assertReflexAction, unwrap } from './utils';
import { sameValue, struct } from '../../../utils/common';

export const createIsolatedFauxReflex = <T = any>(action: ReflexAction<T>): Reflex<T> => {
    assertReflexAction<T>(action);

    const $actions = new WeakMap<ReflexAction<T>, number>([[action, 1]]);

    const reflex = (instance => {
        if (sameValue(_current, instance)) return;
        const previous = _current;
        action((_current = instance), previous);
    }) as Reflex<T>;

    let _current: Nullable<T> = null;

    return Object.defineProperties(reflex, {
        [REF]: { value: reflex },
        actions: {
            value: struct({
                get: { value: $actions.get.bind($actions) },
                size: { value: 1 },
            }),
        },
        current: {
            get: () => _current,
            set: reflex,
        },
    });
};

export const createReflexContainer = <T = any>(): ReflexContainer<T> => {
    let _reflex: Nullable<Reflex<T>>;
    let _reflexable: DefinedNullable<Reflexable<T>> = null;
    let _reflexAction: ReflexAction<T>;
    let _released = false;

    const _refreshContainer = (action: ReflexAction<T>) => {
        _reflex = undefined;
        _reflexable = null;
        _reflexAction = action;
        _released = false;
    };

    const _releaseContainer = () => {
        if (!_released) {
            _unbindReflexAction();
            _released = true;
        }
    };

    const _unbindReflexAction = () => {
        try {
            if (!_reflexable) return;
            $registry.unbind(_reflexable, _reflexAction);
        } catch {
            /* ignore exception for unknown ref */
        }
    };

    const _updateContainer = (action: ReflexAction<T>, reflexable?: Nullable<Reflexable<T>>) => {
        assertReflexAction<T>(action);

        if (_released) _refreshContainer(action);

        const currentReflexable = reflexable == undefined ? null : reflexable;

        if (_reflexAction === action && _reflexable === currentReflexable) {
            if (_reflex) return; // no further update required
        } else if (_reflexable) {
            if (sameValue(unwrap(_reflexable), unwrap(currentReflexable as Reflexable<T>))) {
                _reflex = $registry.bind(_reflexable, action);
                _unbindReflexAction();
                _reflexAction = action;
                return; // no further update required
            }

            _unbindReflexAction();
        }

        _reflexAction = action;

        _reflex = (_reflexable = currentReflexable) ? $registry.bind(_reflexable, _reflexAction) : createIsolatedFauxReflex(_reflexAction);
    };

    return struct({
        action: { get: () => _reflexAction },
        reflex: { get: () => _reflex },
        release: { value: _releaseContainer },
        update: { value: _updateContainer },
    }) as ReflexContainer<T>;
};

export default createReflexContainer;
