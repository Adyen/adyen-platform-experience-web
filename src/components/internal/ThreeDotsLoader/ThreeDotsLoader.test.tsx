/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/preact';
import ThreeDotsLoader from './ThreeDotsLoader';

describe('ThreeDotsLoader', () => {
    test('renders with default props', () => {
        render(<ThreeDotsLoader />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
    });

    test('renders inline variant', () => {
        render(<ThreeDotsLoader inline />);
        expect(screen.getByTestId('three-dots-loader')).toHaveClass('adyen-pe-three-dots-loader__wrapper--inline');
    });

    test('renders small size', () => {
        render(<ThreeDotsLoader size="small" />);
        expect(screen.getByTestId('three-dots-container')).toHaveClass('adyen-pe-three-dots-loader__loader--small');
    });

    test('renders medium size', () => {
        render(<ThreeDotsLoader size="medium" />);
        expect(screen.getByTestId('three-dots-container')).toHaveClass('adyen-pe-three-dots-loader__loader--medium');
    });

    test('renders large size', () => {
        render(<ThreeDotsLoader size="large" />);
        expect(screen.getByTestId('three-dots-container')).toHaveClass('adyen-pe-three-dots-loader__loader--large');
    });

    test('renders three dots', () => {
        render(<ThreeDotsLoader />);
        const dots = screen.getAllByTestId('three-dots-dot');
        expect(dots).toHaveLength(3);
    });

    test('custom ariaLabel is applied', () => {
        render(<ThreeDotsLoader ariaLabel="Custom loading text" />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Custom loading text');
    });
});
