import { describe, expect, test, vi } from 'vitest';
import { createDisputeManagement } from './createDisputeManagement';
import { DisputeManagementDefinition } from './DisputeManagementDefinition';
import type { DisputeManagementDomainProps, DisputesDependencies } from './types';

vi.mock('./createDisputeManagement', () => ({
    createDisputeManagement: vi.fn(),
}));

describe('DisputeManagementDefinition', () => {
    test('creates the standalone detail component', async () => {
        const dependencies = {} as DisputesDependencies;
        const props = {} as DisputeManagementDomainProps;
        const instance = { mount: vi.fn(), unmount: vi.fn(), update: vi.fn() };
        vi.mocked(createDisputeManagement).mockReturnValue(instance);

        await expect(Promise.resolve(DisputeManagementDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createDisputeManagement).toHaveBeenCalledWith(props, dependencies, 'standalone');
    });
});
