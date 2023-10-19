import { struct } from '@src/utils/common';
import { Scope, ScopeChain, ScopeChainOperation, ScopeHandle } from './types';

const createScopeChain = (() => {
    const _isChained = <T = any>(scope: NonNullable<Scope<T>>, root: Scope<T> = null): boolean =>
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

    return <T = any>() => {
        let root: Scope<T> = null;
        let current: Scope<T> = null;
        let size: number = 0;

        const _createScope: ScopeChain<T>['add'] = data => {
            const beforeCurrentScope = current;

            const scope = struct({
                data: { value: data },
                next: { writable: true },
                prev: { writable: true },
            }) as NonNullable<Scope<T>>;

            [root, current] = _append(scope, root, current);

            if (beforeCurrentScope !== current) size++;

            return struct({
                chained: { get: () => _isChained(scope, root) },
                data: { value: data },
                detach: {
                    value: (isolatedDetach: boolean = false) => {
                        const _root = root;
                        const _current = current;
                        const isolation = (isolatedDetach as any) === true;

                        [root, current] = (isolation ? _remove : _truncateAt)(scope, root, current);

                        if (root === _root && current === _current) return;

                        if (isolation) size--;
                        else if (root === current) size = root === null ? 0 : 1;
                        else {
                            size = 0;
                            let _current = root;
                            while (_current && size++) _current = _current.next;
                        }
                    },
                },
            }) as ScopeHandle<T>;
        };

        return struct({
            size: { get: () => size },
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
