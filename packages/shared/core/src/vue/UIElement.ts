import { createApp, reactive, type App, type Component } from 'vue';
import { createI18n as createVueI18n } from 'vue-i18n';

/**
 * Base class that mirrors the Preact BaseElement/UIElement mount/update/unmount lifecycle
 * for Vue components. Consumers instantiate a subclass with a set of props, call mount(target)
 * to render, update(props) to patch reactively, and unmount() to tear down.
 *
 *     const reportsOverview = new ReportsOverviewElement({ core, balanceAccountId: 'BA...' });
 *     reportsOverview.mount('#reports-container');
 *     reportsOverview.update({ balanceAccountId: 'BA_NEW' });
 *     reportsOverview.unmount();
 */
export class UIElement<Props extends Record<string, any>> {
    protected _component: Component;
    protected _props: Props;
    protected _app: App | null = null;
    protected _target: Element | null = null;

    constructor(component: Component, props: Props) {
        this._component = component;
        this._props = reactive({ ...(props as Record<string, unknown>) }) as Props;
    }

    public mount(target: Element | string): this {
        if (this._app) this.unmount();

        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) throw new Error(`[UIElement] Mount target not found: ${String(target)}`);

        this._target = el;
        this._app = createApp(this._component, this._props as Record<string, unknown>);

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
