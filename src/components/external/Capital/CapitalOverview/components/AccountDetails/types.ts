import { h } from 'preact';
import { AriaAttributes } from 'preact/compat';
import { IGBCapitalFundsCollection, IGrant, INLCapitalFundsCollection, IUSCapitalFundsCollection } from '../../../../../../types';
import { KeyOfRecord } from '../../../../../../utils/types';

export type BankAccount = NonNullable<IGrant['unscheduledRepaymentAccounts']>[number] &
    Partial<Omit<INLCapitalFundsCollection, 'region'> & Omit<IUSCapitalFundsCollection, 'region'> & Omit<IGBCapitalFundsCollection, 'region'>>;

export type BankAccountField = Exclude<KeyOfRecord<BankAccount>, 'order'>;

export interface AccountDetailsProps extends Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'> {
    bankAccount: BankAccount;
    className?: h.JSX.HTMLAttributes['className'];
}
