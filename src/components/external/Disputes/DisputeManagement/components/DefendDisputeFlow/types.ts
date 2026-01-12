import { ValidationError } from '../../../../../internal/FormFields/FileInput/types';

export type MapErrorCallback = (error: ValidationError, file?: { type: string; size: number }) => string;
