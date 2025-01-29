import { FunctionalComponent } from 'preact';
import { EMPTY_ARRAY } from '../../../../../utils';
import { GrantDetailsViewHeader } from './GrantDetailsViewHeader';
import type { GrantDetailsViewProps } from './types';

export const GrantEarlyRepaymentDetails: FunctionalComponent<GrantDetailsViewProps> = ({ grant, onDetailsClose }) => {
    const bankAccounts = grant.earlyRepaymentAccounts ?? EMPTY_ARRAY;

    return bankAccounts.length ? (
        <div>
            <GrantDetailsViewHeader
                onDetailsClose={onDetailsClose}
                titleKey={'capital.earlyRepayment'}
                subtitleKey={'capital.earlyRepaymentInstruction'}
            />
        </div>
    ) : null;
};
