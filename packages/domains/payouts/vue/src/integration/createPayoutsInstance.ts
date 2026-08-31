import { createDomainVueInstance } from '@integration-components/composables-vue/createDomainVueInstance';
import type { DomainComponentInstance } from '@integration-components/domain-integration';
import type { Component } from 'vue';
import { createPayoutsVuePlugin } from './createPayoutsVuePlugin';
import type { PayoutsDependencies } from './types';

export const createPayoutsInstance = <Props extends object>(
    name: string,
    component: Component,
    props: Props,
    dependencies: PayoutsDependencies,
    additionalProps?: Readonly<Record<string, unknown>>
): DomainComponentInstance<Partial<Props>, Element | string> =>
    createDomainVueInstance({
        additionalProps,
        component,
        createPlugin: () => createPayoutsVuePlugin(dependencies),
        name,
        props,
    });
