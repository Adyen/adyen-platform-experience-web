/**
 * @vitest-environment jsdom
 */
/* eslint-disable vue/one-component-per-file */
import { createApp, defineComponent, h, nextTick, reactive } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import { PAY_BY_LINK_CONTEXT } from '../../../integration/context';
import type { PayByLinkContextRuntime, PayByLinkContextValue } from '../../../integration/types';
import { usePaymentLinkFormData } from './usePaymentLinkFormData';

describe('usePaymentLinkFormData', () => {
    test('fetches stores when the stores endpoint becomes available after mount', async () => {
        let formData: ReturnType<typeof usePaymentLinkFormData> | undefined;
        const runtimeSource = reactive({
            available: true,
            endpoints: {},
            getCdnDataset: vi.fn(),
            getCdnConfig: vi.fn(),
            refresh: vi.fn(),
            refreshing: false,
        });
        const runtime = runtimeSource as unknown as PayByLinkContextRuntime;
        const app = createApp(
            defineComponent({
                setup: () => {
                    formData = usePaymentLinkFormData(() => ({}));
                    return () => h('div');
                },
            })
        );
        const getPayByLinkStores = vi.fn().mockResolvedValue({
            data: [{ storeId: 'STORE_NY_001', storeCode: 'NY001' }],
        });

        app.provide(PAY_BY_LINK_CONTEXT, {
            i18n: { get: vi.fn(), locale: 'en-US' },
            provideTranslationOverrides: vi.fn(),
            runtime,
        } as unknown as PayByLinkContextValue);
        app.mount(document.createElement('div'));
        runtimeSource.endpoints = { getPayByLinkStores };
        await nextTick();
        await Promise.resolve();

        expect(getPayByLinkStores).toHaveBeenCalledOnce();
        expect(formData?.storesData.value).toEqual({
            data: [{ storeId: 'STORE_NY_001', storeCode: 'NY001' }],
        });

        app.unmount();
    });

    test('uses the current create endpoint after the runtime snapshot changes', async () => {
        let formData: ReturnType<typeof usePaymentLinkFormData> | undefined;
        const runtimeSource = reactive({
            available: true,
            endpoints: {},
            getCdnDataset: vi.fn(),
            getCdnConfig: vi.fn(),
            refresh: vi.fn(),
            refreshing: false,
        });
        const runtime = runtimeSource as unknown as PayByLinkContextRuntime;
        const app = createApp(
            defineComponent({
                setup: () => {
                    formData = usePaymentLinkFormData(() => ({}));
                    return () => h('div');
                },
            })
        );
        const createPaymentLink = vi.fn();

        app.provide(PAY_BY_LINK_CONTEXT, {
            i18n: { get: vi.fn(), locale: 'en-US' },
            provideTranslationOverrides: vi.fn(),
            runtime,
        } as unknown as PayByLinkContextValue);
        app.mount(document.createElement('div'));
        runtimeSource.endpoints = { createPBLPaymentLink: createPaymentLink };
        await nextTick();

        expect(formData?.createPaymentLink.value).toBe(createPaymentLink);

        app.unmount();
    });
});
