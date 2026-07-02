import { IGrant } from '@integration-components/types';

export type OnFundsRequestCallback = (data: IGrant, renewsGrantId?: IGrant['id']) => void;
