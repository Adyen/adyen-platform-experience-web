import { BankAccount } from './bankAccount';

export type TransferInstrumentOv = { accountIdentifier?: string; id: string; realLastFour?: string; trustedSource: boolean };

export interface TransferInstrument {
    id: string;
    legalEntityId: string;
    bankAccount: BankAccount;
    type: 'bankAccount';
    documentDetails?: {
        id: string;
    }[];
}
