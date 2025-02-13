/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/preact';
import { describe, test, expect } from 'vitest';
import { GrantItem } from './GrantItem';
import { ACTIVE_GRANT, FAILED_GRANT, PENDING_GRANT, REPAID_GRANT, REVOKED_GRANT, WRITTEN_OFF_GRANT } from '../../../../../../mocks/mock-data';

const dateRegex = /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/;

describe('GrantItem', () => {
    test('renders active grant', () => {
        render(<GrantItem grant={ACTIVE_GRANT} />);

        const termEndsLabel = screen.getAllByText('Term ends:')[0]!;
        const repaymentPeriodEndDate = screen.getAllByText(dateRegex)[0]!;
        const container = termEndsLabel.closest('.adyen-pe-expandable-card__container')!;
        expect(container).not.toHaveClass('adyen-pe-expandable-card__container--filled');

        expect(termEndsLabel).toBeInTheDocument();
        expect(repaymentPeriodEndDate).toBeInTheDocument();

        const amountLabel = screen.getAllByTestId('grant-amount-label')[0]!;
        expect(amountLabel).toBeInTheDocument();
        expect(amountLabel).toHaveTextContent('Remaining');
        expect(amountLabel).toHaveClass('adyen-pe-typography--caption');

        const amount = screen.getAllByText('$8,220.00')[0]!;
        expect(amount).toBeInTheDocument();
        expect(amount).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.getAllByRole('progressbar')[0]!;
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '1200000');
        expect(progressBar).toHaveAttribute('aria-valuemax', '2022000');

        const expandButton = screen.getByTestId('expand-button');
        const collapseButton = screen.getByTestId('collapse-button');
        expect(expandButton).toBeInTheDocument();
        expect(collapseButton).toBeInTheDocument();
    });

    test('renders failed grant', () => {
        render(<GrantItem grant={FAILED_GRANT} />);

        const status = screen.getByText('Failed');
        const container = status.closest('.adyen-pe-expandable-card__container')!;
        expect(container).not.toHaveClass('adyen-pe-expandable-card__container--filled');

        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('adyen-pe-tag--error');

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toBeInTheDocument();
        expect(amountLabel).toHaveTextContent('Requested funds');
        expect(amountLabel).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$20,000.00');
        expect(amount).toBeInTheDocument();
        expect(amount).toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.queryByRole('progressbar');
        expect(progressBar).not.toBeInTheDocument();
    });

    test('renders pending grant', () => {
        render(<GrantItem grant={PENDING_GRANT} />);

        const status = screen.getByText('Pending');
        const container = status.closest('.adyen-pe-expandable-card__container')!;
        expect(container).not.toHaveClass('adyen-pe-expandable-card__container--filled');

        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('adyen-pe-tag--default');

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toBeInTheDocument();
        expect(amountLabel).toHaveTextContent('Requested funds');
        expect(amountLabel).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$20,000.00');
        expect(amount).toBeInTheDocument();
        expect(amount).toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.queryByRole('progressbar');
        expect(progressBar).not.toBeInTheDocument();
    });

    test('renders repaid grant', () => {
        render(<GrantItem grant={REPAID_GRANT} />);

        const status = screen.getByText('Fully repaid');
        const container = status.closest('.adyen-pe-expandable-card__container')!;
        expect(container).toHaveClass('adyen-pe-expandable-card__container--filled');

        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('adyen-pe-tag--light');

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toBeInTheDocument();
        expect(amountLabel).toHaveTextContent('Requested funds');
        expect(amountLabel).toHaveClass('adyen-pe-typography adyen-pe-typography--caption');

        const amount = screen.getByText('$20,000.00');
        expect(amount).toBeInTheDocument();
        expect(amount).toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.queryByRole('progressbar');
        expect(progressBar).not.toBeInTheDocument();
    });

    test('renders revoked grant', () => {
        render(<GrantItem grant={REVOKED_GRANT} />);

        const status = screen.getByText('Revoked');
        const container = status.closest('.adyen-pe-expandable-card__container')!;
        expect(container).not.toHaveClass('adyen-pe-expandable-card__container--filled');

        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('adyen-pe-tag--warning');

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toBeInTheDocument();
        expect(amountLabel).toHaveTextContent('Requested funds');
        expect(amountLabel).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$20,000.00');
        expect(amount).toBeInTheDocument();
        expect(amount).toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.queryByRole('progressbar');
        expect(progressBar).not.toBeInTheDocument();
    });

    test('renders written off grant', () => {
        render(<GrantItem grant={WRITTEN_OFF_GRANT} />);

        const status = screen.getByText('Written off');
        const container = status.closest('.adyen-pe-expandable-card__container')!;
        expect(container).not.toHaveClass('adyen-pe-expandable-card__container--filled');

        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('adyen-pe-tag--warning');

        const amountLabel = screen.getByTestId('grant-amount-label');
        expect(amountLabel).toBeInTheDocument();
        expect(amountLabel).toHaveTextContent('Requested funds');
        expect(amountLabel).not.toHaveClass('adyen-pe-grant-item__text--secondary');

        const amount = screen.getByText('$20,000.00');
        expect(amount).toBeInTheDocument();
        expect(amount).toHaveClass('adyen-pe-grant-item__text--secondary');

        const progressBar = screen.queryByRole('progressbar');
        expect(progressBar).not.toBeInTheDocument();
    });
});
