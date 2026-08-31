import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import type { DomainComponentCreateInput, DomainComponentInstance } from '@integration-components/domain-integration';
import { createPaymentLinkSettings } from './createPaymentLinkSettings';
import { PaymentLinkSettingsDefinition } from './PaymentLinkSettingsDefinition';
import type { PayByLinkDependencies, PaymentLinkSettingsDomainProps } from './types';

vi.mock('./createPaymentLinkSettings', () => ({
    createPaymentLinkSettings: vi.fn(),
}));

describe('PaymentLinkSettingsDefinition', () => {
    test('creates the domain instance without SDK UIElement props', async () => {
        const dependencies = {} as PayByLinkDependencies;
        const props: PaymentLinkSettingsDomainProps = {};
        const instance: DomainComponentInstance<Partial<PaymentLinkSettingsDomainProps>, Element | string> = {
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn(),
        };

        vi.mocked(createPaymentLinkSettings).mockReturnValue(instance);

        expectTypeOf(PaymentLinkSettingsDefinition.create)
            .parameter(0)
            .toEqualTypeOf<DomainComponentCreateInput<PaymentLinkSettingsDomainProps, PayByLinkDependencies>>();

        await expect(Promise.resolve(PaymentLinkSettingsDefinition.create({ dependencies, props }))).resolves.toBe(instance);
        expect(createPaymentLinkSettings).toHaveBeenCalledWith(props, dependencies);
    });
});
