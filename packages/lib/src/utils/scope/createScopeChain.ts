import { struct } from '@src/utils/common';
import { Scope, ScopeChain, ScopeChainOperation, ScopeProxy } from './types';

const createScopeChain = (() => {
    const _isChained = <T extends {} = {}>(scope: NonNullable<Scope<T>>, root: Scope<T> = null): boolean =>
        scope.next !== scope.prev || (scope.prev === null && scope === root);

    const _append = ((scope, root = null, current = null) => {
        if (!current) {
            scope.next = scope.prev = null;
            current = root = scope;
        } else {
            scope.next = null;
            scope.prev = current;
            current = current.next = scope;
        }

        return [root, current] as const;
    }) as ScopeChainOperation;

    const _remove = ((scope, root = null, current = null) => {
        if (_isChained(scope, root)) {
            if (scope.next) scope.next.prev = scope.prev;
            if (scope.prev) scope.prev.next = scope.next;

            if (scope === current) current = scope.prev;
            if (scope === root) root = scope.next;

            scope.next = scope.prev = null;
        }

        return [root, current];
    }) as ScopeChainOperation;

    const _truncateAt = ((scope, root = null, current) => {
        if (_isChained(scope, root)) {
            if (scope.prev) {
                current = scope.prev;
                current.next = null;
            } else current = root = null;

            scope.next = scope.prev = null;
        }

        return [root, current];
    }) as ScopeChainOperation;

    return <T extends {} = {}>() => {
        let root: Scope<T> = null;
        let current: Scope<T> = null;

        const _createScope: ScopeChain<T>['add'] = (data?: T) => {
            const extendedPropDescriptors = data && Object.getOwnPropertyDescriptors(data);
            let scopeIsDetached = true;

            const scope = struct({
                ...extendedPropDescriptors,
                next: { writable: true },
                prev: { writable: true },
            }) as NonNullable<Scope<T>>;

            const scopeProxy = struct({
                ...extendedPropDescriptors,
                chained: { get: () => !scopeIsDetached },
                next: { get: () => scope.next },
                prev: { get: () => scope.prev },
            }) as ScopeProxy<T>;

            [root, current] = _append(scope, root, current);

            const detachScope = (isolatedDetach: boolean = false) => {
                [root, current] = ((isolatedDetach as any) === true ? _remove : _truncateAt)(scope, root, current);
                scopeIsDetached = false;
            };

            return [scopeProxy, detachScope] as const;
        };

        return struct({
            add: { value: _createScope },
            current: {
                *get(): ScopeChain<T>['current'] {
                    let _current = current;

                    while (_current) {
                        const current = yield _current;
                        _current = _current.prev || (current as Scope<T>);
                    }
                },
            },
        }) as ScopeChain<T>;
    };
})();

export default createScopeChain;
