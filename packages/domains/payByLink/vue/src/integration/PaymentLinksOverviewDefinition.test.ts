import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import type { DomainComponentCreateInput, DomainComponentInstance } from '@integration-components/domain-integration';
import { createPaymentLinksOverview } from './createPaymentLinksOverview';
import { PaymentLinksOverviewDefinition } from './PaymentLinksOverviewDefinition';
import type { PayByLinkDependencies, PaymentLinksOverviewDomainProps } from './types';

vi.mock('./createPaymentLinksOverview', () => ({
    createPaymentLinksOverview: vi.fn(),
}));

describe('PaymentLinksOverviewDefinition', () => {
    test('creates the domain instance without SDK UIElement props', async () => {
        const dependencies = {} as PayByLinkDependencies;
        const props: PaymentLinksOverviewDomainProps = {};
        const instance: DomainComponentInstance<Partial<PaymentLinksOverviewDomainProps>, Element | string> = {
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn(),
        };

        vi.mocked(createPaymentLinksOverview).mockReturnValue(instance);

        expectTypeOf(PaymentLinksOverviewDefinition.create)
            .parameter(0)
            .toEqualTypeOf<DomainComponentCreateInput<PaymentLinksOverviewDomainProps, PayByLinkDependencies>>();

        await expect(Promise.resolve(PaymentLinksOverviewDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createPaymentLinksOverview).toHaveBeenCalledWith(props, dependencies);
    });
});
