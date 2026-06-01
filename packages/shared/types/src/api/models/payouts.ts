import { Schema } from '../utils';
import { components } from '../resources/PayoutsResourceV1';

export type IPayout = Schema<components, 'PayoutDTO'>;

export type IPayoutDetails = Schema<components, 'PayoutResponseDTO'>;
