import { isNumber, isSymbol } from './is';

export const clamp = <T extends number = number>(min: T, value: T, max: T) => {
    if (Math.min(min, max) !== min) [min, max] = [max, min];
    return Math.max(min, Math.min(value, max));
};

export const isBitSafeInteger = (value?: any): value is number => !isSymbol(value) && value === ~~value;
export const isInfinity = (value?: any): value is number => isNumber(value) && 1 / value === 0;

export const mid = (low: number, high: number) => {
    if (Number.isInteger(low) && Number.isInteger(high)) {
        return low + Math.floor((high - low) / 2);
    }
    throw TypeError(`Expects 2 integer values: [${low}, ${high}]`);
};

export const mod = (value: number, modulo: number) => ((value % modulo) + modulo) % modulo;
