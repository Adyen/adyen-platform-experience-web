import type { DomainTranslationConnection, DomainTranslationInputs, DomainTranslationProvider } from './types';
import { TranslationContractResolver } from './resolver';

type TranslationListener = (inputs: DomainTranslationInputs<string>) => void;

export class CoreDomainTranslations {
    readonly #callbacks = new Map<string, DomainTranslationInputs<string>['getCustomTranslations']>();
    readonly #listeners = new Map<string, Set<Set<TranslationListener>>>();
    readonly #resolver: TranslationContractResolver;
    #locale?: string;

    constructor(options: Readonly<{ locale?: string; resolver: TranslationContractResolver }>) {
        this.#locale = options.locale;
        this.#resolver = options.resolver;
    }

    connect(domain: string, signal: AbortSignal): DomainTranslationConnection {
        const listeners = new Set<TranslationListener>();
        const subscriptions = new Set<() => void>();
        let disposed = false;
        const domainListeners = this.#listeners.get(domain) ?? new Set<Set<TranslationListener>>();
        domainListeners.add(listeners);
        this.#listeners.set(domain, domainListeners);
        this.#callbacks.set(domain, this.#resolver.getCallback(domain));

        const translations: DomainTranslationProvider = {
            getInputs: () => this.getInputs(domain),
            subscribe: listener => {
                listeners.add(listener);
                let subscribed = true;
                const unsubscribe = () => {
                    if (!subscribed) return;
                    subscribed = false;
                    listeners.delete(listener);
                    subscriptions.delete(unsubscribe);
                    signal.removeEventListener('abort', unsubscribe);
                };
                subscriptions.add(unsubscribe);
                signal.addEventListener('abort', unsubscribe, { once: true });
                return unsubscribe;
            },
        };

        const dispose = () => {
            if (disposed) return;
            disposed = true;
            signal.removeEventListener('abort', dispose);
            for (const unsubscribe of [...subscriptions]) unsubscribe();
            listeners.clear();
            domainListeners.delete(listeners);
            if (!domainListeners.size && this.#listeners.get(domain) === domainListeners) {
                this.#listeners.delete(domain);
                this.#callbacks.delete(domain);
            }
        };
        signal.addEventListener('abort', dispose, { once: true });

        return {
            dispose,
            translations,
        };
    }

    getInputs<DomainKey extends string>(domain: string): DomainTranslationInputs<DomainKey> {
        return {
            getCustomTranslations: this.#resolver.getCallback<DomainKey>(domain),
            locale: this.#locale,
        };
    }

    refresh(locale?: string): boolean {
        const localeChanged = locale !== this.#locale;
        this.#locale = locale;
        let changed = localeChanged;

        for (const [domain, listenerGroups] of this.#listeners) {
            const callback = this.#resolver.getCallback(domain);
            if (!localeChanged && callback === this.#callbacks.get(domain)) continue;

            changed = true;
            this.#callbacks.set(domain, callback);
            const inputs = this.getInputs(domain);
            for (const listeners of listenerGroups) {
                for (const listener of listeners) listener(inputs);
            }
        }

        return changed;
    }
}
