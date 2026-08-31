import { createDomainVueInstance } from '@integration-components/composables-vue/createDomainVueInstance';
import type { DomainComponentInstance } from '@integration-components/domain-integration';
import type { Component } from 'vue';
import { createTransactionsVuePlugin } from './createTransactionsVuePlugin';
import type { TransactionsDependencies } from './types';

export const createTransactionsInstance = <Props extends object>(
    name: string,
    component: Component,
    props: Props,
    dependencies: TransactionsDependencies,
    additionalProps?: Readonly<Record<string, unknown>>
): DomainComponentInstance<Partial<Props>, Element | string> =>
    createDomainVueInstance({
        additionalProps,
        component,
        createPlugin: () => createTransactionsVuePlugin(dependencies),
        name,
        props,
    });
