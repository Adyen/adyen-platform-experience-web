import { h } from 'preact';
import { IGrant } from '../../../../../types';
import { KeyOfRecord } from '../../../../../utils/types';

export type BankAccount = NonNullable<IGrant['unscheduledRepaymentAccounts']>[number];
export type BankAccountField = Exclude<KeyOfRecord<BankAccount>, 'order'>;

export interface AccountDetailsProps {
    bankAccount: BankAccount;
    className?: h.JSX.HTMLAttributes['className'];
}
