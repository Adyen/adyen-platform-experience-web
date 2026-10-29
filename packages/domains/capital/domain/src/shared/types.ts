import type { DomainTranslationKey } from '@integration-components/core';
import type { IGrant } from '@integration-components/types';

export type OnSubmit = (data: IGrant, renewsGrantId?: IGrant['id']) => void;

export type CapitalTranslationKey = DomainTranslationKey<'capital'>;
