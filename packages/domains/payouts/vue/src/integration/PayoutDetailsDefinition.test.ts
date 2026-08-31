import { describe, expect, test, vi } from 'vitest';
import { createPayoutDetails } from './createPayoutDetails';
import { PayoutDetailsDefinition } from './PayoutDetailsDefinition';
import type { PayoutDetailsDomainProps, PayoutsDependencies } from './types';

vi.mock('./createPayoutDetails', () => ({
    createPayoutDetails: vi.fn(),
}));

describe('PayoutDetailsDefinition', () => {
    test('creates the standalone detail component', async () => {
        const dependencies = {} as PayoutsDependencies;
        const props = {} as PayoutDetailsDomainProps;
        const instance = { mount: vi.fn(), unmount: vi.fn(), update: vi.fn() };
        vi.mocked(createPayoutDetails).mockReturnValue(instance);

        await expect(Promise.resolve(PayoutDetailsDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createPayoutDetails).toHaveBeenCalledWith(props, dependencies, 'standalone');
    });
});
