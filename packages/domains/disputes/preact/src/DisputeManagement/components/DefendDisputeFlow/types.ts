import { ValidationError } from '@integration-components/ui-components-preact/FormFields/FileInput/types';

export type MapErrorCallback = (error: ValidationError, file?: { type: string; size: number }) => string;
