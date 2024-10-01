/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/preact';
import { describe, test, expect } from 'vitest';
import { GrantItem } from './GrantItem';
import {
    ACTIVE_GRANT,
    ACTIVE_UNREPAID_GRANT,
    FAILED_GRANT,
    PENDING_GRANT,
    REPAID_GRANT,
    REVOKED_GRANT,
    WRITTEN_OFF_GRANT,
} from '../../../../../../mocks/mock-data';

const dateRegex = /^[A-Z][a-z]{2} \d{2}, \d{4}$/;

describe('GrantItem', () => {
    test('renders active grant', () => {
        render(<GrantItem grant={ACTIVE_GRANT} />);

        const container = screen.getByTestId('grant-container');
        expect(container).not.toHaveClass('adyen-pe-card--filled');

        const termEndsLabel = screen.getByText('Term ends:');
        const repaymentPeriodEndDate = screen.getByText(dateRegex);
        expect(termEndsLabel).toBeInTheDocument();
        expect(repaymentPeriodEndDate).toBeInTheDocument();

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toHaveTextContent('Repaid');
        expect(amountLabel).toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$11,870.00');
        expect(amount).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '1187000');
        expect(progressBar).toHaveAttribute('aria-valuemax', '2000000');
    });

    test('renders active unrepaid grant', () => {
        render(<GrantItem grant={ACTIVE_UNREPAID_GRANT} />);

        const container = screen.getByTestId('grant-container');
        expect(container).not.toHaveClass('adyen-pe-card--filled');

        const termEndsLabel = screen.getByText('Term ends:');
        const repaymentPeriodEndDate = screen.getByText(dateRegex);
        expect(termEndsLabel).toBeInTheDocument();
        expect(repaymentPeriodEndDate).toBeInTheDocument();

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toHaveTextContent('Initial funds');
        expect(amountLabel).toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$20,000.00');
        expect(amount).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '2000000');
    });

    test('renders failed grant', () => {
        render(<GrantItem grant={FAILED_GRANT} />);

        const container = screen.getByTestId('grant-container');
        expect(container).not.toHaveClass('adyen-pe-card--filled');

        const status = screen.getByText('Failed');
        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('adyen-pe-tag--error');

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toHaveTextContent('Requested funds');
        expect(amountLabel).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$20,000.00');
        expect(amount).toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.queryByRole('progressbar');
        expect(progressBar).not.toBeInTheDocument();
    });

    test('renders pending grant', () => {
        render(<GrantItem grant={PENDING_GRANT} />);

        const container = screen.getByTestId('grant-container');
        expect(container).not.toHaveClass('adyen-pe-card--filled');

        const status = screen.getByText('Pending');
        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('adyen-pe-tag--default');

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toHaveTextContent('Requested funds');
        expect(amountLabel).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$20,000.00');
        expect(amount).toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.queryByRole('progressbar');
        expect(progressBar).not.toBeInTheDocument();
    });

    test('renders repaid grant', () => {
        render(<GrantItem grant={REPAID_GRANT} />);

        const container = screen.getByTestId('grant-container');
        expect(container).toHaveClass('adyen-pe-card--filled');

        const status = screen.getByText('Fully repaid');
        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('adyen-pe-tag--light');

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toHaveTextContent('Initial funds');
        expect(amountLabel).toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$20,000.00');
        expect(amount).toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.queryByRole('progressbar');
        expect(progressBar).not.toBeInTheDocument();
    });

    test('renders revoked grant', () => {
        render(<GrantItem grant={REVOKED_GRANT} />);

        const container = screen.getByTestId('grant-container');
        expect(container).not.toHaveClass('adyen-pe-card--filled');

        const status = screen.getByText('Revoked');
        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('adyen-pe-tag--warning');

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toHaveTextContent('Requested funds');
        expect(amountLabel).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$20,000.00');
        expect(amount).toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.queryByRole('progressbar');
        expect(progressBar).not.toBeInTheDocument();
    });

    test('renders written off grant', () => {
        render(<GrantItem grant={WRITTEN_OFF_GRANT} />);

        const container = screen.getByTestId('grant-container');
        expect(container).not.toHaveClass('adyen-pe-card--filled');

        const status = screen.getByText('Written off');
        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('adyen-pe-tag--warning');

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toHaveTextContent('Requested funds');
        expect(amountLabel).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$20,000.00');
        expect(amount).toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.queryByRole('progressbar');
        expect(progressBar).not.toBeInTheDocument();
    });
});
