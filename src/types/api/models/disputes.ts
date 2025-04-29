import { Schema } from '../utils';
import { components } from '../resources/DisputesResource';

export type IDispute = Schema<components, 'Dispute'>;
export type IDisputeListItem = Schema<components, 'DisputeListItem'>;
export type IDisputeDetail = Schema<components, 'DisputeDetailResponseDTO'>;
export type IDisputeStatusGroup = Schema<components, 'StatusGroup'>;
export type IDisputeDefenseDocument = Schema<components, 'ApplicableDefenseDocument'>;
