import { struct } from '@src/utils/common';
import _useCoreContext from './_useCoreContext';
import _useCoreContextI18n from './_useCoreContextI18n';
import { CoreContextScope, CoreContextThis } from '../types';

export const [useCoreContext, useCoreContextI18n] = (() => {
    let _current: CoreContextScope;
    const _scopes = new Set<CoreContextScope>();
    const _stack = [] as CoreContextScope[];

    const __this__ = struct({
        stack: {
            value: (scope: CoreContextScope) => {
                const size = _scopes.size;

                if (_scopes.add(scope).size === size) {
                    throw new Error('Duplicate scope');
                }

                _stack.push((_current = scope));

                return () => {
                    if (scope !== _current) throw new Error('Illegal scope ejection');
                    _scopes.delete(_stack.pop() as CoreContextScope);
                    _current = _stack[_stack.length - 1] as CoreContextScope;
                };
            },
        },
    }) as CoreContextThis;

    return [_useCoreContext.bind(__this__), _useCoreContextI18n.bind(__this__)] as const;
})();

export default useCoreContext;
