import { createContext, toChildArray } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { ErrorMessageDisplay } from '../../../components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { AuthSession } from '../session/AuthSession';
import { componentAvailabilityErrors } from '../session/utils/sessionAwareComponentAvailability';
import { createConfigController } from '../setupConfig';
import { asyncNoop, EMPTY_OBJECT, isUndefined, noop } from '../../../utils';
import type { ConfigProviderProps } from '../types';

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

    useEffect(() => {
        return controller.connect(() => setStateVersion(count => count + 1));
    }, [controller]);

    return (
        <ConfigContext.Provider value={contextValue}>
            {!isUndefined(hasPermission) &&
                (hasPermission ? (
                    toChildArray(children)
                ) : (
                    <ErrorMessageDisplay
                        withImage
                        centered
                        title={'common.errors.somethingWentWrong'}
                        message={[componentAvailabilityErrors(type), 'common.errors.contactSupport']}
                    />
                ))}
        </ConfigContext.Provider>
    );
};

export const useConfigContext = () => useContext(ConfigContext);
export default useConfigContext;
