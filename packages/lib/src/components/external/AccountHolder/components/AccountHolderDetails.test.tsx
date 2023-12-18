/**
 * @vitest-environment jsdom
 */
import { render, within } from '@testing-library/preact';
import { describe, test } from 'vitest';
import { ACCOUNT_HOLDER_1 } from '../../../../../../../mocks';
import { AccountHolderInfo } from '@src/components/external/AccountHolder/components/AccountHolderInfo';

describe('AccountHolder component', () => {
    test('shows the Account holder ID', async () => {
        const screen = render(<AccountHolderInfo accountHolder={ACCOUNT_HOLDER_1} />);
        const accountHolderId = screen.getByRole('listitem', { name: 'Account holder ID' });
        within(accountHolderId).getByText(ACCOUNT_HOLDER_1.id);
    });

    test('shows the status', async () => {
        const screen = render(<AccountHolderInfo accountHolder={ACCOUNT_HOLDER_1} />);

        const status = screen.getByRole('listitem', { name: 'Status' });
        within(status).getByText(new RegExp(ACCOUNT_HOLDER_1.status!, 'i'));
    });

    test('shows the legal entity details', async () => {
        const screen = render(<AccountHolderInfo accountHolder={ACCOUNT_HOLDER_1} />);

        screen.getByText('Legal entity');

        screen.getByText('Legal entity ID');
        screen.getByText(ACCOUNT_HOLDER_1.legalEntityId);

        screen.getByText('Description');
        screen.getByText(ACCOUNT_HOLDER_1.description!);
    });

    test('shows the contact details', async () => {
        const screen = render(<AccountHolderInfo accountHolder={ACCOUNT_HOLDER_1} />);

        screen.getByText('Contact details');
        screen.getByText(ACCOUNT_HOLDER_1.contactDetails!.phone.number);
        screen.getByText(ACCOUNT_HOLDER_1.contactDetails!.email);
        screen.getByText('Simon Carmiggeltstraat 6, 12336750');
        screen.getByText('Amsterdam, NL');
    });
});
