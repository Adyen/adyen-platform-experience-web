/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { render, screen, within } from '@testing-library/preact';
import { BALANCE_ACCOUNTS } from '../../../../../../mocks/mock-data';
import BalanceAccountSelector from './BalanceAccountSelector';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';

describe('BalanceAccountSelector', () => {
    type BalanceAccountSelectorWrapperProps = {
        balanceAccounts: NonNullable<Parameters<typeof useBalanceAccountSelection>[0]['balanceAccounts']>;
    };

    const BALANCE_ACCOUNTS_WITHOUT_DESCRIPTION = BALANCE_ACCOUNTS.map(({ description, ...account }) => account);

    const BalanceAccountSelectorWrapper = ({ balanceAccounts }: BalanceAccountSelectorWrapperProps) => {
        const { balanceAccountSelectionOptions } = useBalanceAccountSelection({ balanceAccounts });
        return (
            <BalanceAccountSelector
                balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                activeBalanceAccount={balanceAccounts[0]}
                onBalanceAccountSelection={() => {}}
            />
        );
    };

    test('should render selected balance account with description (if available)', () => {
        render(<BalanceAccountSelectorWrapper balanceAccounts={[...BALANCE_ACCOUNTS]} />);

        const activeBalanceAccountDescription = BALANCE_ACCOUNTS[0]?.description!;
        const buttonTextElement = within(screen.getByRole('button')).getByText(activeBalanceAccountDescription);

        expect(buttonTextElement).toBeInTheDocument();
        expect(buttonTextElement).toBeVisible();
    });

    test('should render selected balance account with id (if description is missing)', () => {
        render(<BalanceAccountSelectorWrapper balanceAccounts={BALANCE_ACCOUNTS_WITHOUT_DESCRIPTION} />);

        const activeBalanceAccountId = BALANCE_ACCOUNTS_WITHOUT_DESCRIPTION[0]?.id!;
        const buttonTextElement = within(screen.getByRole('button')).getByText(activeBalanceAccountId);

        expect(buttonTextElement).toBeInTheDocument();
        expect(buttonTextElement).toBeVisible();
    });
});
