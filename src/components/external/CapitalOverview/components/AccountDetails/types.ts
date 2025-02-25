import { h } from 'preact';
import { IGrant } from '../../../../../types';
import { KeyOfRecord, ValueOfRecord } from '../../../../../utils/types';

export type BankAccount = NonNullable<IGrant['unscheduledRepaymentAccounts']>[number];
export type BankAccountIdentification = Required<BankAccount>['accountIdentification'];
export type BankAccountField = KeyOfRecord<BankAccountIdentification> | 'region';
export type BankAccountFieldValue = ValueOfRecord<BankAccountIdentification> | BankAccount['region'];

export interface AccountDetailsProps {
    bankAccount: BankAccount;
    className?: h.JSX.HTMLAttributes['className'];
}
