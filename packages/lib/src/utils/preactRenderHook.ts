import { options } from 'preact';
import { isFunction, noop, struct } from '@src/utils/common';

const RENDER_HOOKS = ['diffed', 'unmount', 'vnode'] as const;

const RENDER_HOOKS_WITH_DESCRIPTOR_ENTRIES = Object.fromEntries(
    RENDER_HOOKS.map(hook => {
        const _afterCallbacks = new Map<typeof _hook, () => void>();
        const _beforeCallbacks = new Map<typeof _hook, () => void>();
        const _hook = options[hook];

        const _registerCallback = (callback: typeof _hook, shouldRunAfter = false) => {
            if (!isFunction(callback)) return noop;

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

        options[hook] = vnode => {
            _beforeCallbacks.forEach((_, callback) => callback?.(vnode));
            _hook?.(vnode);
            _afterCallbacks.forEach((_, callback) => callback?.(vnode));
        };

        return [hook, { value: _registerCallback } as TypedPropertyDescriptor<typeof _registerCallback>] as const;
    })
);

const preactRenderHook = struct(RENDER_HOOKS_WITH_DESCRIPTOR_ENTRIES) as {
    [K in (typeof RENDER_HOOKS)[number]]: NonNullable<(typeof RENDER_HOOKS_WITH_DESCRIPTOR_ENTRIES)[K]['value']>;
};

export default preactRenderHook;
