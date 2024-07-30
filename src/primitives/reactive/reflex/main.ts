import type { Reflex, Reflexable, ReflexAction, ReflexContainer, ReflexRegister } from './types';
import type { DefinedNullable, Nullable } from '../../../utils/types';
import { isNullish, sameValue, struct } from '../../../utils';
import { assertReflexAction, unwrap } from './helpers';
import { $globalReflexRegister } from './register';
import { REF } from './constants';

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

export const createReflexContainer = <T = any>(register: ReflexRegister = $globalReflexRegister): ReflexContainer<T> => {
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
            register.unbind(_reflexable, _reflexAction);
        } catch {
            /* ignore exception for unknown ref */
        }
    };

    const _updateContainer = (action: ReflexAction<T>, reflexable?: Nullable<Reflexable<T>>) => {
        assertReflexAction<T>(action);

        if (_released) _refreshContainer(action);

        const currentReflexable = isNullish(reflexable) ? null : reflexable;

        if (_reflexAction === action && _reflexable === currentReflexable) {
            if (_reflex) return; // no further update required
        } else if (_reflexable) {
            if (sameValue(unwrap(_reflexable), unwrap(currentReflexable!))) {
                _reflex = register.bind(_reflexable, action);
                _unbindReflexAction();
                _reflexAction = action;
                return; // no further update required
            }

            _unbindReflexAction();
        }

        _reflexAction = action;

        _reflex = (_reflexable = currentReflexable) ? register.bind(_reflexable, _reflexAction) : createIsolatedFauxReflex(_reflexAction);
    };

    return struct<ReflexContainer<T>>({
        action: { get: () => _reflexAction },
        reflex: { get: () => _reflex },
        release: { value: _releaseContainer },
        update: { value: _updateContainer },
    });
};

export default createReflexContainer;
