import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import type { DomainComponentCreateInput, DomainComponentInstance } from '@integration-components/domain-integration';
import { createPaymentLinkDetails } from './createPaymentLinkDetails';
import { PaymentLinkDetailsDefinition } from './PaymentLinkDetailsDefinition';
import type { PayByLinkDependencies, PaymentLinkDetailsDomainProps } from './types';

vi.mock('./createPaymentLinkDetails', () => ({
    createPaymentLinkDetails: vi.fn(),
}));

describe('PaymentLinkDetailsDefinition', () => {
    test('creates the domain instance without SDK UIElement props', async () => {
        const dependencies = {} as PayByLinkDependencies;
        const props: PaymentLinkDetailsDomainProps = { id: 'PL_1' };
        const instance: DomainComponentInstance<Partial<PaymentLinkDetailsDomainProps>, Element | string> = {
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn(),
        };

        vi.mocked(createPaymentLinkDetails).mockReturnValue(instance);

        expectTypeOf(PaymentLinkDetailsDefinition.create)
            .parameter(0)
            .toEqualTypeOf<DomainComponentCreateInput<PaymentLinkDetailsDomainProps, PayByLinkDependencies>>();

        await expect(Promise.resolve(PaymentLinkDetailsDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createPaymentLinkDetails).toHaveBeenCalledWith(props, dependencies);
    });
});
