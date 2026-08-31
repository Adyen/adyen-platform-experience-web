/**
 * @vitest-environment jsdom
 */
import { defineComponent, h, inject, type Ref } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import { COMPONENT_REF_KEY } from '@integration-components/core/vue/Context/constants';
import { createDomainVueInstance } from './createDomainVueInstance';
import type { DisposableVuePlugin } from './createDomainVuePlugin';

describe('createDomainVueInstance', () => {
    test('provides the standard component shell as the portable component mount root', () => {
        let componentRef: Ref<HTMLElement | null> | undefined;
        const Component = defineComponent({
            setup: () => {
                componentRef = inject(COMPONENT_REF_KEY);
                return () => h('div', { id: 'content' });
            },
        });
        const instance = createDomainVueInstance({
            component: Component,
            createPlugin: () =>
                ({
                    dispose: vi.fn(),
                    install: vi.fn(),
                }) as DisposableVuePlugin,
            name: 'test component',
            props: {},
        });
        const target = document.createElement('div');

        instance.mount(target);

        expect(componentRef?.value).toBeInstanceOf(HTMLElement);
        expect(componentRef?.value).toMatchObject({
            className: 'adyen-pe-component',
            tagName: 'SECTION',
        });
        expect(componentRef?.value?.contains(target.querySelector('#content')!)).toBe(true);
        expect(target.querySelector('[data-testid="component-root"] > div > #content')).not.toBeNull();

        instance.unmount();
    });
});
