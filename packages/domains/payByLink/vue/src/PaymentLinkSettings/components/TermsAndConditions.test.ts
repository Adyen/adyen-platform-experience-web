// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, ref, type App } from 'vue';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import type { IPaymentLinkTermsAndConditions } from '@integration-components/types';
import { usePaymentLinkSettingsContext } from '../composables/context';
import { useSaveAction } from '../composables/useSaveAction';
import { menuItem } from '../constants';
import type { PaymentLinkSettingsData, PaymentLinkSettingsItem, PaymentLinkSettingsPayload } from '../types';
import TermsAndConditions from './TermsAndConditions.vue';

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        BentoAlert: defineComponent({
            setup:
                (_props, { slots }) =>
                () =>
                    h('div', { role: 'alert' }, slots.description?.()),
        }),
        BentoCheckbox: () => null,
        BentoInputField: () => null,
        BentoTypography: () => null,
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
    useConfigContext: vi.fn(),
}));

vi.mock('../composables/context', () => ({
    usePaymentLinkSettingsContext: vi.fn(),
}));

vi.mock('./Requirements.vue', () => ({ default: () => null }));

const TERMS_URL = 'https://example.com/terms-and-conditions';

describe('TermsAndConditions saving', () => {
    const savePayByLinkSettings = vi.fn().mockResolvedValue({ termsOfServiceUrl: TERMS_URL });
    let app: App | undefined;
    let target: HTMLDivElement;
    let onSave: ReturnType<typeof useSaveAction>['onSave'];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key, locale: 'en-US' },
        } as unknown as ReturnType<typeof useCoreContext>);
        vi.mocked(useConfigContext).mockReturnValue({
            endpoints: { savePayByLinkSettings },
        } as unknown as ReturnType<typeof useConfigContext>);
    });

    afterEach(() => app?.unmount());

    const mount = (data: IPaymentLinkTermsAndConditions, initiallyValid = false) => {
        const payload = ref<PaymentLinkSettingsPayload>();
        const isValid = ref(initiallyValid);
        const saveActionCalled = ref(false);
        const context = {
            savedData: ref<PaymentLinkSettingsData>(data),
            setPayload: (value: PaymentLinkSettingsPayload) => {
                payload.value = value;
            },
            saveActionCalled,
            setSaveActionCalled: (value: boolean) => {
                saveActionCalled.value = value;
            },
            setIsValid: (value: boolean) => {
                isValid.value = value;
            },
            isSaving: ref(false),
            isSaveSuccess: ref(false),
            isSaveError: ref(false),
            setIsSaveSuccess: vi.fn(),
            setIsSaveError: vi.fn(),
            isShowingRequirements: ref(false),
            setIsShowingRequirements: vi.fn(),
        };
        vi.mocked(usePaymentLinkSettingsContext).mockReturnValue(context as unknown as ReturnType<typeof usePaymentLinkSettingsContext>);

        app = createApp({
            setup() {
                ({ onSave } = useSaveAction({
                    ...context,
                    payload,
                    selectedStore: ref('store-1'),
                    activeMenuItem: ref<PaymentLinkSettingsItem | null>(menuItem.termsAndConditions),
                    getIsValid: () => isValid.value,
                    setIsSaving: vi.fn(),
                    setSavedData: vi.fn(),
                }));
                return () => h(TermsAndConditions, { data, initialData: data });
            },
        });
        target = document.createElement('div');
        app.mount(target);
    };

    test('saves the already confirmed URL when it has not been changed', async () => {
        mount({ termsOfServiceUrl: TERMS_URL });
        await nextTick();
        await onSave();

        expect(savePayByLinkSettings).toHaveBeenCalledWith(
            { contentType: 'application/json', body: { termsOfServiceUrl: TERMS_URL } },
            { path: { storeId: 'store-1' } }
        );
    });

    test('does not save unconfirmed requirements when validity is left over from another form', async () => {
        mount({ termsOfServiceUrl: '' }, true);
        await nextTick();
        await onSave();
        await nextTick();

        expect(savePayByLinkSettings).not.toHaveBeenCalled();
        expect(target.querySelector('[role="alert"]')).toHaveTextContent('payByLink.settings.common.alerts.validationError');
    });
});
