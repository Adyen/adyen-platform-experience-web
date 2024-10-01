/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, test, expect } from 'vitest';
import Slider from './Slider';

describe('Slider', () => {
    test('renders the slider with default attributes', () => {
        render(<Slider />);
        const slider: HTMLInputElement = screen.getByRole('slider');

        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAttribute('min', '0');
        expect(slider).toHaveAttribute('max', '100');
        expect(slider).toHaveAttribute('step', '1');
        expect(slider.value).toBe('0');
    });

    test('renders the slider with custom min, max, and step', () => {
        render(<Slider min={10} max={50} step={5} value={20} />);

        const slider: HTMLInputElement = screen.getByRole('slider');
        expect(slider).toHaveAttribute('min', '10');
        expect(slider).toHaveAttribute('max', '50');
        expect(slider).toHaveAttribute('step', '5');
        expect(slider.value).toBe('20');
    });

    test('updates the value when slider is changed', async () => {
        render(<Slider />);

        const slider: HTMLInputElement = screen.getByRole('slider');

        fireEvent.input(slider, { target: { value: '50' } });

        expect(slider.value).toBe('50');
    });

    test('calls onValueChange callback when the value changes', async () => {
        const handleValueChange = (value: number) => {
            expect(value).toBe(27);
        };
        render(<Slider onValueChange={handleValueChange} />);

        const slider: HTMLInputElement = screen.getByRole('slider');
        fireEvent.input(slider, { target: { value: '27' } });
    });

    test.each([
        { value: 50, min: 0, max: 100, expectedProgress: '50% 100%' },
        { value: 25, min: 0, max: 100, expectedProgress: '25% 100%' },
        { value: 75, min: 0, max: 100, expectedProgress: '75% 100%' },
        { value: 10, min: 0, max: 50, expectedProgress: '20% 100%' },
        { value: 30, min: 10, max: 40, expectedProgress: '67% 100%' },
        // Floating point values
        { value: 0.5, min: 0, max: 1, step: 0.1, expectedProgress: '50% 100%' },
        { value: 0.1, min: 0, max: 1, step: 0.1, expectedProgress: '10% 100%' },
        { value: 1.5, min: 0, max: 10, step: 0.1, expectedProgress: '15% 100%' },
        { value: 2.75, min: 0, max: 10, step: 0.05, expectedProgress: '28% 100%' },
        // Inverted min/max (invalid case)
        { value: 75, min: 100, max: 0, expectedProgress: '0% 100%' },
        // Negative values
        { value: -50, min: -100, max: 0, expectedProgress: '50% 100%' },
        { value: -75, min: -100, max: 0, expectedProgress: '25% 100%' },
        { value: -25, min: -100, max: 0, expectedProgress: '75% 100%' },
        { value: 0, min: -50, max: 50, expectedProgress: '50% 100%' },
        { value: -25, min: -50, max: 50, expectedProgress: '25% 100%' },
        { value: -100, min: -100, max: 100, expectedProgress: '0% 100%' },
        { value: 100, min: -100, max: 100, expectedProgress: '100% 100%' },
        { value: -50, min: -100, max: 100, expectedProgress: '25% 100%' },
    ])('calculates correct progress for value: $value, min: $min, max: $max', ({ value, min, max, expectedProgress, step }) => {
        render(<Slider min={min} max={max} value={value} step={step} />);
        const slider: HTMLInputElement = screen.getByRole('slider');
        expect(slider).toHaveStyle({ backgroundSize: expectedProgress });
    });

    test('does not exceed max when value exceeds max', async () => {
        render(<Slider max={100} value={150} />);

        const slider: HTMLInputElement = screen.getByRole('slider');
        expect(slider.value).toBe('100');
        expect(slider).toHaveStyle({ backgroundSize: '100% 100%' });
    });

    test('does not go below min when value is negative', async () => {
        render(<Slider min={0} value={-10} />);

        const slider: HTMLInputElement = screen.getByRole('slider');
        expect(slider.value).toBe('0');
        expect(slider).toHaveStyle({ backgroundSize: '0% 100%' });
    });

    test('updates progress when initial value changes', () => {
        const { rerender } = render(<Slider value={0} />);
        const slider: HTMLInputElement = screen.getByRole('slider');
        expect(slider.value).toBe('0');
        expect(slider).toHaveStyle({ backgroundSize: '0% 100%' });

        rerender(<Slider value={80} />);
        expect(slider.value).toBe('80');
        expect(slider).toHaveStyle({ backgroundSize: '80% 100%' });
    });
});
