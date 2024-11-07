import { boolOrFalse } from '../../../../../utils';
import componentAvailabilityRegistry from './helpers/componentAvailabilityRegistry';
import type { ExternalComponentType } from '../../../../../components/types';
import AuthSession from '../../AuthSession';
import sessionReady from '../sessionReady';

const sessionAwareComponentAvailability = async (type: ExternalComponentType, session: AuthSession) => {
    await sessionReady(session);
    return boolOrFalse(await componentAvailabilityRegistry[type]?.(session.context));
};

export default sessionAwareComponentAvailability;
