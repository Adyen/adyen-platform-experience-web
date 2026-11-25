import { describe, expect, test } from 'vitest';
import { getBentoLoadingActionState } from './getBentoLoadingActionState';

describe('getBentoLoadingActionState', () => {
    test('should keep the button enabled while loading, even when it would otherwise be disabled', () => {
        expect(getBentoLoadingActionState(true)).toEqual({ disabled: false, state: 'loading' });
        expect(getBentoLoadingActionState(true, true)).toEqual({ disabled: false, state: 'loading' });
    });

    test('should use an explicit start state when idle', () => {
        expect(getBentoLoadingActionState(false)).toEqual({ disabled: false, state: 'start' });
    });

    test('should keep the disabled state when idle', () => {
        expect(getBentoLoadingActionState(false, true)).toEqual({ disabled: true, state: 'start' });
    });
});
