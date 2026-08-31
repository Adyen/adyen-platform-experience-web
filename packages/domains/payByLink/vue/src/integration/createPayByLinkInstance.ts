import { createDomainVueInstance } from '@integration-components/composables-vue/createDomainVueInstance';
import type { DomainComponentInstance } from '@integration-components/domain-integration';
import type { Component } from 'vue';
import { createPayByLinkVuePlugin } from './createPayByLinkVuePlugin';
import type { PayByLinkDependencies } from './types';

export const createPayByLinkInstance = <Props extends object>(
    name: string,
    component: Component,
    props: Props,
    dependencies: PayByLinkDependencies,
    additionalProps?: Readonly<Record<string, unknown>>
): DomainComponentInstance<Partial<Props>, Element | string> =>
    createDomainVueInstance({
        additionalProps,
        component,
        createPlugin: () => createPayByLinkVuePlugin(dependencies),
        name,
        props,
    });
