import { createApp, h, provide, reactive, ref, type Component } from 'vue';
import type { DisposableVuePlugin } from './createDomainVuePlugin';
import { COMPONENT_REF_KEY } from '@integration-components/core/vue/Context/constants';
import styles from '@integration-components/style/component.module.scss';

export type VueDomainInstance<Props extends object> = Readonly<{
    mount(target: Element | string): void;
    unmount(): void;
    update(props: Partial<Props>): void;
}>;

export type CreateDomainVueInstanceOptions<Props extends object> = Readonly<{
    additionalProps?: Readonly<Record<string, unknown>>;
    component: Component;
    createPlugin(): DisposableVuePlugin;
    name: string;
    props: Props;
}>;

const resolveMountTarget = (target: Element | string, name: string): Element => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) throw new Error(`${name} mount target not found: ${String(target)}`);
    return element;
};

export const createDomainVueInstance = <Props extends object>({
    additionalProps,
    component,
    createPlugin,
    name,
    props,
}: CreateDomainVueInstanceOptions<Props>): VueDomainInstance<Props> => {
    const componentProps = reactive({ ...props }) as Props;
    let app: ReturnType<typeof createApp> | undefined;
    let plugin: DisposableVuePlugin | undefined;

    return {
        mount: target => {
            const element = resolveMountTarget(target, name);
            app?.unmount();
            plugin?.dispose();

            const nextApp = createApp({
                setup: () => {
                    const componentRef = ref<HTMLElement | null>(null);
                    provide(COMPONENT_REF_KEY, componentRef);

                    return () =>
                        h('section', { ref: componentRef, class: 'adyen-pe-component', 'data-testid': 'component-root' }, [
                            h('div', { class: styles.container }, [h(component, { ...componentProps, ...additionalProps })]),
                        ]);
                },
            });
            const nextPlugin = createPlugin();
            app = nextApp;
            plugin = nextPlugin;
            try {
                nextApp.use(nextPlugin);
                nextApp.mount(element);
            } catch (error) {
                nextPlugin.dispose();
                nextApp.unmount();
                if (app === nextApp) app = undefined;
                if (plugin === nextPlugin) plugin = undefined;
                throw error;
            }
        },
        unmount: () => {
            app?.unmount();
            plugin?.dispose();
            app = undefined;
            plugin = undefined;
        },
        update: update => {
            Object.assign(componentProps, update);
        },
    };
};
