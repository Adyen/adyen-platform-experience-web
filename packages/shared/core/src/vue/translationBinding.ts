import { reactive, ref } from 'vue';
import { createI18n as createVueI18n, type I18n } from 'vue-i18n';
import { useBentoTranslationOverrides as provideBentoTranslationOverrides } from '@adyen/bento-vue3';
import { createDomainI18n, type DomainI18n, type DomainI18nOptions, type DomainTranslationInputs } from '../translation-contract';

export type DomainTranslationVueBindingOptions<DomainKey extends string> = DomainI18nOptions<DomainKey> &
    Readonly<{
        universalKeys?: readonly string[];
    }>;

export class DomainTranslationVueBinding<DomainKey extends string> {
    public readonly i18n: DomainI18n<DomainKey>;
    public readonly overrides = reactive<Record<string, string>>({});
    public readonly vueI18n: I18n;

    readonly #domainI18n: DomainI18n<DomainKey>;
    readonly #translationRevision = ref(0);
    readonly #universalKeys: readonly string[];

    constructor(options: DomainTranslationVueBindingOptions<DomainKey>) {
        this.#domainI18n = createDomainI18n(options);
        this.i18n = new Proxy(this.#domainI18n, {
            get: (target, property) => {
                if (property === 'get') Reflect.get(this.#translationRevision, 'value');
                const value = Reflect.get(target, property, target);
                return typeof value === 'function' ? value.bind(target) : value;
            },
        });
        this.#universalKeys = options.universalKeys ?? [];
        this.vueI18n = createVueI18n({
            legacy: false,
            locale: this.i18n.locale,
            fallbackLocale: 'en-US',
            messages: { [this.i18n.locale]: {}, 'en-US': {} },
        });
        this.sync(options.inputs ?? {}, true);
    }

    provideBentoOverrides(): void {
        provideBentoTranslationOverrides(this.overrides);
    }

    sync(inputs: DomainTranslationInputs<DomainKey>, force = false): boolean {
        const changed = this.#domainI18n.update(inputs);
        if (!force && !changed) return false;

        const locale = this.vueI18n?.global.locale;
        if (locale && typeof locale === 'object' && 'value' in locale) {
            locale.value = this.i18n.locale;
        }

        for (const key of this.#universalKeys) {
            const template = this.#domainI18n.resolveTemplate(key);
            if (template === undefined) {
                delete this.overrides[key];
            } else {
                this.overrides[key] = template;
            }
        }

        if (changed) this.#translationRevision.value++;

        return changed;
    }
}

export const createDomainTranslationVueBinding = <DomainKey extends string>(
    options: DomainTranslationVueBindingOptions<DomainKey>
): DomainTranslationVueBinding<DomainKey> => new DomainTranslationVueBinding(options);
