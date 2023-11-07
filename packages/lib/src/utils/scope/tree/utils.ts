import { Scope, ScopeWithPrev } from '../types';

export const append = <T = any>(scope: NonNullable<Scope<T>>, root: Scope<T> = null, parent: Scope<T> = null): Scope<T> => {
    if (parent) {
        scope.next = null;
        scope.prev = parent;
        (parent.next = parent.next || new Set()).add(scope as ScopeWithPrev<T>);
    } else {
        scope.next = scope.prev = null;
        root = scope;
    }

    return root;
};

export const inTree = <T = any>(scope: Scope<T>, root: Scope<T> = null): boolean => {
    if (scope === root) return !!scope;
    let _scope: Scope<T> | undefined = scope;
    while ((_scope = _scope?.prev)) if (_scope === root) return true;
    return false;
};

const _disconnect =
    (routine: <T = any>(scope: NonNullable<Scope<T>>) => void) =>
    <T = any>(scope: NonNullable<Scope<T>>, root: Scope<T> = null): Scope<T> => {
        if (inTree(scope, root)) {
            if (scope.prev && scope.prev.next) {
                scope.prev.next.delete(scope as ScopeWithPrev<T>);
                if (scope.prev.next.size === 0) scope.prev.next = null;
            }

            if (scope.next) routine<T>(scope);

            scope.next?.clear();
            scope.next = scope.prev = null;
            if (scope === root) root = scope.next;
        }

        return root;
    };

export const disconnect = _disconnect(scope => {
    const stack = [scope];

    while (stack.length) {
        const scope = stack.pop();

        if (!scope?.next) continue;

        scope.next.forEach(childScope => {
            childScope.prev = null as unknown as typeof scope;
            stack.push(childScope);
        });

        scope.next.clear();
        scope.next = null;
    }
});

export const remove = _disconnect(scope => {
    const prev = scope.prev as typeof scope;
    let prevChildren = prev?.next;

    if (scope.prev && !prevChildren) {
        prevChildren = scope.prev.next = scope.prev.next || new Set();
    }

    scope.next?.forEach(childScope => {
        prevChildren?.add(childScope);
        childScope.prev = prev;
    });
});
