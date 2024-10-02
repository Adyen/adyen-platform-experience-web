import { clamp } from '../../../utils';

/**
 * Calculates the progress percentage of a slider based on the current value, min/max range, and step size.
 * This method ensures the value snaps to the nearest step,
 * handles invalid ranges, and clamps the progress between 0% and 100%.
 *
 * @param currentValue - The current value of the slider.
 * @param min - The minimum allowed value of the slider.
 * @param max - The maximum allowed value of the slider.
 * @param step - The step size that defines the increment/decrement of the slider value.
 * @returns The progress percentage (from 0% to 100%) based on the snapped value.
 */

export function calculateProgress(currentValue: number, min: number, max: number, step: number): number {
    // If the min is greater than max, return 0% progress as it's an invalid range.
    if (min >= max) return 0;

    // Handle zero step size
    const effectiveStep = step > 0 ? step : 1;

    // Check for cases where step cannot be accommodated in the range
    if (effectiveStep > max - min) return 0;

    // Snap the current value to the nearest step
    const snappedValue = Math.round((currentValue - min) / effectiveStep) * effectiveStep + min;

    // Calculate the raw progress percentage by checking how far the snapped value is between min and max.
    const percentage = ((snappedValue - min) * 100) / (max - min);

    // Clamp the percentage between 0% and 100% to handle out-of-bounds values.
    return Number(clamp(0, percentage, 100).toFixed(2));
}
