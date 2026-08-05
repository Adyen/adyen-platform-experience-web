import { boolOrFalse } from '@integration-components/utils';
import componentAvailabilityRegistry from './helpers/componentAvailabilityRegistry';
import type { ExternalComponentType } from '@integration-components/types';
import AuthSession from '../../AuthSession';
import sessionReady from '../sessionReady';

interface SessionAwareComponentAvailabilityOptions {
    waitForSession?: boolean;
}

const sessionAwareComponentAvailability = async (
    type: ExternalComponentType,
    session: AuthSession,
    { waitForSession = true }: SessionAwareComponentAvailabilityOptions = {}
) => {
    if (waitForSession) await sessionReady(session);
    return boolOrFalse(await componentAvailabilityRegistry[type]?.(session.context));
};

export default sessionAwareComponentAvailability;
