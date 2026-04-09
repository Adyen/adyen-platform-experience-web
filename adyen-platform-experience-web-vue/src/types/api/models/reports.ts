import { Schema } from '../utils';
import { components } from '../resources/ReportsResource';

export type IReport = Schema<components, 'GeneratedReport'>;
export type ReportsListResponse = Schema<components, 'ReportsListResponseDTO'>;
