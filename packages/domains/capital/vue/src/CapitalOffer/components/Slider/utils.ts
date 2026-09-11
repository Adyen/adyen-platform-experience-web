import { clamp } from '@integration-components/utils';

export function calculateProgress(currentValue: number, min: number, max: number, step: number): number {
    if (min >= max) return 0;

    const effectiveStep = step > 0 ? step : 1;
    if (effectiveStep > max - min) return 0;

    const snappedValue = Math.round((currentValue - min) / effectiveStep) * effectiveStep + min;
    const percentage = ((snappedValue - min) * 100) / (max - min);

    return Number(clamp(0, percentage, 100).toFixed(2));
}
