import { Schema } from '../utils';
import { components } from '../resources/DisputesResource';

export type IDispute = Schema<components, 'Dispute'>;
export type IDisputeDetail = Schema<components, 'DisputeDetailResponseDTO'>;
export type IDisputeListResponse = Schema<components, 'DisputeListResponseDTO'>;
export type IDisputeListItem = Schema<components, 'DisputeListItem'>;
export type IDisputeStatusGroup = Schema<components, 'StatusGroup'>;
export type IDisputeStatus = Schema<components, 'DisputeStatus'>;
export type IDisputeType = Schema<components, 'DisputeType'>;
export type IDisputeDefenseDocument = Schema<components, 'ApplicableDefenseDocument'>;
export type IApplicableDefenseDocument = Schema<components, 'ApplicableDefenseDocument'>;
export type IDisputeDefenseDocument = Schema<components, 'ApplicableDefenseDocument'>;
