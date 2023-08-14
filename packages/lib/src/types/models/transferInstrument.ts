import type { BankAccount } from './bankAccount';
import type { Problem } from './verification';

export type TransferInstrumentOv = { accountIdentifier?: string; id: string; realLastFour?: string; trustedSource: boolean };

export interface TransferInstrument {
    id: string;
    legalEntityId: string;
    bankAccount: BankAccount;
    type: string;
    documentDetails?: {
        id: string;
        active: boolean;
        description?: string;
        fileName: string;
        modificationDate: string;
        pages: {
            pageName: string;
            pageNumber: string;
            type: string;
        }[];
        type: string;
    }[];
    problems?: Problem[];
}
