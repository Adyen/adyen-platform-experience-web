// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, ref, type App } from 'vue';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { usePaymentLinkSettingsContext } from '../composables/context';
import { useSaveAction } from '../composables/useSaveAction';
import { logoLabel } from '../constants';
import type { LogoType, PaymentLinkSettingsPayload } from '../types';
import ThemeForm from './ThemeForm.vue';

interface UploaderProps {
    label: string;
    onChange: (files?: FileList) => void;
    'onError:upload': (hasError: boolean) => void;
}

const { renderUploader, renderBrandInput } = vi.hoisted(() => ({
    renderUploader: vi.fn((_props: UploaderProps) => null),
    renderBrandInput: vi.fn((_props: { 'onUpdate:modelValue': (value: string) => void }) => null),
}));

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        BentoAlert: defineComponent({
            setup:
                (_props, { slots }) =>
                () =>
                    h('div', { role: 'alert' }, slots.description?.()),
        }),
        BentoButton: () => null,
        BentoFileUploader: renderUploader,
        BentoInputField: renderBrandInput,
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

describe('ThemeForm image submission', () => {
    const updatePayByLinkTheme = vi.fn().mockResolvedValue({ brandName: 'Test brand' });
    let app: App;
    let target: HTMLDivElement;
    let onSave: ReturnType<typeof useSaveAction>['onSave'];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key },
        } as unknown as ReturnType<typeof useCoreContext>);
        vi.mocked(useConfigContext).mockReturnValue({
            endpoints: { updatePayByLinkTheme },
        } as unknown as ReturnType<typeof useConfigContext>);

        const payload = ref<PaymentLinkSettingsPayload>();
        const isValid = ref(false);
        const saveActionCalled = ref(false);
        const context = {
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
        };
        vi.mocked(usePaymentLinkSettingsContext).mockReturnValue(context as unknown as ReturnType<typeof usePaymentLinkSettingsContext>);

        app = createApp({
            setup() {
                ({ onSave } = useSaveAction({
                    ...context,
                    payload,
                    selectedStore: ref('store-1'),
                    activeMenuItem: ref('theme'),
                    getIsValid: () => isValid.value,
                    setIsSaving: vi.fn(),
                    setSavedData: vi.fn(),
                }));
                return () => h(ThemeForm, { theme: { brandName: 'Test brand' } });
            },
        });
        target = document.createElement('div');
        app.mount(target);
    });

    afterEach(() => app?.unmount());

    const uploader = (type: LogoType) => {
        const props = renderUploader.mock.calls.findLast(([props]) => props.label === logoLabel[type])?.[0];
        expect(props).toBeDefined();
        return props!;
    };

    const selectFile = (type: LogoType, file?: File) => {
        const files = file
            ? ({
                  0: file,
                  length: 1,
                  item: (index: number) => (index === 0 ? file : null),
              } as unknown as FileList)
            : undefined;
        uploader(type).onChange(files);
    };

    const submittedPayload = () => {
        const request = updatePayByLinkTheme.mock.lastCall?.[0] as { contentType: string; body: FormData } | undefined;
        expect(request?.contentType).toBe('multipart/form-data');
        expect(request?.body).toBeInstanceOf(FormData);
        return request!.body;
    };

    test('submits both logo files without waiting for an upload error event', async () => {
        const logo = new File(['logo bytes'], 'logo.jpg', { type: 'image/jpeg' });
        const fullWidthLogo = new File(['wide logo bytes'], 'wide-logo.jpg', { type: 'image/jpeg' });

        // Bento does not emit error:upload(false) for an initially valid selection.
        selectFile('logo', logo);
        selectFile('fullWidthLogo', fullWidthLogo);
        renderBrandInput.mock.lastCall?.[0]['onUpdate:modelValue']('Updated brand');
        await nextTick();
        await onSave();

        const body = submittedPayload();
        expect(body.get('brandName')).toBe('Updated brand');
        expect(body.get('logo')).toBeInstanceOf(File);
        expect(body.get('logo')).toMatchObject({ name: logo.name, type: logo.type, size: logo.size });
        expect(body.get('fullWidthLogo')).toBeInstanceOf(File);
        expect(body.get('fullWidthLogo')).toMatchObject({ name: fullWidthLogo.name, type: fullWidthLogo.type, size: fullWidthLogo.size });
        expect(updatePayByLinkTheme).toHaveBeenCalledWith(expect.anything(), { path: { storeId: 'store-1' } });
    });

    test('does not submit a removed logo', async () => {
        selectFile('logo', new File(['logo'], 'logo.jpg', { type: 'image/jpeg' }));
        selectFile('fullWidthLogo', new File(['wide logo'], 'wide-logo.jpg', { type: 'image/jpeg' }));
        selectFile('logo');
        await onSave();

        const body = submittedPayload();
        expect(body.has('logo')).toBe(false);
        expect(body.get('fullWidthLogo')).toMatchObject({ name: 'wide-logo.jpg' });
    });

    test.each<LogoType>(['logo', 'fullWidthLogo'])('blocks saving when %s fails upload validation', async type => {
        selectFile(type, new File(['invalid image'], 'invalid.jpg', { type: 'image/jpeg' }));
        uploader(type)['onError:upload'](true);
        await nextTick();
        await onSave();

        expect(updatePayByLinkTheme).not.toHaveBeenCalled();
        expect(target.querySelector('[role="alert"]')).toHaveTextContent('payByLink.settings.alerts.validation.error');
    });

    test('shows the validation alert as soon as a logo is rejected', async () => {
        selectFile('logo', new File(['invalid image'], 'invalid.jpg', { type: 'image/jpeg' }));
        uploader('logo')['onError:upload'](true);
        await nextTick();

        expect(target.querySelector('[role="alert"]')).toHaveTextContent('payByLink.settings.alerts.validation.error');
    });

    test('changing the brand name does not bypass a logo validation error', async () => {
        selectFile('logo', new File(['invalid image'], 'invalid.jpg', { type: 'image/jpeg' }));
        uploader('logo')['onError:upload'](true);
        renderBrandInput.mock.lastCall?.[0]['onUpdate:modelValue']('Updated brand');
        await nextTick();
        await onSave();

        expect(updatePayByLinkTheme).not.toHaveBeenCalled();
        expect(target.querySelector('[role="alert"]')).toHaveTextContent('payByLink.settings.alerts.validation.error');
    });

    test('removing an invalid logo clears its validation error and allows saving', async () => {
        selectFile('logo', new File(['invalid image'], 'invalid.jpg', { type: 'image/jpeg' }));
        uploader('logo')['onError:upload'](true);
        await nextTick();

        selectFile('logo');
        await nextTick();
        await onSave();

        expect(submittedPayload().has('logo')).toBe(false);
        expect(target.querySelector('[role="alert"]')).toBeNull();
    });

    test('correcting one logo does not clear the other logo validation error', async () => {
        for (const type of ['logo', 'fullWidthLogo'] as const) {
            selectFile(type, new File(['invalid image'], 'invalid.jpg', { type: 'image/jpeg' }));
            uploader(type)['onError:upload'](true);
        }
        await nextTick();

        selectFile('logo', new File(['valid logo'], 'valid.jpg', { type: 'image/jpeg' }));
        uploader('logo')['onError:upload'](false);
        await nextTick();
        await onSave();

        expect(updatePayByLinkTheme).not.toHaveBeenCalled();
        expect(target.querySelector('[role="alert"]')).toHaveTextContent('payByLink.settings.alerts.validation.error');
    });

    test('submits a valid replacement after an upload error', async () => {
        selectFile('logo', new File(['invalid image'], 'invalid.jpg', { type: 'image/jpeg' }));
        uploader('logo')['onError:upload'](true);
        await nextTick();

        const logo = new File(['replacement'], 'replacement.jpg', { type: 'image/jpeg' });
        selectFile('logo', logo);
        uploader('logo')['onError:upload'](false);
        await nextTick();
        await onSave();

        expect(submittedPayload().get('logo')).toMatchObject({ name: logo.name, size: logo.size });
        expect(target.querySelector('[role="alert"]')).toBeNull();
    });
});
