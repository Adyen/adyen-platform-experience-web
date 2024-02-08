import { IBalanceAccountBase } from '@src/types';

interface BalanceAccountsDisplayProps {
    balanceAccounts: IBalanceAccountBase[];
}

//TODO - Complete this component with the "expandable box component"
export const BalanceAccountsDisplay = ({ balanceAccounts }: BalanceAccountsDisplayProps) => {
    return <div>{balanceAccounts[0]?.id}</div>;
};
