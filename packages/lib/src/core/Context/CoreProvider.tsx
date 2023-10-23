import { toChildArray } from 'preact';
import { memo } from 'preact/compat';
import { useEffect, useMemo } from 'preact/hooks';
import { CoreContext } from './CoreContext';
import { CoreProviderProps } from './types';
import memoComparator from '@src/utils/memoComparator';
import { EMPTY_OBJECT } from '@src/utils/common';
import useCoreContextI18n from './useCoreContext/_useCoreContextI18n';
import useDefinedValue from '@src/hooks/useDefinedValue';
import Localization from '@src/core/Localization';

const asString = <T extends string>(value?: T) => value ?? '';
const asObject = <T extends {}>(value?: T) => value || (EMPTY_OBJECT as T);

/**
 * CoreProvider Component
 * Wraps a component delaying the render until after the i18n module is fully loaded
 */
const CoreProvider = ({ children, i18n: _i18n, commonProps: _commonProps, loadingContext: _loadingContext }: CoreProviderProps) => {
    const [i18n, unmount] = useCoreContextI18n(useDefinedValue(() => new Localization().i18n, _i18n));
    const commonProps = useMemo(() => asObject(_commonProps), [_commonProps]);
    const loadingContext = useMemo(() => asString(_loadingContext), [_loadingContext]);

    useEffect(() => unmount, []);

    return <CoreContext.Provider value={{ i18n, commonProps, loadingContext }}>{toChildArray(children)}</CoreContext.Provider>;
};

export default memo(
    CoreProvider,
    memoComparator({
        clientKey: asString,
        commonProps: asObject,
        loadingContext: asString,
    })
);
