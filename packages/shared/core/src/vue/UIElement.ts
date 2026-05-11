import { createApp, h, reactive, type App, type Component } from 'vue';
import { createI18n as createVueI18n } from 'vue-i18n';
import type { ExternalComponentType } from '@integration-components/types';
import { uuid } from '@integration-components/utils';
import UIElementProvider from './UIElementProvider.vue';

/**
 * Base class that mirrors the Preact BaseElement/UIElement mount/update/unmount lifecycle
 * for Vue components. Consumers instantiate a subclass with a set of props, call mount(target)
 * to render, update(props) to patch reactively, and unmount() to tear down.
 *
 * The mounted component is automatically wrapped in the standard provider stack
 * (CoreProvider → ConfigProvider → EventDispatcherProvider) via UIElementProvider
 *
 *     const reportsOverview = new ReportsOverviewElement({ core, balanceAccountId: 'BA...' });
 *     reportsOverview.mount('#reports-container');
 *     reportsOverview.update({ balanceAccountId: 'BA_NEW' });
 *     reportsOverview.unmount();
 */
export class UIElement<Props extends Record<string, any>> {
    public static type: ExternalComponentType;

    public readonly _id = `${(this.constructor as typeof UIElement)?.type}-${uuid()}`;
    protected _component: Component;
    protected _props: Props;
    protected _app: App | null = null;
    protected _target: Element | null = null;
    protected _componentName: string | undefined;

    /**
     * Returns the core instance associated with this element, if any.
     */
    public get core(): any {
        return (this._props as any)?.core;
    }

    constructor(component: Component, props: Props, componentName?: string) {
        this._component = component;
        this._props = reactive({ ...(props as Record<string, unknown>) }) as Props;
        this._componentName = componentName;
    }

    public mount(target: Element | string): this {
        if (this._app) this.unmount();

        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) throw new Error(`[UIElement] Mount target not found: ${String(target)}`);

        this._target = el;

        const component = this._component;
        const props = this._props;
        const componentName = this._componentName;

        this._app = createApp({
            setup: () => () => {
                // Strip `core` — it is consumed by UIElementProvider and should
                // not leak into the inner component's $attrs / DOM attributes.
                const { core, ...componentProps } = props;
                return h(UIElementProvider, { core, componentName }, { default: () => h(component, componentProps) });
            },
        });

        // Bento's Vue components call `useI18n()` internally, which requires a
        // vue-i18n instance to be installed on the Vue app. Install a minimal
        // instance here so mounted components (and nested Bento primitives)
        // resolve without throwing "Need to install with `app.use` function".
        const locale = this._props?.core?.options?.locale || 'en-US';
        this._app.use(
            createVueI18n({
                legacy: false,
                locale,
                fallbackLocale: 'en-US',
                messages: { [locale]: {}, 'en-US': {} },
            })
        );

        this._app.mount(el);

        return this;
    }

    public update(props: Partial<Props>): this {
        Object.assign(this._props as Record<string, unknown>, props);
        return this;
    }

    public unmount(): this {
        this._app?.unmount();
        this._app = null;
        this._target = null;
        return this;
    }
}

export default UIElement;
