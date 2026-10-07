import type { ExternalComponentType } from '@integration-components/types';
import type { SetupContextObject } from '../../ConfigContext.types';
import type { AuthSession } from '../../session/AuthSession';

export interface ConfigContextValue {
    readonly endpoints: SetupContextObject['endpoints'];
    readonly extraConfig: SetupContextObject['extraConfig'];
    readonly hasError: boolean;
    readonly refreshing: boolean;
    /** The permission check failed. Domain components render the error through the availability gate. */
    readonly componentUnavailable: boolean;
    /** The permission check has not resolved, so no endpoint is callable yet. */
    readonly permissionPending: boolean;
    refresh: AuthSession['refresh'];
}

export interface ConfigProviderProps {
    session: AuthSession;
    type?: ExternalComponentType;
}
