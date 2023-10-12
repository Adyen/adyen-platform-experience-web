import { struct } from '@src/utils/common';
import _useCoreContext from './_useCoreContext';
import _useCoreContextI18n from './_useCoreContextI18n';

export const [useCoreContext, useCoreContextI18n] = (() => {
    const __SECRET__ = struct();
    return [_useCoreContext.bind(__SECRET__), _useCoreContextI18n.bind(__SECRET__)] as const;
})();

export default useCoreContext;
