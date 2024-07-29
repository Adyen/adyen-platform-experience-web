import { Schema } from '../utils';
import { components } from '../resources/PayoutsResource';

export type IPayout = Schema<components, 'PayoutDTO'>;

export type IPayoutDetails = Schema<components, 'PayoutResponseDTO'>;
