import { ExternalComponentType } from '../../../../../components/types';
import AuthSession from '../../AuthSession';

export type SessionAwareAvailabilityCallback = (context: AuthSession['context']) => boolean | Promise<boolean>;
export type ExternalComponentAvailabilityRegistry = Record<ExternalComponentType, SessionAwareAvailabilityCallback>;
