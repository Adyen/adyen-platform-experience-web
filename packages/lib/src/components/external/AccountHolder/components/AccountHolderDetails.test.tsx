/**
 * @vitest-environment jsdom
 */
import AccountHolderDetails from './AccountHolderDetails';
import { render, within } from '@testing-library/preact';
import { describe, test } from 'vitest';
import { ACCOUNT_HOLDER_1 } from '../../../../../../../mocks';
import { noop } from '@src/utils/common';

describe('AccountHolder component', () => {
    test('shows the Account holder ID', async () => {
        const screen = render(<AccountHolderDetails accountHolder={ACCOUNT_HOLDER_1} onChange={noop} />);
        const accountHolderId = screen.getByRole('listitem', { name: 'Account holder ID' });
        within(accountHolderId).getByText(ACCOUNT_HOLDER_1.id);
    });

    test('shows the status', async () => {
        const screen = render(<AccountHolderDetails accountHolder={ACCOUNT_HOLDER_1} onChange={noop} />);

        const status = screen.getByRole('listitem', { name: 'Status' });
        within(status).getByText(new RegExp(ACCOUNT_HOLDER_1.status, 'i'));
    });

    test('shows the legal entity details', async () => {
        const screen = render(<AccountHolderDetails accountHolder={ACCOUNT_HOLDER_1} onChange={noop} />);

        screen.getByText('Legal entity');

        screen.getByText('Legal entity ID');
        screen.getByText(ACCOUNT_HOLDER_1.legalEntityId);

        screen.getByText('Description');
        screen.getByText(ACCOUNT_HOLDER_1.description);
    });

    test('shows the contact details', async () => {
        const screen = render(<AccountHolderDetails accountHolder={ACCOUNT_HOLDER_1} onChange={noop} />);

        screen.getByText('Contact details');
        screen.getByText(ACCOUNT_HOLDER_1.contactDetails.phone.number);
        screen.getByText(ACCOUNT_HOLDER_1.contactDetails.email);
        screen.getByText('Simon Carmiggeltstraat 6, 12336750');
        screen.getByText('Amsterdam, NL');
    });
});
