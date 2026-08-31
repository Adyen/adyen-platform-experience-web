import { describe, expect, test, vi } from 'vitest';
import { createTransactionDetails } from './createTransactionDetails';
import { TransactionDetailsDefinition } from './TransactionDetailsDefinition';
import type { TransactionDetailsDomainProps, TransactionsDependencies } from './types';

vi.mock('./createTransactionDetails', () => ({
    createTransactionDetails: vi.fn(),
}));

describe('TransactionDetailsDefinition', () => {
    test('creates the standalone detail component', async () => {
        const dependencies = {} as TransactionsDependencies;
        const props = {} as TransactionDetailsDomainProps;
        const instance = { mount: vi.fn(), unmount: vi.fn(), update: vi.fn() };
        vi.mocked(createTransactionDetails).mockReturnValue(instance);

        await expect(Promise.resolve(TransactionDetailsDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createTransactionDetails).toHaveBeenCalledWith(props, dependencies, 'standalone');
    });
});
