import { Schema } from '@src/types/api/utils';
import { components } from '@src/types/api/resources/PayoutsResource';

export type IPayout = Schema<components, 'PayoutDTO'>;

export type IPayoutDetails = Schema<components, 'PayoutResponseDTO'>;
