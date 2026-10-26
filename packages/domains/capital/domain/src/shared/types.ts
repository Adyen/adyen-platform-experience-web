import type { DomainTranslationKey } from '@integration-components/core';
import type { IGrant } from '@integration-components/types';

export type OnFundsRequestCallback = (data: IGrant, renewsGrantId?: IGrant['id']) => void;

export type CapitalTranslationKey = DomainTranslationKey<'capital'>;
