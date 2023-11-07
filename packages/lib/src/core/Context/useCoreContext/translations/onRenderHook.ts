import { options } from 'preact';
import { noop } from '@src/utils/common';

const _onRenderHook = (() => {
    const _afterCallbacks = new Map<typeof _diffed, () => void>();
    const _beforeCallbacks = new Map<typeof _diffed, () => void>();
    const _diffed = options.diffed;

    options.diffed = vnode => {
        _beforeCallbacks.forEach((_, callback) => callback?.(vnode));
        _diffed?.(vnode);
        _afterCallbacks.forEach((_, callback) => callback?.(vnode));
    };

    return (callback: typeof _diffed, shouldRunAfter = false) => {
        if (typeof callback !== 'function') return noop;

        const _remove =
            _afterCallbacks.get(callback) ||
            _beforeCallbacks.get(callback) ||
            (() => {
                _afterCallbacks.delete(callback);
                _beforeCallbacks.delete(callback);
            });

        if ((shouldRunAfter as any) === true) {
            _beforeCallbacks.delete(callback);
            _afterCallbacks.set(callback, _remove);
        } else {
            _afterCallbacks.delete(callback);
            _beforeCallbacks.set(callback, _remove);
        }

        return _remove;
    };
})();

export default _onRenderHook;
