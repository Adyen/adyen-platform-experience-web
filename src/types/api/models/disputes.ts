import { Schema } from '../utils';
import { components, operations } from '../resources/DisputesResource';

export type IDispute = Schema<components, 'Dispute'>;
export type IDisputeDetail = Schema<components, 'DisputeDetailResponse'>;
export type IDisputeStatusGroup = operations['getDisputeList']['parameters']['query']['statusGroup'];
export type IDisputeDefenseDocument = Schema<components, 'ApplicableDefenseDocument'>;
