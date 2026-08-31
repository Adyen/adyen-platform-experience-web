import { createDomainVueInstance } from '@integration-components/composables-vue/createDomainVueInstance';
import type { DomainComponentInstance } from '@integration-components/domain-integration';
import type { Component } from 'vue';
import { createDisputesVuePlugin } from './createDisputesVuePlugin';
import type { DisputesDependencies } from './types';

export const createDisputesInstance = <Props extends object>(
    name: string,
    component: Component,
    props: Props,
    dependencies: DisputesDependencies,
    additionalProps?: Readonly<Record<string, unknown>>
): DomainComponentInstance<Partial<Props>, Element | string> =>
    createDomainVueInstance({
        additionalProps,
        component,
        createPlugin: () => createDisputesVuePlugin(dependencies),
        name,
        props,
    });
