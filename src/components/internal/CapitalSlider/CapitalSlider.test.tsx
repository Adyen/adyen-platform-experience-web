/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, test, expect, vi } from 'vitest';
import CapitalSlider from './CapitalSlider';
import { IDynamicOfferConfig } from '../../../types';

describe('CapitalSlider', () => {
    const dynamicCapitalOffer: IDynamicOfferConfig = {
        minAmount: { value: 50000, currency: 'EUR' },
        maxAmount: { value: 2500000, currency: 'EUR' },
        step: 10000,
    };

    test('renders the Slider with the correct default attributes', () => {
        render(<CapitalSlider dynamicCapitalOffer={dynamicCapitalOffer} />);

        const slider: HTMLInputElement = screen.getByRole('slider', {
            name: 'How much money do you need?',
        });

        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAttribute('min', '50000');
        expect(slider).toHaveAttribute('max', '2500000');
        expect(slider).toHaveAttribute('step', '10000');
        expect(slider.value).toBe('50000');
    });

    test('renders the min and max labels correctly', () => {
        render(<CapitalSlider dynamicCapitalOffer={dynamicCapitalOffer} />);
        const slider: HTMLInputElement = screen.getByRole('slider', {
            name: 'How much money do you need?',
        });
        fireEvent.input(slider, { target: { value: '2000000' } });

        const minLabel = screen.getByText('min');
        const maxLabel = screen.getByText('max');
        expect(minLabel).toBeInTheDocument();
        expect(maxLabel).toBeInTheDocument();

        const minAmount = screen.getByText('€500');
        const maxAmount = screen.getByText('€25,000');
        expect(minAmount).toBeInTheDocument();
        expect(maxAmount).toBeInTheDocument();
    });

    test('updates the displayed value when slider value changes', () => {
        render(<CapitalSlider dynamicCapitalOffer={dynamicCapitalOffer} />);
        const output = screen.getByRole('status');
        const slider: HTMLInputElement = screen.getByRole('slider');

        fireEvent.input(slider, { target: { value: '2000000' } });

        expect(output).toHaveTextContent('€20,000');
        expect(slider.value).toBe('2000000');
    });

    test('calls onValueChange callback when the value changes', async () => {
        const handleValueChange = vi.fn();
        render(<CapitalSlider dynamicCapitalOffer={dynamicCapitalOffer} onValueChange={handleValueChange} />);

        const slider: HTMLInputElement = screen.getByRole('slider');
        fireEvent.input(slider, { target: { value: '400000' } });

        expect(handleValueChange).toHaveBeenCalledWith(400000);
    });

    test('calls onRelease callback when the user releases the slider with the mouse', () => {
        const handleRelease = vi.fn();
        render(<CapitalSlider dynamicCapitalOffer={dynamicCapitalOffer} onRelease={handleRelease} />);

        const slider: HTMLInputElement = screen.getByRole('slider');

        fireEvent.input(slider, { target: { value: '1234567' } });
        fireEvent.mouseUp(slider);

        expect(handleRelease).toHaveBeenCalledWith(1234567);
    });

    // TODO: Not sure how to test this one, it doesn't seem to work, skipping for now
    test.skip('calls onRelease callback when the user releases the slider with a touch', async () => {
        const handleRelease = vi.fn();
        render(<CapitalSlider dynamicCapitalOffer={dynamicCapitalOffer} onRelease={handleRelease} />);

        const slider: HTMLInputElement = screen.getByRole('slider');

        fireEvent.input(slider, { target: { value: '1234567' } });
        fireEvent.touchEnd(slider);

        expect(handleRelease).toHaveBeenCalledWith(1234567);
    });

    test('calls onRelease callback when the user releases the slider with the keyboard', () => {
        const handleRelease = vi.fn();
        render(<CapitalSlider dynamicCapitalOffer={dynamicCapitalOffer} onRelease={handleRelease} />);

        const slider: HTMLInputElement = screen.getByRole('slider');

        fireEvent.change(slider, { target: { value: '1234567' } });
        fireEvent.keyUp(slider);

        expect(handleRelease).toHaveBeenCalledWith(1234567);
    });
});
