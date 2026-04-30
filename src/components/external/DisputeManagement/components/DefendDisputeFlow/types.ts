import { ValidationError } from '@integration-components/ui-primitives-preact/FormFields/FileInput/types';

export type MapErrorCallback = (error: ValidationError, file?: { type: string; size: number }) => string;
