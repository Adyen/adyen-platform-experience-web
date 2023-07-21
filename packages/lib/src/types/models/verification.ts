export type Verification = 'pending' | 'invalid' | 'valid' | 'rejected';

type VerificationErrorType = 'dataMissing' | 'invalidInput' | 'pendingStatus';
interface VerificationError {
    code: string;
    message: string;
    type: VerificationErrorType;
    subErrors?: VerificationError[];
    remediatingActions?: VerificationError[];
}

type EntityType = 'BankAccount' | 'LegalEntity' | 'Documents';

export interface Problem {
    entity: {
        id: string;
        type: EntityType;
        owner?: {
            id: string;
            type: EntityType;
        };
    };
    verificationErrors: VerificationError[];
}
