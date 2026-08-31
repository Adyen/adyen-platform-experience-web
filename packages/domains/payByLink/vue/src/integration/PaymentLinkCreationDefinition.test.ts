import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import type { DomainComponentCreateInput, DomainComponentInstance } from '@integration-components/domain-integration';
import { createPaymentLinkCreation } from './createPaymentLinkCreation';
import { PaymentLinkCreationDefinition } from './PaymentLinkCreationDefinition';
import type { PayByLinkDependencies, PaymentLinkCreationDomainProps } from './types';

vi.mock('./createPaymentLinkCreation', () => ({
    createPaymentLinkCreation: vi.fn(),
}));

describe('PaymentLinkCreationDefinition', () => {
    test('creates the domain instance without SDK UIElement props', async () => {
        const dependencies = {} as PayByLinkDependencies;
        const props: PaymentLinkCreationDomainProps = {};
        const instance: DomainComponentInstance<Partial<PaymentLinkCreationDomainProps>, Element | string> = {
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn(),
        };

        vi.mocked(createPaymentLinkCreation).mockReturnValue(instance);

        expectTypeOf(PaymentLinkCreationDefinition.create)
            .parameter(0)
            .toEqualTypeOf<DomainComponentCreateInput<PaymentLinkCreationDomainProps, PayByLinkDependencies>>();

        await expect(Promise.resolve(PaymentLinkCreationDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createPaymentLinkCreation).toHaveBeenCalledWith(props, dependencies);
    });
});
