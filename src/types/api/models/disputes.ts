import { Schema } from '../utils';
import { components, operations } from '../resources/DisputesResource';

export type IDispute = Schema<components, 'Dispute'>;
export type IDisputeDetail = Schema<components, 'DisputeDetailResponse'>;
export type IDisputeStatusGroup = operations['getDisputes']['parameters']['query']['statusGroup'];
