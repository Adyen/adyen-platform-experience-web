import { Schema } from '../utils';
import { components } from '../resources/DisputesResource';

export type IDispute = Schema<components, 'Dispute'>;
export type IDisputeDetail = Schema<components, 'DisputeDetailResponse'>;
export type IDisputeListResponse = Schema<components, 'DisputeListResponse'>;
export type IDisputeListItem = Schema<components, 'DisputeListItem'>;
export type IDisputeReasonCategory = Schema<components, 'DisputeCategory'>;
export type IDisputeStatusGroup = Schema<components, 'StatusGroup'>;
export type IDisputeStatus = Schema<components, 'DisputeStatus'>;
export type IDisputeDefensibility = Schema<components, 'Defensibility'>;
export type IDisputeType = Schema<components, 'DisputeType'>;
export type IDisputeDefenseDocument = Schema<components, 'ApplicableDefenseDocument'>;
