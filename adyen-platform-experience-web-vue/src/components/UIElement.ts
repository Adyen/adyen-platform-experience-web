import { createApp, h, shallowReactive, type App, type Component } from 'vue';
import { createI18n } from 'vue-i18n';
import '@adyen/bento-vue3/styles/bento-light';

/**
 * Generalized Vue mounting wrapper, analogous to BaseElement/UIElement in the Preact package.
 * Provides imperative mount/unmount/update lifecycle for any Vue component.
 *
 * Usage:
 *   const element = new UIElement(MyComponent, { ...props });
 *   element.mount('#container');   // or element.mount(domNode)
 *   element.update({ someProp: newValue });
 *   element.unmount();
 */
export class UIElement<P extends Record<string, any>> {
    protected _app: App | null = null;
    protected _node: HTMLElement | null = null;
    protected _mountRoot: HTMLElement | null = null;
    protected _props: P;
    protected _reactiveProps: P;
    protected _component: Component;

    constructor(component: Component, props: P) {
        this._component = component;
        this._props = { ...props };
        this._reactiveProps = shallowReactive({ ...props }) as P;
    }

    /**
     * Mounts the component into the DOM.
     * Creates a fresh child element inside the container to avoid conflicts
     * when multiple mounts target the same container (e.g. React strict mode).
     * @param domNode - CSS selector string or HTMLElement to mount into
     * @returns this - the element instance
     */
    public mount(domNode: string): this;
    public mount(domNode: HTMLElement): this;
    public mount(domNode: string | HTMLElement): this {
        const node = typeof domNode === 'string' ? document.querySelector<HTMLElement>(domNode) : domNode;

        if (!node) throw new Error('Component could not mount. Root node was not found.');

        if (this._node) this.unmount();

        // Clear any stale content left by a previous instance (e.g. React strict mode re-runs)
        node.innerHTML = '';

        this._node = node;

        // Mount into a fresh child element so Vue never sees a re-used host
        this._mountRoot = document.createElement('div');
        node.appendChild(this._mountRoot);

        const reactiveProps = this._reactiveProps;
        const component = this._component;

        this._app = createApp({
            setup() {
                return () => h(component, reactiveProps);
            },
        });

        this._app.use(
            createI18n({
                locale: this._props.core?.i18n?.locale || 'en-US',
                fallbackLocale: 'en-US',
                fallbackRoot: false,
                allowComposition: true,
            })
        );

        this._app.mount(this._mountRoot);
        return this;
    }

    /**
     * Updates props and reactively re-renders the mounted component.
     * @param props - partial props to merge
     * @returns this - the element instance
     */
    public update(props: Partial<P>): this {
        this._props = { ...this._props, ...props };
        Object.assign(this._reactiveProps, props);
        return this;
    }

    /**
     * Unmounts the component from the DOM.
     * @returns this - the element instance
     */
    public unmount(): this {
        if (this._app) {
            this._app.unmount();
            this._app = null;
        }
        if (this._mountRoot && this._node) {
            this._node.removeChild(this._mountRoot);
            this._mountRoot = null;
        }
        return this;
    }
}
