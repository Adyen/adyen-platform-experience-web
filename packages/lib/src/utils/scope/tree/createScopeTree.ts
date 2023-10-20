import { struct } from '@src/utils/common';
import { Scope, ScopeHandle, ScopeTree } from '../types';
import { append, disconnect, inTree, remove } from './utils';

const createScopeTree = <T = any>() => {
    let root: Scope<T> = null;

    const _create: ScopeTree<T>['add'] = (data, parent = null) => {
        const scope = struct({
            data: { value: data },
            next: { writable: true },
            prev: { writable: true },
        }) as NonNullable<Scope<T>>;

        root = append(scope, root, parent);

        return struct({
            _scope: { get: () => scope },
            attached: { get: () => inTree(scope, root) },
            data: { value: data },
            detach: {
                value: (isolatedDetach: boolean = false) => {
                    const isolation = (isolatedDetach as any) === true && scope !== root;
                    root = (isolation ? remove : disconnect)(scope, root);
                },
            },
        }) as ScopeHandle<T>;
    };

    return struct({
        add: { value: _create },
        trace: {
            *value(scope?: Scope<T>): ReturnType<ScopeTree<T>['trace']> {
                let _current = scope;

                while (_current) {
                    const current = yield _current;
                    _current = _current.prev || (current as Scope<T>);
                }
            },
        },
    }) as ScopeTree<T>;
};

export default createScopeTree;
