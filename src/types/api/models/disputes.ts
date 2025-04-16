import { Schema } from '../utils';
import { components } from '../resources/DisputesResource';

export type IDispute = Schema<components, 'Dispute'>;
export type IDisputeDetail = Schema<components, 'DisputeDetailResponse'>;
export type IDisputeDefenseDocument = Schema<components, 'ApplicableDefenseDocument'>;
