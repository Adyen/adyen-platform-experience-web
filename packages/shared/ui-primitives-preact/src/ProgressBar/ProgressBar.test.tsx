/**
 * @vitest-environment jsdom
 */

import { render, screen, within } from '@testing-library/preact';
import { describe, test, expect } from 'vitest';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
    test('renders the progress bar with correct aria attributes', () => {
        const value = 30;
        const max = 100;
        render(<ProgressBar value={value} max={max} />);

        const progressBar = screen.getByRole('progressbar');

        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', String(value));
        expect(progressBar).toHaveAttribute('aria-valuemax', String(max));
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuetext', `${value}%`);
    });

    test('should apply the provided className', () => {
        const value = 1;
        const customClassName = 'class-name';
        render(<ProgressBar value={value} className={customClassName} />);

        const progressBar = screen.getByRole('progressbar');

        expect(progressBar).toHaveClass(customClassName);
    });

    test('renders the correct percentage based on value and max', () => {
        const value = 30;
        const max = 60;
        const labels = { current: 'Current Value' };

        render(<ProgressBar value={value} max={max} labels={labels} />);

        const fillElement = within(screen.getByRole('progressbar')).getByLabelText(labels.current);

        expect(fillElement).toHaveStyle(`width: ${(value / max) * 100}%`);
    });

    test('renders the correct labels for current and max', () => {
        const labels = { current: 'Current Value', max: 'Max Value' };
        render(<ProgressBar value={50} labels={labels} />);

        expect(screen.getByText(labels.current)).toBeInTheDocument();
        expect(screen.getByText(labels.max)).toBeInTheDocument();
    });

    test('hides legend if labels are not provided', () => {
        render(<ProgressBar value={30} />);
        const legendElement = screen.queryByText(/Current Value/i);
        expect(legendElement).not.toBeInTheDocument();
    });

    test('displays the custom aria-label if provided', () => {
        const labels = { current: 'Current Value', ariaLabel: 'Custom Progress Bar' };
        render(<ProgressBar value={40} labels={labels} />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-label', 'Custom Progress Bar');
    });

    test('does not exceed 100% width when value is greater than max', () => {
        const value = 200;
        const max = 150;
        const labels = { current: 'Current Value' };
        render(<ProgressBar value={value} max={max} labels={labels} />);

        const fillElement = within(screen.getByRole('progressbar')).getByLabelText(labels.current);
        expect(fillElement).toHaveStyle(`width: 100%`);
    });

    test('should stay at 0% when value is negative', () => {
        const value = -200;
        const max = 100;
        const labels = { current: 'Negative Value' };
        render(<ProgressBar value={value} max={max} labels={labels} />);

        const fillElement = within(screen.getByRole('progressbar')).getByLabelText(labels.current);
        expect(fillElement).toHaveStyle(`width: 0%`);
    });

    test('renders progress bar with correct width accounting for float precision', () => {
        const value = 29;
        const max = 100;
        const labels = { current: 'Negative Value' };
        render(<ProgressBar value={value} max={max} labels={labels} />);

        const fillElement = within(screen.getByRole('progressbar')).getByLabelText(labels.current);
        expect(fillElement).toHaveStyle(`width: 29%`);
    });
});
