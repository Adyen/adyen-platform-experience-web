import { h } from 'preact';
import { IGrant } from '../../../../../types';
import { KeyOfRecord, ValueOfRecord } from '../../../../../utils/types';

export type BankAccount = NonNullable<IGrant['unscheduledRepaymentAccounts']>[number];
export type BankAccountField = KeyOfRecord<BankAccount['bankAccountIdentification']> | 'region';
export type BankAccountFieldValue = ValueOfRecord<BankAccount['bankAccountIdentification']> | BankAccount['region'];

export interface AccountDetailsProps {
    bankAccount: BankAccount;
    className?: h.JSX.HTMLAttributes['className'];
}
