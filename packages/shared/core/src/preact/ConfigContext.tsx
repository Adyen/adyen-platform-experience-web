import { createContext, toChildArray } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { AuthSession } from '../session/AuthSession';
import componentAvailabilityErrors from '../session/utils/sessionAwareComponentAvailability/helpers/componentAvailabilityErrors';
import { createConfigController } from '../setupConfig';
import type { ConfigProviderProps } from '../ConfigContext.types';
import { asyncNoop, EMPTY_OBJECT, isUndefined, noop } from '@integration-components/utils';
import Localization from '../Localization';

const ConfigContext = createContext<AuthSession['context'] & Pick<AuthSession, 'http' | 'refresh'>>({
    endpoints: EMPTY_OBJECT,
    extraConfig: EMPTY_OBJECT,
    hasError: false,
    http: asyncNoop,
    isExpired: undefined,
    isFrozen: false,
    refresh: noop,
    refreshing: false,
});

export const ConfigProvider = ({ children, session, type }: ConfigProviderProps) => {
    const [, setStateVersion] = useState(0);
    const controller = useMemo(() => createConfigController(session, type), [session, type]);
    const { contextValue, hasPermission } = controller.getSnapshot();
    const i18n = useMemo(() => new Localization().i18n, []);

    useEffect(() => {
        return controller.connect(() => setStateVersion(count => count + 1));
    }, [controller]);

    return (
        <ConfigContext.Provider value={contextValue}>
            {!isUndefined(hasPermission) &&
                (hasPermission ? (
                    toChildArray(children)
                ) : (
                    <div role="alert">
                        <strong>{i18n.get('common.errors.somethingWentWrong')}</strong>
                        <p>
                            {i18n.get(componentAvailabilityErrors(type))}
                            <br />
                            {i18n.get('common.errors.contactSupport')}
                        </p>
                    </div>
                ))}
        </ConfigContext.Provider>
    );
};

export const useConfigContext = () => useContext(ConfigContext);
export default useConfigContext;
