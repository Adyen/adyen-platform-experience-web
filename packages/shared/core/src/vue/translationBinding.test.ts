import { describe, expect, test, vi } from 'vitest';
import { effect, stop } from 'vue';
import { useBentoTranslationOverrides } from '@adyen/bento-vue3';
import { createDomainTranslationVueBinding } from './translationBinding';

vi.mock('@adyen/bento-vue3', () => ({
    useBentoTranslationOverrides: vi.fn(),
}));

vi.mock('vue-i18n', () => ({
    createI18n: ({ locale }: { locale: string }) => ({
        global: { locale: { value: locale } },
        install: vi.fn(),
    }),
}));

describe('DomainTranslationVueBinding', () => {
    test('reruns Vue effects that read portable i18n after translation inputs change', () => {
        const binding = createDomainTranslationVueBinding({
            inputs: {
                getCustomTranslations: () => ({ localeTranslation: 'English reports' }),
                locale: 'en-US',
            },
            source: { title: 'Reports' },
        });
        let translatedTitle = '';
        const render = vi.fn(() => {
            translatedTitle = binding.i18n.get('title');
        });
        const runner = effect(render);

        expect(translatedTitle).toBe('English reports');

        binding.sync({
            getCustomTranslations: () => ({ localeTranslation: 'Rapports' }),
            locale: 'fr-FR',
        });

        expect(translatedTitle).toBe('Rapports');
        expect(render).toHaveBeenCalledTimes(2);

        binding.sync({
            getCustomTranslations: () => ({ localeTranslation: 'Rapports mis à jour' }),
            locale: 'fr-FR',
        });

        expect(translatedTitle).toBe('Rapports mis à jour');
        expect(render).toHaveBeenCalledTimes(3);
        stop(runner);
    });

    test('synchronizes domain locale and routed Bento overrides', () => {
        const binding = createDomainTranslationVueBinding({
            inputs: {
                getCustomTranslations: key =>
                    key === 'bento.alert.close'
                        ? { defaultTranslation: 'Close', localeTranslation: 'Fermer' }
                        : { defaultTranslation: 'Reports', localeTranslation: 'Rapports' },
                locale: 'fr-FR',
            },
            source: { title: 'Reports' },
            universalKeys: ['bento.alert.close'],
        });

        binding.provideBentoOverrides();
        expect(useBentoTranslationOverrides).toHaveBeenCalledWith(binding.overrides);
        expect(binding.i18n.get('title')).toBe('Rapports');
        expect(binding.overrides['bento.alert.close']).toBe('Fermer');

        expect(binding.sync({ locale: 'en-US' })).toBe(true);
        expect(binding.i18n.get('title')).toBe('Reports');
        expect(binding.overrides['bento.alert.close']).toBeUndefined();
        expect(binding.i18n.locale).toBe('en-US');
    });
});
