/**
 * @vitest-environment jsdom
 */
import { createApp, defineComponent, h, reactive, ref } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import { MenuItem } from '../constants';
import { PAY_BY_LINK_CONTEXT } from '../../integration/context';
import type { PayByLinkContextRuntime, PayByLinkContextValue } from '../../integration/types';
import { useSaveAction } from './useSaveAction';

describe('useSaveAction', () => {
    test('uses the current save endpoint after the runtime snapshot changes', async () => {
        let onSave: (() => void) | undefined;
        const runtimeSource = reactive({
            available: true,
            endpoints: {},
            getCdnDataset: vi.fn(),
            getCdnConfig: vi.fn(),
            refresh: vi.fn(),
            refreshing: false,
        });
        const runtime = runtimeSource as unknown as PayByLinkContextRuntime;
        const savePayByLinkSettings = vi.fn().mockResolvedValue({ termsOfServiceUrl: 'https://example.com/terms' });
        const app = createApp(
            defineComponent({
                setup: () => {
                    ({ onSave } = useSaveAction({
                        activeMenuItem: ref(MenuItem.termsAndConditions),
                        getIsValid: () => true,
                        payload: ref({ termsOfServiceUrl: 'https://example.com/terms' }),
                        selectedStore: ref('store-id'),
                        setIsSaveError: vi.fn(),
                        setIsSaveSuccess: vi.fn(),
                        setIsSaving: vi.fn(),
                        setPayload: vi.fn(),
                        setSaveActionCalled: vi.fn(),
                        setSavedData: vi.fn(),
                    }));
                    return () => h('div');
                },
            })
        );

        app.provide(PAY_BY_LINK_CONTEXT, {
            i18n: { get: vi.fn() },
            provideTranslationOverrides: vi.fn(),
            runtime,
        } as unknown as PayByLinkContextValue);
        app.mount(document.createElement('div'));
        runtimeSource.endpoints = { savePayByLinkSettings };

        onSave?.();
        await vi.waitFor(() => expect(savePayByLinkSettings).toHaveBeenCalledOnce());

        app.unmount();
    });
});
